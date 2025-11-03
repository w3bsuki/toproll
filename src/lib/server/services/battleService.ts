import { createHash, randomBytes } from 'node:crypto';
import { getSupabaseServer } from '$lib/supabase/server';
import { updateUserBalance, getUserBalance } from './auth';
import type {
	Battle,
	BattleParticipant,
	BattleCase,
	CreateBattleRequest,
	CaseItem
} from '$lib/types/index';

export interface BattleCreationResult {
	battle: Battle;
	participants: BattleParticipant[];
}

export interface BattleJoinResult {
	battle: Battle;
	participant: BattleParticipant;
}

/**
 * Creates a new battle with provably fair seed generation
 */
export async function createBattle(
	userId: string,
	params: CreateBattleRequest
): Promise<BattleCreationResult> {
	const supabase = getSupabaseServer();
	const { case_ids, mode, max_participants } = params;

	// Validate request
	if (!case_ids || case_ids.length === 0) {
		throw new Error('At least one case must be selected');
	}
	if (!['standard', 'crazy'].includes(mode)) {
		throw new Error('Invalid battle mode');
	}
	if (![2, 4].includes(max_participants)) {
		throw new Error('Invalid participant count');
	}

	// Get case info
	const { data: cases, error: caseError } = await supabase
		.from('cases')
		.select('*')
		.in('id', case_ids);

	if (caseError || !cases || cases.length === 0) {
		throw new Error('Cases not found');
	}

	// Calculate total entry fee
	const totalEntryFee = cases.reduce((sum, c) => sum + Number(c.price), 0);

	// Check user balance
	const balanceResult = await getUserBalance(userId);
	if (balanceResult < totalEntryFee) {
		throw new Error('Insufficient balance to create battle');
	}

	// Generate server seed for provably fair
	const serverSeed = randomBytes(32).toString('hex');
	const commitHash = createHash('sha256').update(serverSeed).digest('hex');

	// Create battle
	const { data: battle, error: battleError } = await supabase
		.from('battles')
		.insert({
			mode,
			max_participants,
			entry_fee: totalEntryFee,
			total_pot: totalEntryFee,
			rounds_count: case_ids.length,
			status: 'waiting',
			server_seed: serverSeed,
			commit_hash: commitHash,
			created_by: userId
		})
		.select()
		.single();

	if (battleError) {
		throw new Error(`Failed to create battle: ${battleError.message}`);
	}

	// Create battle cases
	const battleCases = case_ids.map((caseId, index) => ({
		battle_id: battle.id,
		case_id: caseId,
		order_index: index
	}));

	const { error: casesError } = await supabase.from('battle_cases').insert(battleCases);

	if (casesError) {
		throw new Error(`Failed to link cases to battle: ${casesError.message}`);
	}

	// Add creator as first participant and deduct fee
	const { data: participant, error: participantError } = await supabase
		.from('battle_participants')
		.insert({
			battle_id: battle.id,
			user_id: userId,
			position: 1,
			client_seed: randomBytes(16).toString('hex')
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

	// Deduct entry fee
	const deductResult = await updateUserBalance(userId, totalEntryFee, 'subtract');
	if (!deductResult.success) {
		throw new Error(`Failed to deduct entry fee: ${deductResult.error}`);
	}

	// Get full battle with relations
	const { data: fullBattle } = await supabase
		.from('battles')
		.select(
			`
			*,
			battle_cases:battle_cases(*, cases(*)),
			participants:battle_participants(*, user:user_profiles(*))
		`
		)
		.eq('id', battle.id)
		.single();

	return {
		battle: (fullBattle || battle) as Battle,
		participants: [participant as BattleParticipant]
	};
}

/**
 * Joins an existing battle with provably fair client seed
 */
export async function joinBattle(
	userId: string,
	battleId: string,
	clientSeed?: string
): Promise<BattleJoinResult> {
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
		.maybeSingle();

	if (existingParticipant) {
		throw new Error('Already in battle');
	}

	// Check if battle is full
	if (battle.current_participants >= battle.max_participants) {
		throw new Error('Battle is full');
	}

	// Check user balance
	const balanceResult = await getUserBalance(userId);
	if (balanceResult < battle.entry_fee) {
		throw new Error('Insufficient balance to join battle');
	}

	// Generate client seed if not provided
	const finalClientSeed = clientSeed || randomBytes(16).toString('hex');

	// Add user as participant
	const position = battle.current_participants + 1;
	const { data: participant, error: participantError } = await supabase
		.from('battle_participants')
		.insert({
			battle_id: battleId,
			user_id: userId,
			position: position,
			client_seed: finalClientSeed
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

	// Deduct entry fee
	const deductResult = await updateUserBalance(userId, battle.entry_fee, 'subtract');
	if (!deductResult.success) {
		throw new Error(`Failed to deduct entry fee: ${deductResult.error}`);
	}

	// Update battle participant count and pot
	const { error: updateError } = await supabase
		.from('battles')
		.update({
			current_participants: position,
			total_pot: battle.total_pot + battle.entry_fee,
			status: position >= battle.max_participants ? 'locking' : 'waiting'
		})
		.eq('id', battleId);

	if (updateError) {
		throw new Error(`Failed to update battle: ${updateError.message}`);
	}

	// If battle is now full, lock it and start
	if (position >= battle.max_participants) {
		await lockBattle(battleId);
		// Start first round after a short delay
		setTimeout(() => processBattleRound(battleId, 0), 1000);
	}

	// Get updated battle data
	const { data: updatedBattle } = await supabase
		.from('battles')
		.select(
			`
			*,
			battle_cases:battle_cases(*, cases(*)),
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
 * Locks a battle and generates commit hash for provably fair
 */
export async function lockBattle(battleId: string): Promise<void> {
	const supabase = getSupabaseServer();

	// Generate server seed and commit hash for the first round
	const serverSeed = randomBytes(32).toString('hex');
	const commitHash = createHash('sha256').update(serverSeed).digest('hex');

	// Update battle status and add round
	const { error } = await supabase
		.from('battles')
		.update({
			status: 'in_progress',
			current_round: 0
		})
		.eq('id', battleId);

	if (error) {
		throw new Error(`Failed to lock battle: ${error.message}`);
	}

	// Create first round
	const { error: roundError } = await supabase.from('battle_rounds').insert({
		battle_id: battleId,
		round_index: 0,
		server_seed_hash: commitHash
	});

	if (roundError) {
		throw new Error(`Failed to create battle round: ${roundError.message}`);
	}
}

/**
 * Processes a battle round with provably fair pulls
 */
export async function processBattleRound(battleId: string, roundIndex: number): Promise<void> {
	const supabase = getSupabaseServer();

	// Get battle with participants and cases
	const { data: battle, error: battleError } = await supabase
		.from('battles')
		.select(
			`
			*,
			participants:battle_participants(*, user:user_profiles(*)),
			battle_cases:battle_cases(*, cases(*))
		`
		)
		.eq('id', battleId)
		.single();

	if (battleError || !battle) {
		throw new Error('Battle not found');
	}

	// Get the case for this round
	const roundCase = battle.battle_cases?.find((bc: BattleCase) => bc.order_index === roundIndex);
	if (!roundCase || !roundCase.cases) {
		throw new Error('Case not found for this round');
	}

	// Get case items
	const { data: caseItems, error: itemsError } = await supabase
		.from('case_items')
		.select('*')
		.eq('case_id', roundCase.case_id);

	if (itemsError || !caseItems) {
		throw new Error('Failed to load case items');
	}

	// Get the round info
	const { data: round, error: roundError } = await supabase
		.from('battle_rounds')
		.select('*')
		.eq('battle_id', battleId)
		.eq('round_index', roundIndex)
		.single();

	if (roundError || !round) {
		throw new Error('Round not found');
	}

	// Reveal server seed for this round
	const serverSeed = randomBytes(32).toString('hex');
	const { error: revealError } = await supabase
		.from('battle_rounds')
		.update({
			revealed_server_seed: serverSeed
		})
		.eq('id', round.id);

	if (revealError) {
		throw new Error('Failed to reveal server seed');
	}

	// Process pulls for each participant
	for (const participant of battle.participants) {
		const item = selectItemByProbability(
			caseItems,
			serverSeed,
			participant.client_seed || '',
			roundIndex
		);

		// Record the pull
		const { error: pullError } = await supabase.from('battle_pulls').insert({
			round_id: round.id,
			participant_id: participant.id,
			item_id: item.id,
			client_seed: participant.client_seed || '',
			nonce: roundIndex,
			hash: createHash('sha256')
				.update(serverSeed + ':' + (participant.client_seed || '') + ':' + roundIndex)
				.digest('hex'),
			mapped_roll: item.probability
		});

		if (pullError) {
			console.error('Failed to record pull:', pullError);
		}
	}

	// Check if this was the last round
	if (roundIndex >= battle.rounds_count - 1) {
		await settleBattle(battleId);
	} else {
		// Start next round
		setTimeout(() => processBattleRound(battleId, roundIndex + 1), 2000);
	}
}

/**
 * Settles a battle and determines the winner
 */
export async function settleBattle(battleId: string): Promise<void> {
	const supabase = getSupabaseServer();

	// Get battle with all pulls
	const { data: battle, error: battleError } = await supabase
		.from('battles')
		.select(
			`
			*,
			participants:battle_participants(*, user:user_profiles(*))
		`
		)
		.eq('id', battleId)
		.single();

	if (battleError || !battle) {
		throw new Error('Battle not found');
	}

	// Execute subquery separately first
	const { data: battleRounds } = await supabase
		.from('battle_rounds')
		.select('id')
		.eq('battle_id', battleId);

	const roundIds = battleRounds?.map((r) => r.id) || [];

	// Get all pulls for this battle
	const { data: pulls, error: pullsError } = await supabase
		.from('battle_pulls')
		.select(
			`
			*,
			item:case_items(*),
			participant:battle_participants(*, user:user_profiles(*))
		`
		)
		// Then use the array:
		.in('round_id', roundIds);

	if (pullsError || !pulls) {
		throw new Error('Failed to load battle pulls');
	}

	// Calculate total values per participant
	const participantTotals: Record<string, number> = {};

	for (const participant of battle.participants) {
		participantTotals[participant.id] = 0;
	}

	for (const pull of pulls) {
		if (pull.item && pull.participant) {
			participantTotals[pull.participant.id] += Number(pull.item.market_value);
		}
	}

	// Determine winner based on mode
	let winnerId: string | null = null;
	if (battle.mode === 'standard') {
		// Highest total value wins
		let maxValue = 0;
		for (const [participantId, total] of Object.entries(participantTotals)) {
			if (total > maxValue) {
				maxValue = total;
				winnerId = participantId;
			}
		}
	} else {
		// Crazy mode - lowest value wins
		let minValue = Infinity;
		for (const [participantId, total] of Object.entries(participantTotals)) {
			if (total < minValue) {
				minValue = total;
				winnerId = participantId;
			}
		}
	}

	// Handle ties with provably fair coin flip if needed
	const tiedParticipants = Object.entries(participantTotals).filter(
		([, total]) => total === participantTotals[winnerId || '']
	);

	if (tiedParticipants.length > 1 && winnerId) {
		// Provably fair coin flip
		const tieSeed = randomBytes(32).toString('hex');
		const hash = createHash('sha256')
			.update(tieSeed + ':' + battleId + ':tiebreak')
			.digest('hex');
		const coinFlip = parseInt(hash.substring(0, 8), 16) % tiedParticipants.length;
		winnerId = tiedParticipants[coinFlip][0];
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
		throw new Error('Failed to complete battle');
	}

	// Credit winner with pot amount
	if (winnerId) {
		const creditResult = await updateUserBalance(winnerId, battle.total_pot, 'add');
		if (!creditResult.success) {
			console.error('Failed to credit winner:', creditResult.error);
		}

		// Update user stats
		await updateBattleStats(winnerId, battle.participants.length, battle.entry_fee);
	}

	// Record battle results
	for (const [participantId, total] of Object.entries(participantTotals)) {
		await supabase.from('battle_results').insert({
			battle_id: battleId,
			participant_id: participantId,
			total_value: total,
			is_winner: participantId === winnerId
		});
	}
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
 * Selects an item from the case using weighted probability
 */
function selectItemByProbability(
	items: CaseItem[],
	serverSeed: string,
	clientSeed: string,
	nonce: number
): CaseItem {
	// Provably fair selection
	const combinedSeed = serverSeed + ':' + clientSeed + ':' + nonce;
	const hash = createHash('sha256').update(combinedSeed).digest('hex');
	const roll = parseInt(hash.substring(0, 8), 16) / 0xffffffff;

	// Map roll to item using cumulative probability
	let cumulativeProb = 0;
	for (const item of items) {
		cumulativeProb += item.probability;
		if (roll <= cumulativeProb) {
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
