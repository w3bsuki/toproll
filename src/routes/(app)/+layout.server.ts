import type { LayoutServerLoad } from './$types';
import { requireAuth, getUserProfile } from '$lib/services/auth';

/**
 * (app) layout - requires authentication
 * All routes in (app) group require the user to be logged in
 */
export const load: LayoutServerLoad = async ({ cookies }) => {
	// Require auth - throws redirect if not authenticated
	const user = await requireAuth(cookies);

	// Get user profile from database
	const profile = await getUserProfile(user.id);

	return {
		isAuthenticated: true,
		user: {
			id: user.id,
			steamId: user.steamId,
			username: profile?.username || user.steamId,
			avatar: profile?.avatar_url,
			balance: 1570.0, // TODO: Get from user profile stats
			totalWagered: profile?.total_wagered || 0,
			totalProfit: profile?.total_profit || 0,
			winRate: profile?.win_rate || 0,
			biggestWin: profile?.biggest_win || 0,
			caseBattleWins: profile?.case_battle_wins || 0
		}
	};
};
