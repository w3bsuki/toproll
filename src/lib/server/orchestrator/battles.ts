/*
  Battle Orchestrator - Core game state machine
  State: waiting -> locking -> in_progress(round k) -> settling -> completed/cancelled
  Emits: participant_joined, battle_locked, round_start, round_pull, round_result, battle_settled
*/
import EventEmitter from 'events';
import type { Battle, BattleParticipant, BattleRound, BattlePull, CaseItem, BattleEvent } from '$lib/types';
import { commitServerSeed, generateRoll, type RollResult } from '../pf';
import { getSupabaseServer } from '$lib/supabase/server';
import { getBattleOrchestratorRealtime } from '../realtime-battle';
import { getEventRateLimiter, validateBattleEventData } from '$lib/config/realtime';

export type BattleState = 'waiting' | 'locking' | 'in_progress' | 'settling' | 'completed' | 'cancelled';

export interface OrchestratorEvents {
  participant_joined: (payload: { battleId: string; userId: string; participant: BattleParticipant }) => void;
  battle_locked: (payload: { battleId: string; participants: BattleParticipant[] }) => void;
  round_start: (payload: { battleId: string; index: number; caseId: string; roundId: string }) => void;
  round_pull: (payload: {
    battleId: string;
    roundIndex: number;
    participantId: string;
    pull: BattlePull;
    item: CaseItem;
  }) => void;
  round_result: (payload: {
    battleId: string;
    index: number;
    pulls: BattlePull[];
    subtotals: { [participant_id: string]: number };
  }) => void;
  battle_settled: (payload: {
    battleId: string;
    winnerId?: string;
    totals: { [participant_id: string]: number };
    tieBreak?: { participantId: string; won: boolean };
  }) => void;
}

export class BattleOrchestrator extends EventEmitter {
  private supabase = getSupabaseServer();
  private realtime = getBattleOrchestratorRealtime();
  private rateLimiter = getEventRateLimiter();

  constructor() {
    super();
    this.setupErrorHandling();
    this.setupRealtimeIntegration();
  }

  private setupErrorHandling() {
    this.on('error', (error) => {
      console.error('Battle Orchestrator Error:', error);
    });
  }

  private setupRealtimeIntegration() {
    // Wire up all orchestrator events to realtime broadcasting
    this.on('participant_joined', async (payload) => {
      await this.broadcastWithRateLimit('participant_joined', payload.battleId, async () => {
        return this.realtime.onParticipantJoined(payload.battleId, payload.participant);
      });
    });

    this.on('battle_locked', async (payload) => {
      await this.broadcastWithRateLimit('battle_locked', payload.battleId, async () => {
        const participantIds = payload.participants.map(p => p.id);
        return this.realtime.onBattleLocked(payload.battleId, participantIds);
      });
    });

    this.on('round_start', async (payload) => {
      await this.broadcastWithRateLimit('round_start', payload.battleId, async () => {
        return this.realtime.onRoundStart(payload.battleId, payload.index, payload.caseId);
      });
    });

    this.on('round_pull', async (payload) => {
      await this.broadcastWithRateLimit('round_pull', payload.battleId, async () => {
        return this.realtime.onRoundPull(
          payload.battleId,
          payload.participantId,
          payload.item,
          payload.pull.hash,
          payload.pull.nonce,
          payload.pull.client_seed
        );
      });
    });

    this.on('round_result', async (payload) => {
      await this.broadcastWithRateLimit('round_result', payload.battleId, async () => {
        const pulls = payload.pulls.map(pull => ({
          type: 'round_pull' as const,
          participant_id: pull.participant_id,
          item: pull.item,
          hash: pull.hash,
          nonce: pull.nonce,
          client_seed: pull.client_seed
        }));
        return this.realtime.onRoundResult(payload.battleId, payload.index, pulls, payload.subtotals);
      });
    });

    this.on('battle_settled', async (payload) => {
      await this.broadcastWithRateLimit('battle_settled', payload.battleId, async () => {
        return this.realtime.onBattleSettled(
          payload.battleId,
          payload.winnerId,
          undefined, // winners for team battles (not implemented yet)
          payload.totals,
          payload.tieBreak ? {
            participant_id: payload.tieBreak.participantId,
            won: payload.tieBreak.won
          } : undefined
        );
      });
    });
  }

  /**
   * Broadcast event with rate limiting and error handling
   */
  private async broadcastWithRateLimit(
    eventType: BattleEvent['type'],
    battleId: string,
    broadcastFn: () => Promise<boolean>
  ): Promise<void> {
    try {
      // Check rate limit
      if (!this.rateLimiter.isAllowed(battleId)) {
        console.warn(`Rate limit exceeded for battle ${battleId}, event ${eventType}`);
        return;
      }

      // Validate event data (if we have validation logic for this event type)
      if (!validateBattleEventData(eventType, { battleId })) {
        console.error(`Invalid event data for ${eventType} in battle ${battleId}`);
        return;
      }

      // Attempt broadcast with retry
      const success = await broadcastFn();
      if (!success) {
        console.error(`Failed to broadcast ${eventType} event for battle ${battleId}`);
      }
    } catch (error) {
      console.error(`Error broadcasting ${eventType} for battle ${battleId}:`, error);
    }
  }

  /**
   * Create a new battle
   */
  async createBattle(
    caseIds: string[],
    mode: 'standard' | 'crazy',
    maxParticipants: number,
    createdBy: string
  ): Promise<{ battle: Battle; error?: string }> {
    try {
      // Calculate entry fee and total pot
      const { data: cases, error: casesError } = await this.supabase
        .from('cases')
        .select('id, price')
        .in('id', caseIds);

      if (casesError || !cases?.length) {
        return { battle: null as any, error: 'Invalid cases selected' };
      }

      const entryFee = cases.reduce((sum, c) => sum + c.price, 0);
      const totalPot = entryFee * maxParticipants;

      // Create battle record
      const { data: battle, error: battleError } = await this.supabase
        .from('battles')
        .insert({
          case_id: caseIds[0], // TODO: handle multiple cases properly
          status: 'waiting',
          mode,
          max_participants: maxParticipants,
          current_participants: 0,
          total_pot: totalPot,
          entry_fee: entryFee,
          rounds_count: caseIds.length,
          current_round: 0,
          created_by: createdBy
        })
        .select()
        .single();

      if (battleError || !battle) {
        return { battle: null as any, error: battleError?.message || 'Failed to create battle' };
      }

      // Create battle cases
      const battleCases = caseIds.map((caseId, index) => ({
        battle_id: battle.id,
        case_id: caseId,
        order_index: index
      }));

      const { error: casesInsertError } = await this.supabase
        .from('battle_cases')
        .insert(battleCases);

      if (casesInsertError) {
        // Cleanup battle if cases insertion fails
        await this.supabase.from('battles').delete().eq('id', battle.id);
        return { battle: null as any, error: 'Failed to setup battle cases' };
      }

      return { battle };

    } catch (error) {
      console.error('Create battle error:', error);
      return { battle: null as any, error: 'Failed to create battle' };
    }
  }

  /**
   * Join a battle
   */
  async joinBattle(battleId: string, userId: string, clientSeed?: string): Promise<{ participant?: BattleParticipant; error?: string }> {
    try {
      // Get battle from database instead of memory
      const { data: battle, error: battleError } = await this.supabase
        .from('battles')
        .select('*')
        .eq('id', battleId)
        .single();

      if (battleError || !battle || battle.status !== 'waiting') {
        return { error: 'Battle not available for joining' };
      }

      if (battle.current_participants >= battle.max_participants) {
        return { error: 'Battle is full' };
      }

      // Generate client seed if not provided
      const seed = clientSeed || require('crypto').randomBytes(32).toString('hex');

      // Add participant
      const { data: participant, error: participantError } = await this.supabase
        .from('battle_participants')
        .insert({
          battle_id: battleId,
          user_id: userId,
          position: battle.current_participants + 1
        })
        .select()
        .single();

      if (participantError || !participant) {
        return { error: participantError?.message || 'Failed to join battle' };
      }

      // Update battle participant count and status
      const newParticipantCount = battle.current_participants + 1;
      const { error: updateError } = await this.supabase
        .from('battles')
        .update({
          current_participants: newParticipantCount,
          status: newParticipantCount >= battle.max_participants ? 'locking' : 'waiting'
        })
        .eq('id', battleId);

      if (updateError) {
        // Cleanup participant on update failure
        await this.supabase.from('battle_participants').delete().eq('id', participant.id);
        return { error: 'Failed to update battle' };
      }

      this.emit('participant_joined', { battleId, userId, participant });

      // Auto-start if battle is full
      if (battle.current_participants >= battle.max_participants) {
        setImmediate(() => this.startBattle(battleId));
      }

      return { participant };

    } catch (error) {
      console.error('Join battle error:', error);
      return { error: 'Failed to join battle' };
    }
  }

  /**
   * Start battle execution
   */
  async startBattle(battleId: string) {
    try {
      // Get battle from database
      const { data: battle, error: battleError } = await this.supabase
        .from('battles')
        .select('*')
        .eq('id', battleId)
        .single();

      if (battleError || !battle) {
        console.error('Battle not found:', battleId);
        return;
      }

      // Get participants
      const { data: participants, error: participantsError } = await this.supabase
        .from('battle_participants')
        .select('*')
        .eq('battle_id', battleId);

      if (participantsError || !participants?.length) {
        console.error('Failed to load participants:', participantsError);
        return;
      }

      // Get battle cases
      const { data: battleCases, error: casesError } = await this.supabase
        .from('battle_cases')
        .select('*, cases(*)')
        .eq('battle_id', battleId)
        .order('order_index');

      if (casesError || !battleCases?.length) {
        console.error('Failed to load battle cases:', casesError);
        return;
      }

      // Update battle status
      await this.supabase
        .from('battles')
        .update({ status: 'in_progress' })
        .eq('id', battleId);

      battle.status = 'in_progress';
      this.emit('battle_locked', { battleId, participants });

      // Execute rounds
      for (let i = 0; i < battleCases.length; i++) {
        const battleCase = battleCases[i];
        await this.executeRound(battleId, i, battleCase.case_id, participants);
      }

      // Settle battle
      await this.settleBattle(battleId, participants);

    } catch (error) {
      console.error('Start battle error:', error);
      await this.supabase
        .from('battles')
        .update({ status: 'cancelled' })
        .eq('id', battleId);
    }
  }

  /**
   * Execute a single round
   */
  private async executeRound(
    battleId: string,
    roundIndex: number,
    caseId: string,
    participants: BattleParticipant[]
  ) {
    try {
      // Create round record
      const { serverSeed, serverSeedHash } = commitServerSeed();

      const { data: round, error: roundError } = await this.supabase
        .from('battle_rounds')
        .insert({
          battle_id: battleId,
          round_index: roundIndex,
          case_id: caseId,
          server_seed_hash: serverSeedHash
        })
        .select()
        .single();

      if (roundError || !round) {
        throw new Error(`Failed to create round ${roundIndex}: ${roundError?.message}`);
      }

      // Get case items for probability mapping
      const { data: caseItems, error: itemsError } = await this.supabase
        .from('case_items')
        .select('*')
        .eq('case_id', caseId);

      if (itemsError || !caseItems?.length) {
        throw new Error(`Failed to load case items: ${itemsError?.message}`);
      }

      // Emit round start
      this.emit('round_start', {
        battleId,
        index: roundIndex,
        caseId,
        roundId: round.id
      });

      // Store seed hash for this round
      await this.supabase.rpc('commit_battle_seed', {
        p_battle_id: battleId,
        p_seed_hash: serverSeedHash
      });

      // Generate pulls for each participant
      const pulls: BattlePull[] = [];
      const subtotals: { [participant_id: string]: number } = {};

      for (const participant of participants) {
        const clientSeed = require('crypto').randomBytes(32).toString('hex');
        const rollResult = generateRoll(
          serverSeed,
          clientSeed,
          roundIndex,
          battleId,
          caseItems.map(item => ({ id: item.id, probability: item.probability }))
        );

        // Get the item details
        const pulledItem = caseItems.find(item => item.id === rollResult.item_id);
        if (!pulledItem) continue;

        // Create pull record
        const { data: pull, error: pullError } = await this.supabase
          .from('battle_pulls')
          .insert({
            round_id: round.id,
            participant_id: participant.id,
            item_id: rollResult.item_id,
            client_seed: rollResult.client_seed,
            nonce: rollResult.nonce,
            hash: rollResult.hash,
            mapped_roll: rollResult.roll
          })
          .select(`
            *,
            item:case_items(*),
            participant:battle_participants(*)
          `)
          .single();

        if (pullError || !pull) {
          console.error(`Failed to create pull for participant ${participant.id}:`, pullError);
          continue;
        }

        pulls.push(pull);
        subtotals[participant.id] = (subtotals[participant.id] || 0) + pulledItem.market_value;

        // Emit individual pull
        this.emit('round_pull', {
          battleId,
          roundIndex,
          participantId: participant.id,
          pull,
          item: pulledItem
        });

        // Small delay for dramatic effect
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      // Emit round result
      this.emit('round_result', {
        battleId,
        index: roundIndex,
        pulls,
        subtotals
      });

    } catch (error) {
      console.error(`Execute round ${roundIndex} error:`, error);
    }
  }

  /**
   * Settle battle and determine winner
   */
  private async settleBattle(battleId: string, participants: BattleParticipant[]) {
    try {
      // Get all pulls and calculate totals
      const { data: pulls, error: pullsError } = await this.supabase
        .from('battle_pulls')
        .select(`
          *,
          participant_id,
          item:case_items(market_value)
        `)
        .in('participant_id', participants.map(p => p.id));

      if (pullsError || !pulls?.length) {
        throw new Error(`Failed to load pulls for settlement: ${pullsError?.message}`);
      }

      // Calculate totals per participant
      const totals: { [participant_id: string]: number } = {};
      participants.forEach(p => totals[p.id] = 0);

      pulls.forEach(pull => {
        if (pull.item?.market_value) {
          totals[pull.participant_id] += pull.item.market_value;
        }
      });

      // Get battle to determine mode
      const { data: battle } = await this.supabase
        .from('battles')
        .select('mode')
        .eq('id', battleId)
        .single();

      if (!battle) throw new Error('Battle not found for settlement');

      // Determine winner based on mode
      let winnerId: string | undefined;
      const isStandard = battle.mode === 'standard';

      let bestValue = isStandard ? -Infinity : Infinity;
      for (const participant of participants) {
        const total = totals[participant.id] || 0;
        if (isStandard ? total > bestValue : total < bestValue) {
          bestValue = total;
          winnerId = participant.id;
        }
      }

      // Check for ties and handle provably fair tie-break
      const tiedParticipants = participants.filter(p => totals[p.id] === bestValue);
      let tieBreak;

      if (tiedParticipants.length > 1) {
        // Provably fair tie-break using next nonce
        const nextNonce = roundIndex + 1000; // Use high nonce to avoid conflicts
        const serverSeed = await this.supabase.rpc('get_active_server_seed');

        if (serverSeed && tiedParticipants.length > 0) {
          const tieBreakSeed = serverSeed + ':' + battleId + ':tiebreak:' + nextNonce;
          const tieBreakHash = require('crypto').createHmac('sha256', serverSeed)
            .update(tieBreakSeed)
            .digest('hex');

          const tieBreakRoll = parseFloat('0x' + tieBreakHash.substring(0, 8)) / parseFloat('0x10000000000000000');
          const winnerIndex = Math.floor(tieBreakRoll * tiedParticipants.length);
          const winner = tiedParticipants[winnerIndex];
          winnerId = winner.id;
          tieBreak = { participantId: winner.id, won: true, method: 'coinflip', nonce: nextNonce };
        } else {
          // Fallback to simple selection
          const winner = tiedParticipants[Math.floor(Math.random() * tiedParticipants.length)];
          winnerId = winner.id;
          tieBreak = { participantId: winner.id, won: true, method: 'fallback' };
        }
      }

      // Use RPC function for atomic settlement
      const { error: settleError } = await this.supabase.rpc('settle_battle_transaction', {
        p_battle_id: battleId,
        p_winner_participant_ids: tiedParticipants.length > 0 ? tiedParticipants.map(p => p.id) : [winnerId],
        p_totals: JSON.stringify(totals),
        p_tie_break_winner_id: tieBreak?.participantId
      });

      if (settleError) {
        throw new Error(`Settlement failed: ${settleError.message}`);
      }

      // Emit settlement
      this.emit('battle_settled', {
        battleId,
        winnerId,
        totals,
        tieBreak
      });

    } catch (error) {
      console.error('Settle battle error:', error);
      await this.supabase
        .from('battles')
        .update({ status: 'cancelled' })
        .eq('id', battleId);
    }
  }

  /**
   * Get battle state from database
   */
  async getBattle(battleId: string): Promise<Battle | null> {
    const { data, error } = await this.supabase
      .from('battles')
      .select('*')
      .eq('id', battleId)
      .single();

    return data || null;
  }

  /**
   * Get all active battles from database
   */
  async getActiveBattles(): Promise<Battle[]> {
    const { data, error } = await this.supabase
      .from('battles')
      .select('*')
      .in('status', ['waiting', 'locking', 'in_progress'])
      .order('created_at', { ascending: false });

    return data || [];
  }
}

// Singleton accessor
let _instance: BattleOrchestrator | null = null;
export function getOrchestrator(): BattleOrchestrator {
  if (!_instance) {
    _instance = new BattleOrchestrator();
  }
  return _instance;
}

