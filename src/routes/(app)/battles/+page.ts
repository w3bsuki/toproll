import type { PageLoad } from './$types';

// ✅ Enable preloading and code splitting
export const load: PageLoad = async () => {
	// Preload heavy battle components
	const [{ default: BattleCreateDialog }] = await Promise.all([
		import('$lib/features/battles/BattleCreateDialog.svelte')
	]);

	return {
		components: {
			BattleCreateDialog
		}
	};
};

// Enable prerendering for better performance
export const prerender = false; // Dynamic content
export const ssr = true; // Server-side rendering enabled
