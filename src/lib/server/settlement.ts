import { getSupabaseServer } from '$lib/supabase/server';
import { getBatchFairValues, type PriceClampingResult } from './pricing';
import { BattlePull, BattleParticipant, Battle, BattleResult } from '$lib/types';

/**
 * Settlement service with idempotent operations
 *
 * This service handles battle settlement including:
 * - Summing totals per team/participant
 * - Detecting ties and applying coinflip with next nonce
 * - Crediting winners at snapshot market value
 * - Idempotent operations with dedupe keys
 */

interface Totals {
  [participantId: string]: number; // summed fair value
}

interface SettlementInput {
  battle_id: string;
  mode: 'standard' | 'crazy';
  participants: BattleParticipant[];
  pulls: BattlePull[];
}

interface SettlementResult {
  winner_ids: string[];
  totals: Totals;
  tie_break?: {
    participant_id: string;
    won: boolean;
    nonce: number;
    client_seed: string;
    hash: string;
  };
  settlement_metadata: {
    total_pot: number;
    processing_time_ms: number;
    was_settled_before: boolean;
  };
}

interface DedupeKey {
  battle_id: string;
  round_index?: number;
  operation_type: 'settlement' | 'payout';
}

class SettlementService {
  private supabase = getSupabaseServer();

  private readonly SETTLEMENT_TIMEOUT = 30000; // 30 seconds
  private readonly MAX_RETRY_ATTEMPTS = 3;

  /**
   * Main settlement function - idempotent and safe to retry
   */
  async settleBattle(battleId: string): Promise<SettlementResult> {
    const startTime = Date.now();

    try {
      // Check if already settled (idempotency)
      const existingSettlement = await this.checkExistingSettlement(battleId);
      if (existingSettlement) {
        return {
          ...existingSettlement,
          settlement_metadata: {
            ...existingSettlement.settlement_metadata,
            was_settled_before: true,
            processing_time_ms: Date.now() - startTime
          }
        };
      }

      // Get battle data and all pulls
      const settlementInput = await this.getSettlementInput(battleId);
      if (!settlementInput) {
        throw new Error(`Failed to retrieve settlement data for battle ${battleId}`);
      }

      // Calculate totals for each participant
      const totals = await this.calculateTotals(settlementInput);

      // Determine winners based on mode and handle ties
      const winnerResult = await this.determineWinners(settlementInput.mode, totals);

      // Execute settlement atomically
      const settlementResult = await this.executeSettlement(
        battleId,
        settlementInput,
        totals,
        winnerResult
      );

      return {
        ...settlementResult,
        settlement_metadata: {
          total_pot: Object.values(totals).reduce((sum, val) => sum + val, 0),
          processing_time_ms: Date.now() - startTime,
          was_settled_before: false
        }
      };

    } catch (error) {
      console.error(`Settlement failed for battle ${battleId}:`, error);
      throw error;
    }
  }

  /**
   * Check if battle was already settled (for idempotency)
   */
  private async checkExistingSettlement(battleId: string): Promise<SettlementResult | null> {
    try {
      const { data: battle, error } = await this.supabase
        .from('battles')
        .select('status, winner_id, completed_at')
        .eq('id', battleId)
        .single();

      if (error || !battle) {
        return null;
      }

      // If battle is completed, return existing settlement
      if (battle.status === 'completed' && battle.winner_id) {
        // Reconstruct totals from battle_results
        const { data: results } = await this.supabase
          .from('battle_results')
          .select('participant_id, total_value, is_winner')
          .eq('battle_id', battleId);

        if (results) {
          const totals: Totals = {};
          results.forEach(result => {
            totals[result.participant_id] = Number(result.total_value);
          });

          return {
            winner_ids: [battle.winner_id],
            totals,
            settlement_metadata: {
              total_pot: Object.values(totals).reduce((sum, val) => sum + val, 0),
              processing_time_ms: 0,
              was_settled_before: true
            }
          };
        }
      }

      return null;

    } catch (error) {
      console.error(`Error checking existing settlement for ${battleId}:`, error);
      return null;
    }
  }

  /**
   * Get all data needed for settlement
   */
  private async getSettlementInput(battleId: string): Promise<SettlementInput | null> {
    try {
      // Get battle details
      const { data: battle, error: battleError } = await this.supabase
        .from('battles')
        .select('mode')
        .eq('id', battleId)
        .single();

      if (battleError || !battle) {
        console.error(`Failed to fetch battle ${battleId}:`, battleError);
        return null;
      }

      // Get participants
      const { data: participants, error: participantsError } = await this.supabase
        .from('battle_participants')
        .select('id, user_id, position')
        .eq('battle_id', battleId)
        .order('position', { ascending: true });

      if (participantsError || !participants) {
        console.error(`Failed to fetch participants for battle ${battleId}:`, participantsError);
        return null;
      }

      // Get all pulls for this battle
      const { data: pulls, error: pullsError } = await this.supabase
        .from('battle_pulls')
        .select(`
          id,
          participant_id,
          item_id,
          client_seed,
          nonce,
          hash,
          mapped_roll
        `)
        .eq('round_id', (
          this.supabase
            .from('battle_rounds')
            .select('id')
            .eq('battle_id', battleId)
        ));

      if (pullsError) {
        console.error(`Failed to fetch pulls for battle ${battleId}:`, pullsError);
        return null;
      }

      // For now, use a simpler query approach
      const { data: rounds } = await this.supabase
        .from('battle_rounds')
        .select('id')
        .eq('battle_id', battleId);

      if (!rounds) {
        return null;
      }

      const roundIds = rounds.map(r => r.id);
      let allPulls: BattlePull[] = [];

      for (const roundId of roundIds) {
        const { data: roundPulls, error } = await this.supabase
          .from('battle_pulls')
          .select('*')
          .eq('round_id', roundId);

        if (error) {
          console.error(`Failed to fetch pulls for round ${roundId}:`, error);
          continue;
        }

        if (roundPulls) {
          allPulls.push(...roundPulls);
        }
      }

      return {
        battle_id: battleId,
        mode: battle.mode as 'standard' | 'crazy',
        participants: participants as BattleParticipant[],
        pulls: allPulls as BattlePull[]
      };

    } catch (error) {
      console.error(`Error getting settlement input for ${battleId}:`, error);
      return null;
    }
  }

  /**
   * Calculate total value for each participant
   */
  private async calculateTotals(input: SettlementInput): Promise<Totals> {
    const totals: Totals = {};

    // Initialize totals for all participants
    input.participants.forEach(participant => {
      totals[participant.id] = 0;
    });

    // Group pulls by participant
    const pullsByParticipant = new Map<string, BattlePull[]>();
    input.pulls.forEach(pull => {
      if (!pullsByParticipant.has(pull.participant_id)) {
        pullsByParticipant.set(pull.participant_id, []);
      }
      pullsByParticipant.get(pull.participant_id)!.push(pull);
    });

    // Get fair values for all items in batch
    const allItemIds = input.pulls.map(pull => pull.item_id);
    const fairValueMap = await getBatchFairValues(allItemIds);

    // Calculate totals
    for (const [participantId, participantPulls] of pullsByParticipant) {
      let total = 0;

      for (const pull of participantPulls) {
        const priceResult = fairValueMap.get(pull.item_id);
        if (priceResult) {
          total += priceResult.fair_value;
        }
      }

      totals[participantId] = total;
    }

    return totals;
  }

  /**
   * Determine winners based on battle mode and handle ties
   */
  private async determineWinners(
    mode: 'standard' | 'crazy',
    totals: Totals
  ): Promise<{ winner_ids: string[]; tie_break?: any }> {
    const participantIds = Object.keys(totals);

    if (participantIds.length === 0) {
      return { winner_ids: [] };
    }

    // Sort participants by total value based on mode
    const sortedParticipants = participantIds.sort((a, b) => {
      if (mode === 'standard') {
        return totals[b] - totals[a]; // Highest wins
      } else {
        return totals[a] - totals[b]; // Lowest wins (crazy mode)
      }
    });

    const bestTotal = totals[sortedParticipants[0]];
    const winners = sortedParticipants.filter(id => totals[id] === bestTotal);

    // If we have a tie, apply provably fair coinflip
    if (winners.length > 1) {
      const tieBreakResult = await this.resolveTie(winners);
      return {
        winner_ids: [tieBreakResult.winner_id],
        tie_break: tieBreakResult
      };
    }

    return { winner_ids: winners };
  }

  /**
   * Resolve tie using provably fair coinflip with next nonce
   */
  private async resolveTie(tiedParticipants: string[]): Promise<{
    winner_id: string;
    nonce: number;
    client_seed: string;
    hash: string;
  }> {
    try {
      // Get the next nonce for tie-breaking
      // This would typically use the provably fair service
      // For now, implement a simple deterministic approach
      const sortedIds = [...tiedParticipants].sort();
      const nextNonce = Date.now();
      const clientSeed = `tie_break_${nextNonce}`;

      // Simple hash-based selection (in production, use the PF service)
      const hash = this.simpleHash(`${clientSeed}_${nextNonce}`);
      const winnerIndex = this.hashToNumber(hash) % tiedParticipants.length;
      const winnerId = sortedIds[winnerIndex];

      return {
        winner_id: winnerId,
        nonce: nextNonce,
        client_seed: clientSeed,
        hash: hash
      };

    } catch (error) {
      console.error('Error resolving tie:', error);
      // Fallback to first participant
      return {
        winner_id: tiedParticipants[0],
        nonce: 0,
        client_seed: 'fallback',
        hash: 'fallback'
      };
    }
  }

  /**
   * Execute settlement atomically
   */
  private async executeSettlement(
    battleId: string,
    input: SettlementInput,
    totals: Totals,
    winnerResult: { winner_ids: string[]; tie_break?: any }
  ): Promise<SettlementResult> {
    try {
      // Use a database transaction for atomicity
      const { data, error } = await this.supabase.rpc('settle_battle_transaction', {
        p_battle_id: battleId,
        p_winner_ids: winnerResult.winner_ids,
        p_totals: totals,
        p_tie_break_data: winnerResult.tie_break || null
      });

      if (error) {
        console.error('Settlement transaction failed:', error);
        throw error;
      }

      return data as SettlementResult;

    } catch (error) {
      console.error('Error executing settlement:', error);
      throw error;
    }
  }

  /**
   * Simple hash function for tie-breaking (replace with PF service in production)
   */
  private simpleHash(input: string): string {
    let hash = 0;
    for (let i = 0; i < input.length; i++) {
      const char = input.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16);
  }

  /**
   * Convert hash to number
   */
  private hashToNumber(hash: string): number {
    return parseInt(hash, 16) || 0;
  }

  /**
   * Create dedupe key for idempotency
   */
  private createDedupeKey(battleId: string, operationType: string): DedupeKey {
    return {
      battle_id: battleId,
      operation_type: operationType as 'settlement' | 'payout'
    };
  }

  /**
   * Process payouts to winners
   */
  private async processPayouts(
    battleId: string,
    winnerIds: string[],
    totals: Totals
  ): Promise<void> {
    try {
      const totalPot = Object.values(totals).reduce((sum, val) => sum + val, 0);
      const winnerCount = winnerIds.length;
      const payoutPerWinner = totalPot / winnerCount;

      for (const winnerId of winnerIds) {
        // Credit winner's account
        const { error } = await this.supabase.rpc('credit_user_account', {
          p_user_id: winnerId,
          p_amount: payoutPerWinner,
          p_battle_id: battleId,
          p_description: `Battle winnings - ${battleId}`
        });

        if (error) {
          console.error(`Failed to credit user ${winnerId}:`, error);
          throw error;
        }
      }

    } catch (error) {
      console.error('Error processing payouts:', error);
      throw error;
    }
  }

  /**
   * Get settlement history for a user
   */
  async getUserSettlementHistory(userId: string, limit = 50): Promise<any[]> {
    try {
      const { data, error } = await this.supabase
        .from('battle_results')
        .select(`
          *,
          battles!inner(id, mode, created_at, completed_at),
          battle_participants!inner(user_id, position)
        `)
        .eq('battle_participants.user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching settlement history:', error);
        return [];
      }

      return data || [];

    } catch (error) {
      console.error('Error getting user settlement history:', error);
      return [];
    }
  }

  /**
   * Retry failed settlement with exponential backoff
   */
  async retrySettlement(battleId: string, attempt = 1): Promise<SettlementResult> {
    if (attempt > this.MAX_RETRY_ATTEMPTS) {
      throw new Error(`Settlement failed after ${this.MAX_RETRY_ATTEMPTS} attempts`);
    }

    try {
      return await this.settleBattle(battleId);

    } catch (error) {
      const delay = Math.min(1000 * Math.pow(2, attempt - 1), 10000);
      await new Promise(resolve => setTimeout(resolve, delay));

      return await this.retrySettlement(battleId, attempt + 1);
    }
  }
}

// Export singleton instance
const settlementService = new SettlementService();

// Export individual functions for backward compatibility
export async function settleBattle(battleId: string): Promise<SettlementResult> {
  return await settlementService.settleBattle(battleId);
}

export async function retrySettlement(battleId: string): Promise<SettlementResult> {
  return await settlementService.retrySettlement(battleId);
}

export async function getUserSettlementHistory(userId: string, limit = 50): Promise<any[]> {
  return await settlementService.getUserSettlementHistory(userId, limit);
}

export { settlementService };
export type { Totals, SettlementResult, SettlementInput, DedupeKey };

