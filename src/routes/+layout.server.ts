import type { LayoutServerLoad } from './$types';
import { optionalAuthGuard } from '$lib/hooks/auth.server';
import { getUserProfile } from '$lib/services/auth';

export const load: LayoutServerLoad = async ({ cookies }) => {
	try {
		const { user } = await optionalAuthGuard(cookies);

		if (user) {
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
		}

		return {
			isAuthenticated: false,
			user: null
		};
	} catch (error) {
		console.error('Layout server load error:', error);
		return {
			isAuthenticated: false,
			user: null
		};
	}
};
