import type { PageLoad } from './$types';

// ✅ Enable preloading and code splitting for case opening
export const load: PageLoad = async () => {
	// Dynamically import heavy case opening component
	const [{ default: CaseOpeningRoulette }] = await Promise.all([
		import('$lib/features/cases/CaseOpeningRoulette.svelte')
	]);

	return {
		components: {
			CaseOpeningRoulette
		}
	};
};
