import type { PageLoad } from './$types';

// ✅ Enable preloading and code splitting for this route
export const load: PageLoad = async ({ params }) => {
	// Dynamically import heavy components (lazy load)
	const [{ default: BattleRoom }] = await Promise.all([
		import('$lib/features/battles/BattleRoom.svelte')
	]);

	return {
		battleId: params.id,
		// Pass lazy-loaded component to page
		components: {
			BattleRoom
		}
	};
};
