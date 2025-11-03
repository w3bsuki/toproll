import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch }) => {
	// ✅ NEW: Preload inventory components for code splitting
	const [{ default: InventoryGrid }] = await Promise.all([
		import('$lib/features/inventory/InventoryGrid.svelte')
	]);

	// Fetch inventory
	const response = await fetch('/api/inventory');
	const data = await response.json();

	return {
		items: data.items,
		inventoryPublic: data.inventoryPublic,
		message: data.message,
		components: {
			InventoryGrid
		}
	};
};

export const prerender = false;
export const ssr = true;
