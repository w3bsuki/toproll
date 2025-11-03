import { getSupabaseServer } from '$lib/supabase/server';
import type { Case, CaseItem, CaseOpening, CaseRarity } from '$lib/types/index';

export interface CaseOpeningResult {
	opening: CaseOpening;
	item: CaseItem;
	case: Case;
	profit: number;
	isWin: boolean;
}

/**
 * Gets all available cases
 */
export async function getCases(): Promise<Case[]> {
	const supabase = getSupabaseServer();

	const { data: cases, error } = await supabase
		.from('cases')
		.select('*')
		.order('price', { ascending: true });

	if (error) {
		throw new Error(`Failed to fetch cases: ${error.message}`);
	}

	return cases || [];
}

/**
 * Gets a specific case with its items
 */
export async function getCase(caseId: string): Promise<{ case: Case; items: CaseItem[] } | null> {
	const supabase = getSupabaseServer();

	const { data: caseData, error: caseError } = await supabase
		.from('cases')
		.select('*')
		.eq('id', caseId)
		.single();

	if (caseError || !caseData) {
		return null;
	}

	const { data: items, error: itemsError } = await supabase
		.from('case_items')
		.select('*')
		.eq('case_id', caseId)
		.order('probability', { ascending: false });

	if (itemsError) {
		throw new Error(`Failed to fetch case items: ${itemsError.message}`);
	}

	return {
		case: caseData,
		items: items || []
	};
}

/**
 * Opens a case and returns the result using weighted random selection
 */
export async function openCase(userId: string, caseId: string): Promise<CaseOpeningResult> {
	const supabase = getSupabaseServer();

	// Get case and its items
	const caseData = await getCase(caseId);
	if (!caseData) {
		throw new Error('Case not found');
	}

	const { case: caseInfo, items } = caseData;

	// Check if user has enough balance (simplified - would need actual balance system)
	// For now, we'll assume they have enough balance

	// Weighted random selection based on probabilities
	const selectedItem = selectItemByProbability(items);

	// Calculate profit/loss
	const profit = selectedItem.market_value - caseInfo.price;
	const isWin = profit > 0;

	// Record the opening
	const { data: opening, error: openingError } = await supabase
		.from('case_openings')
		.insert({
			user_id: userId,
			case_id: caseId,
			opened_item_id: selectedItem.id,
			cost: caseInfo.price,
			profit: profit
		})
		.select(
			`
			*,
			case:cases(*),
			item:case_items(*)
		`
		)
		.single();

	if (openingError) {
		throw new Error(`Failed to record case opening: ${openingError.message}`);
	}

	// Update user profile stats
	await updateUserStats(userId, caseInfo.price, profit, isWin);

	return {
		opening: opening as CaseOpening,
		item: selectedItem,
		case: caseInfo,
		profit,
		isWin
	};
}

/**
 * Selects an item from the case using weighted probability
 */
function selectItemByProbability(items: CaseItem[]): CaseItem {
	const totalProbability = items.reduce((sum, item) => sum + item.probability, 0);

	// Generate a random number between 0 and total probability
	const random = Math.random() * totalProbability;

	let cumulativeProbability = 0;
	for (const item of items) {
		cumulativeProbability += item.probability;
		if (random <= cumulativeProbability) {
			return item;
		}
	}

	// Fallback to last item (should never happen if probabilities are correct)
	return items[items.length - 1];
}

/**
 * Updates user profile statistics after case opening
 */
async function updateUserStats(
	userId: string,
	cost: number,
	profit: number,
	isWin: boolean
): Promise<void> {
	const supabase = getSupabaseServer();

	// Get current stats
	const { data: profile, error: profileError } = await supabase
		.from('user_profiles')
		.select('total_wagered, total_profit, win_rate, biggest_win, case_battle_wins')
		.eq('user_id', userId)
		.single();

	if (profileError || !profile) {
		console.warn('Could not update user stats:', profileError);
		return;
	}

	// Calculate new stats
	const newTotalWagered = (profile.total_wagered || 0) + cost;
	const newTotalProfit = (profile.total_profit || 0) + profit;
	const newCaseBattleWins = profile.case_battle_wins || 0;

	// Calculate win rate (simplified - would need more data for accurate calculation)
	const totalOpenings = Math.floor(newTotalWagered / 2.5); // Rough estimate
	const newWinRate =
		totalOpenings > 0 ? ((newCaseBattleWins + (isWin ? 1 : 0)) / totalOpenings) * 100 : 0;

	// Update biggest win if applicable
	const newBiggestWin = profit > (profile.biggest_win || 0) ? profit : profile.biggest_win || 0;

	// Update the profile
	const { error: updateError } = await supabase
		.from('user_profiles')
		.update({
			total_wagered: newTotalWagered,
			total_profit: newTotalProfit,
			win_rate: newWinRate,
			biggest_win: newBiggestWin,
			updated_at: new Date().toISOString()
		})
		.eq('user_id', userId);

	if (updateError) {
		console.warn('Could not update user stats:', updateError);
	}
}

/**
 * Gets user's case opening history
 */
export async function getUserCaseHistory(
	userId: string,
	limit: number = 20
): Promise<CaseOpening[]> {
	const supabase = getSupabaseServer();

	const { data: openings, error } = await supabase
		.from('case_openings')
		.select(
			`
			*,
			case:cases(*),
			item:case_items(*)
		`
		)
		.eq('user_id', userId)
		.order('created_at', { ascending: false })
		.limit(limit);

	if (error) {
		throw new Error(`Failed to fetch case history: ${error.message}`);
	}

	return openings as CaseOpening[];
}

/**
 * Gets case statistics
 */
export async function getCaseStats(caseId: string): Promise<{
	totalOpenings: number;
	averageProfit: number;
	popularItems: { item: CaseItem; count: number }[];
}> {
	const supabase = getSupabaseServer();

	// Get total openings for this case
	const { data: openings, error: openingsError } = await supabase
		.from('case_openings')
		.select('profit, opened_item_id')
		.eq('case_id', caseId);

	if (openingsError) {
		throw new Error(`Failed to fetch case stats: ${openingsError.message}`);
	}

	const totalOpenings = openings?.length || 0;
	const totalProfit = openings?.reduce((sum, opening) => sum + opening.profit, 0) || 0;
	const averageProfit = totalOpenings > 0 ? totalProfit / totalOpenings : 0;

	// Get popular items (most opened)
	const itemCounts: Record<string, number> = {};
	openings?.forEach((opening) => {
		itemCounts[opening.opened_item_id] = (itemCounts[opening.opened_item_id] || 0) + 1;
	});

	// Get item details for top items
	const popularItems: { item: CaseItem; count: number }[] = [];
	for (const [itemId, count] of Object.entries(itemCounts).slice(0, 5)) {
		const { data: item } = await supabase.from('case_items').select('*').eq('id', itemId).single();

		if (item) {
			popularItems.push({ item: item as CaseItem, count });
		}
	}

	return {
		totalOpenings,
		averageProfit,
		popularItems
	};
}
