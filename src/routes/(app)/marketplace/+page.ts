import type { PageLoad } from './$types';

// ✅ Enable preloading and code splitting for marketplace
export const load: PageLoad = async () => {
	// Dynamically import heavy marketplace components
	const [{ default: MarketplaceFilters }, { default: MarketplaceItemCard }] = await Promise.all([
		import('$lib/features/marketplace/MarketplaceFilters.svelte'),
		import('$lib/features/marketplace/MarketplaceItemCard.svelte')
	]);

	return {
		components: {
			MarketplaceFilters,
			MarketplaceItemCard
		}
	};
};
