import type { PageLoad } from './$types';

// ✅ Enable preloading and code splitting
export const load: PageLoad = async () => {
	// Preload pot components
	const [{ default: CommunityPotsGrid }, { default: PotEntryModal }] = await Promise.all([
		import('$lib/features/pots/CommunityPotsGrid.svelte'),
		import('$lib/features/pots/PotEntryModal.svelte')
	]);

	return {
		components: {
			CommunityPotsGrid,
			PotEntryModal
		}
	};
};

export const prerender = false;
export const ssr = true;
