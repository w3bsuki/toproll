// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		interface Locals {
			user?: {
				id: string;
				steamId: string;
				username: string;
				avatar?: string;
			};
		}

		interface PageData {
			isAuthenticated?: boolean;
			user?: {
				id: string;
				steamId: string;
				username: string;
				avatar?: string;
				balance: number;
				totalWagered: number;
				totalProfit: number;
				winRate: number;
				biggestWin: number;
				caseBattleWins: number;
			} | null;
		}
	}
}

export {};
