// Realtime bridge for broadcasting battle events via Supabase
import { getSupabaseClient } from '$lib/supabase/client';
import type {
	BattleEvent,
	RoundStartEvent,
	RoundPullEvent,
	RoundResultEvent,
	BattleSettledEvent,
	BattleParticipant
} from '$lib/types';

// Server-side Supabase client for broadcasting
let serverSupabase: ReturnType<typeof getSupabaseClient> | null = null;

/**
 * Get server-side Supabase client for broadcasting battle events
 */
function getServerSupabase() {
	if (!serverSupabase) {
		serverSupabase = getSupabaseClient();
	}
	return serverSupabase;
}

/**
 * Battle event broadcaster for server-side use
 */
export class BattleEventBroadcaster {
	private supabase = getServerSupabase();

	/**
	 * Broadcast a battle event to all connected clients
	 */
	async broadcastEvent(
		battleId: string,
		event: Omit<BattleEvent, 'battle_id' | 'timestamp'>
	): Promise<boolean> {
		try {
			const fullEvent: BattleEvent = {
				...event,
				battle_id: battleId,
				timestamp: new Date().toISOString()
			};

			const channel = this.supabase.channel(`battles:${battleId}`);

			// Send the event via broadcast
			await channel.send({
				type: 'broadcast',
				event: 'battle_event',
				payload: fullEvent
			});

			console.log(`Broadcasted battle event ${event.type} for battle ${battleId}`);
			return true;
		} catch (error) {
			console.error(
				`Failed to broadcast battle event ${event.type} for battle ${battleId}:`,
				error
			);
			return false;
		}
	}

	/**
	 * Broadcast participant joined event
	 */
	async broadcastParticipantJoined(
		battleId: string,
		participant: BattleParticipant
	): Promise<boolean> {
		return this.broadcastEvent(battleId, {
			type: 'participant_joined',
			data: {
				participant_id: participant.id,
				user_id: participant.user_id,
				username: participant.user?.username || 'Unknown',
				position: participant.position,
				joined_at: participant.joined_at
			}
		});
	}

	/**
	 * Broadcast battle locked event (battle starting)
	 */
	async broadcastBattleLocked(battleId: string, participantIds: string[]): Promise<boolean> {
		return this.broadcastEvent(battleId, {
			type: 'battle_locked',
			data: {
				participant_ids: participantIds,
				locked_at: new Date().toISOString()
			}
		});
	}

	/**
	 * Broadcast round start event
	 */
	async broadcastRoundStart(
		battleId: string,
		roundIndex: number,
		caseId: string
	): Promise<boolean> {
		return this.broadcastEvent(battleId, {
			type: 'round_start',
			data: {
				round_index: roundIndex,
				case_id: caseId,
				started_at: new Date().toISOString()
			}
		});
	}

	/**
	 * Broadcast individual pull result
	 */
	async broadcastRoundPull(
		battleId: string,
		participantId: string,
		item: any,
		hash: string,
		nonce: number,
		clientSeed: string
	): Promise<boolean> {
		return this.broadcastEvent(battleId, {
			type: 'round_pull',
			data: {
				participant_id: participantId,
				item,
				hash,
				nonce,
				client_seed: clientSeed,
				pulled_at: new Date().toISOString()
			}
		});
	}

	/**
	 * Broadcast complete round results
	 */
	async broadcastRoundResult(
		battleId: string,
		roundIndex: number,
		pulls: RoundPullEvent[],
		subtotals: { [participant_id: string]: number }
	): Promise<boolean> {
		return this.broadcastEvent(battleId, {
			type: 'round_result',
			data: {
				round_index: roundIndex,
				pulls,
				subtotals,
				completed_at: new Date().toISOString()
			}
		});
	}

	/**
	 * Broadcast battle settled event
	 */
	async broadcastBattleSettled(
		battleId: string,
		totals: { [participant_id: string]: number },
		winnerId?: string,
		winners?: string[],
		tieBreak?: { participant_id: string; won: boolean }
	): Promise<boolean> {
		return this.broadcastEvent(battleId, {
			type: 'battle_settled',
			data: {
				winner_id: winnerId,
				winners,
				totals,
				tie_break: tieBreak,
				settled_at: new Date().toISOString()
			}
		});
	}

	/**
	 * Broadcast battle cancelled event
	 */
	async broadcastBattleCancelled(battleId: string, reason: string): Promise<boolean> {
		return this.broadcastEvent(battleId, {
			type: 'battle_cancelled',
			data: {
				reason,
				cancelled_at: new Date().toISOString()
			}
		});
	}
}

// Singleton broadcaster instance
let eventBroadcaster: BattleEventBroadcaster | null = null;

/**
 * Get the battle event broadcaster instance
 */
export function getBattleEventBroadcaster(): BattleEventBroadcaster {
	if (!eventBroadcaster) {
		eventBroadcaster = new BattleEventBroadcaster();
	}
	return eventBroadcaster;
}

/**
 * Battle orchestrator integration - emits events to realtime
 */
export class BattleOrchestratorRealtime {
	private broadcaster = getBattleEventBroadcaster();

	/**
	 * Initialize battle orchestrator with realtime capabilities
	 */
	constructor() {
		// Set up error handling
		process.on('unhandledRejection', (reason, promise) => {
			console.error('Unhandled rejection in BattleOrchestratorRealtime:', reason);
		});
	}

	/**
	 * Called when a participant joins a battle
	 */
	async onParticipantJoined(battleId: string, participant: BattleParticipant): Promise<boolean> {
		return await this.broadcaster.broadcastParticipantJoined(battleId, participant);
	}

	/**
	 * Called when battle is locked and starting
	 */
	async onBattleLocked(battleId: string, participantIds: string[]): Promise<boolean> {
		return await this.broadcaster.broadcastBattleLocked(battleId, participantIds);
	}

	/**
	 * Called when a new round starts
	 */
	async onRoundStart(battleId: string, roundIndex: number, caseId: string): Promise<boolean> {
		return await this.broadcaster.broadcastRoundStart(battleId, roundIndex, caseId);
	}

	/**
	 * Called when a participant pulls an item
	 */
	async onRoundPull(
		battleId: string,
		participantId: string,
		item: any,
		hash: string,
		nonce: number,
		clientSeed: string
	): Promise<boolean> {
		return await this.broadcaster.broadcastRoundPull(
			battleId,
			participantId,
			item,
			hash,
			nonce,
			clientSeed
		);
	}

	/**
	 * Called when a round completes
	 */
	async onRoundResult(
		battleId: string,
		roundIndex: number,
		pulls: RoundPullEvent[],
		subtotals: { [participant_id: string]: number }
	): Promise<boolean> {
		return await this.broadcaster.broadcastRoundResult(battleId, roundIndex, pulls, subtotals);
	}

	/**
	 * Called when battle is settled
	 */
	async onBattleSettled(
		battleId: string,
		totals: { [participant_id: string]: number },
		winnerId?: string,
		winners?: string[],
		tieBreak?: { participant_id: string; won: boolean }
	): Promise<boolean> {
		return await this.broadcaster.broadcastBattleSettled(
			battleId,
			totals,
			winnerId,
			winners,
			tieBreak
		);
	}

	/**
	 * Called when battle is cancelled
	 */
	async onBattleCancelled(battleId: string, reason: string): Promise<boolean> {
		return await this.broadcaster.broadcastBattleCancelled(battleId, reason);
	}
}

// Singleton orchestrator instance
let orchestratorRealtime: BattleOrchestratorRealtime | null = null;

/**
 * Get the battle orchestrator realtime instance
 */
export function getBattleOrchestratorRealtime(): BattleOrchestratorRealtime {
	if (!orchestratorRealtime) {
		orchestratorRealtime = new BattleOrchestratorRealtime();
	}
	return orchestratorRealtime;
}

/**
 * Utility functions for battle event validation and formatting
 */

/**
 * Validate battle event data before broadcasting
 */
export function validateBattleEventData(eventType: BattleEvent['type'], data: any): boolean {
	switch (eventType) {
		case 'participant_joined':
			return (
				data &&
				typeof data.participant_id === 'string' &&
				typeof data.user_id === 'string' &&
				typeof data.position === 'number'
			);

		case 'battle_locked':
			return (
				data &&
				Array.isArray(data.participant_ids) &&
				data.participant_ids.every((id: string) => typeof id === 'string')
			);

		case 'round_start':
			return data && typeof data.round_index === 'number' && typeof data.case_id === 'string';

		case 'round_pull':
			return (
				data &&
				typeof data.participant_id === 'string' &&
				data.item &&
				typeof data.hash === 'string' &&
				typeof data.nonce === 'number' &&
				typeof data.client_seed === 'string'
			);

		case 'round_result':
			return (
				data &&
				typeof data.round_index === 'number' &&
				Array.isArray(data.pulls) &&
				typeof data.subtotals === 'object' &&
				data.subtotals !== null
			);

		case 'battle_settled':
			return (
				data &&
				typeof data.totals === 'object' &&
				data.totals !== null &&
				(data.winner_id === undefined || typeof data.winner_id === 'string') &&
				(data.winners === undefined || Array.isArray(data.winners))
			);

		default:
			return false;
	}
}

/**
 * Format battle event for logging/debugging
 */
export function formatBattleEventForLog(event: BattleEvent): string {
	const { type, battle_id, timestamp, data } = event;

	switch (type) {
		case 'participant_joined':
			return `[${timestamp}] Battle ${battle_id}: Participant ${data.participant_id} (${data.username}) joined`;

		case 'battle_locked':
			return `[${timestamp}] Battle ${battle_id}: Battle locked with ${data.participant_ids?.length || 0} participants`;

		case 'round_start':
			return `[${timestamp}] Battle ${battle_id}: Round ${data.round_index + 1} started (Case: ${data.case_id})`;

		case 'round_pull':
			return `[${timestamp}] Battle ${battle_id}: ${data.participant_id} pulled ${data.item?.name || 'Unknown item'}`;

		case 'round_result':
			return `[${timestamp}] Battle ${battle_id}: Round ${data.round_index + 1} completed - ${data.pulls?.length || 0} pulls`;

		case 'battle_settled':
			return `[${timestamp}] Battle ${battle_id}: Battle settled - Winner: ${data.winner_id || 'Multiple winners'}`;

		default:
			return `[${timestamp}] Battle ${battle_id}: Unknown event type ${type}`;
	}
}

/**
 * Retry failed event broadcasts with exponential backoff
 */
export async function retryBroadcast(
	broadcastFn: () => Promise<boolean>,
	maxRetries: number = 3,
	baseDelay: number = 1000
): Promise<boolean> {
	for (let attempt = 1; attempt <= maxRetries; attempt++) {
		try {
			const success = await broadcastFn();
			if (success) {
				return true;
			}
		} catch (error) {
			console.error(`Broadcast attempt ${attempt} failed:`, error);
		}

		if (attempt < maxRetries) {
			const delay = baseDelay * Math.pow(2, attempt - 1) + Math.random() * 1000;
			await new Promise((resolve) => setTimeout(resolve, delay));
		}
	}

	console.error(`Failed to broadcast after ${maxRetries} attempts`);
	return false;
}
