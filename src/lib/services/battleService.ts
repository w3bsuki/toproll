import { getSupabaseServer } from '$lib/supabase/server';
import type { Battle, BattleParticipant, BattleResult } from '$lib/types';

export interface BattleCreationResult {
	battle: Battle;
	participants: BattleParticipant[];
}

export interface BattleJoinResult {
	battle: Battle;
	participant: BattleParticipant;
}

/**
 * Creates a new battle
 */
export async function createBattle(userId: string, caseId: string): Promise<BattleCreationResult> {
	const supabase = getSupabaseServer();

	// Get case info
	const { data: caseData, error: caseError } = await supabase
		.from('cases')
		.select('*')
		.eq('id', caseId)
		.single();

	if (caseError || !caseData) {
		throw new Error('Case not found');
	}

	// Create battle
	const { data: battle, error: battleError } = await supabase
		.from('battles')
		.insert({
			case_id: caseId,
			status: 'waiting',
			max_participants: 2,
			current_participants: 1,
			created_by: userId
		})
		.select(
			`
			*,
			case:cases(*)
		`
		)
		.single();

	if (battleError) {
		throw new Error(`Failed to create battle: ${battleError.message}`);
	}

	// Add creator as first participant
	const { data: participant, error: participantError } = await supabase
		.from('battle_participants')
		.insert({
			battle_id: battle.id,
			user_id: userId,
			position: 1
		})
		.select(
			`
			*,
			user:user_profiles(*)
		`
		)
		.single();

	if (participantError) {
		throw new Error(`Failed to join battle: ${participantError.message}`);
	}

	return {
		battle: battle as Battle,
		participants: [participant as BattleParticipant]
	};
}

/**
 * Joins an existing battle
 */
export async function joinBattle(userId: string, battleId: string): Promise<BattleJoinResult> {
	const supabase = getSupabaseServer();

	// Get battle
	const { data: battle, error: battleError } = await supabase
		.from('battles')
		.select('*')
		.eq('id', battleId)
		.eq('status', 'waiting')
		.single();

	if (battleError || !battle) {
		throw new Error('Battle not found or not available');
	}

	// Check if user is already in battle
	const { data: existingParticipant } = await supabase
		.from('battle_participants')
		.select('*')
		.eq('battle_id', battleId)
		.eq('user_id', userId)
		.single();

	if (existingParticipant) {
		throw new Error('Already in battle');
	}

	// Check if battle is full
	if (battle.current_participants >= battle.max_participants) {
		throw new Error('Battle is full');
	}

	// Add user as participant
	const position = battle.current_participants + 1;
	const { data: participant, error: participantError } = await supabase
		.from('battle_participants')
		.insert({
			battle_id: battleId,
			user_id: userId,
			position: position
		})
		.select(
			`
			*,
			user:user_profiles(*)
		`
		)
		.single();

	if (participantError) {
		throw new Error(`Failed to join battle: ${participantError.message}`);
	}

	// Update battle participant count
	const { error: updateError } = await supabase
		.from('battles')
		.update({
			current_participants: position,
			status: position >= battle.max_participants ? 'active' : 'waiting'
		})
		.eq('id', battleId);

	if (updateError) {
		throw new Error(`Failed to update battle: ${updateError.message}`);
	}

	// If battle is now full, start it
	if (position >= battle.max_participants) {
		await startBattle(battleId);
	}

	// Get updated battle data
	const { data: updatedBattle } = await supabase
		.from('battles')
		.select(
			`
			*,
			case:cases(*),
			participants:battle_participants(
				*,
				user:user_profiles(*)
			)
		`
		)
		.eq('id', battleId)
		.single();

	return {
		battle: updatedBattle as Battle,
		participant: participant as BattleParticipant
	};
}

/**
 * Gets available battles
 */
export async function getAvailableBattles(): Promise<Battle[]> {
	const supabase = getSupabaseServer();

	const { data: battles, error } = await supabase
		.from('battles')
		.select(
			`
			*,
			case:cases(*),
			participants:battle_participants(
				*,
				user:user_profiles(*)
			)
		`
		)
		.eq('status', 'waiting')
		.order('created_at', { ascending: false })
		.limit(20);

	if (error) {
		throw new Error(`Failed to fetch battles: ${error.message}`);
	}

	return battles as Battle[];
}

/**
 * Gets user's active battles
 */
export async function getUserBattles(userId: string): Promise<Battle[]> {
	const supabase = getSupabaseServer();

	const { data: battles, error } = await supabase
		.from('battles')
		.select(
			`
			*,
			case:cases(*),
			participants:battle_participants(
				*,
				user:user_profiles(*)
			),
			results:battle_results(
				*,
				item:case_items(*),
				participant:battle_participants(
					*,
					user:user_profiles(*)
				)
			)
		`
		)
		.or(`created_by.eq.${userId},battle_participants.user_id.eq.${userId}`)
		.order('created_at', { ascending: false })
		.limit(10);

	if (error) {
		throw new Error(`Failed to fetch user battles: ${error.message}`);
	}

	return battles as Battle[];
}

/**
 * Starts a battle and determines winner
 */
async function startBattle(battleId: string): Promise<void> {
	const supabase = getSupabaseServer();

	// Get battle and participants
	const { data: battle, error: battleError } = await supabase
		.from('battles')
		.select(
			`
			*,
			participants:battle_participants(*)
		`
		)
		.eq('id', battleId)
		.single();

	if (battleError || !battle) {
		throw new Error('Battle not found');
	}

	// Get case items
	const { data: caseData } = await supabase
		.from('cases')
		.select(
			`
			*,
			items:case_items(*)
		`
		)
		.eq('id', battle.case_id)
		.single();

	if (!caseData) {
		throw new Error('Case not found');
	}

	// Each participant opens a case
	const results: BattleResult[] = [];
	let maxValue = 0;
	let winnerId: string | null = null;

	for (const participant of battle.participants) {
		const item = selectItemByProbability(caseData.items);
		const participantId = participant.id;

		// Record result
		const { data: result, error: resultError } = await supabase
			.from('battle_results')
			.insert({
				battle_id: battleId,
				participant_id: participantId,
				item_id: item.id
			})
			.select(
				`
				*,
				item:case_items(*),
				participant:battle_participants(
					*,
					user:user_profiles(*)
				)
			`
			)
			.single();

		if (resultError) {
			console.error('Failed to record battle result:', resultError);
			continue;
		}

		results.push(result as BattleResult);

		// Check if this is the highest value
		if (item.market_value > maxValue) {
			maxValue = item.market_value;
			winnerId = participant.user_id;
		}
	}

	// Update battle with winner
	const { error: updateError } = await supabase
		.from('battles')
		.update({
			status: 'completed',
			winner_id: winnerId,
			completed_at: new Date().toISOString()
		})
		.eq('id', battleId);

	if (updateError) {
		console.error('Failed to complete battle:', updateError);
	}

	// Update user stats for winner
	if (winnerId) {
		await updateBattleStats(winnerId, battle.participants.length, caseData.price);
	}
}

/**
 * Selects an item from the case using weighted probability
 */
function selectItemByProbability(items: any[]): any {
	const totalProbability = items.reduce((sum: number, item: any) => sum + item.probability, 0);

	// Generate a random number between 0 and total probability
	const random = Math.random() * totalProbability;

	let cumulativeProbability = 0;
	for (const item of items) {
		cumulativeProbability += item.probability;
		if (random <= cumulativeProbability) {
			return item;
		}
	}

	// Fallback to last item
	return items[items.length - 1];
}

/**
 * Updates user statistics after winning a battle
 */
async function updateBattleStats(
	userId: string,
	participants: number,
	casePrice: number
): Promise<void> {
	const supabase = getSupabaseServer();

	// Get current stats
	const { data: profile, error: profileError } = await supabase
		.from('user_profiles')
		.select('total_wagered, total_profit, win_rate, biggest_win, case_battle_wins')
		.eq('user_id', userId)
		.single();

	if (profileError || !profile) {
		console.warn('Could not update battle stats:', profileError);
		return;
	}

	// Calculate winnings (pot minus our entry fee)
	const pot = participants * casePrice;
	const winnings = pot - casePrice;
	const newTotalWagered = (profile.total_wagered || 0) + casePrice;
	const newTotalProfit = (profile.total_profit || 0) + winnings;
	const newCaseBattleWins = (profile.case_battle_wins || 0) + 1;

	// Update the profile
	const { error: updateError } = await supabase
		.from('user_profiles')
		.update({
			total_wagered: newTotalWagered,
			total_profit: newTotalProfit,
			case_battle_wins: newCaseBattleWins,
			updated_at: new Date().toISOString()
		})
		.eq('user_id', userId);

	if (updateError) {
		console.warn('Could not update battle stats:', updateError);
	}
}

/**
 * Leaves a battle
 */
export async function leaveBattle(userId: string, battleId: string): Promise<void> {
	const supabase = getSupabaseServer();

	// Check if user is in battle
	const { data: participant, error: participantError } = await supabase
		.from('battle_participants')
		.select('*')
		.eq('battle_id', battleId)
		.eq('user_id', userId)
		.single();

	if (participantError || !participant) {
		throw new Error('Not in battle');
	}

	// Remove participant
	const { error: deleteError } = await supabase
		.from('battle_participants')
		.delete()
		.eq('id', participant.id);

	if (deleteError) {
		throw new Error(`Failed to leave battle: ${deleteError.message}`);
	}

	// Update battle participant count
	const { data: battle } = await supabase
		.from('battles')
		.select('current_participants, max_participants, created_by')
		.eq('id', battleId)
		.single();

	if (battle) {
		const newCount = battle.current_participants - 1;

		if (newCount <= 0) {
			// Cancel battle if empty
			await supabase.from('battles').update({ status: 'cancelled' }).eq('id', battleId);
		} else {
			await supabase.from('battles').update({ current_participants: newCount }).eq('id', battleId);
		}
	}
}
