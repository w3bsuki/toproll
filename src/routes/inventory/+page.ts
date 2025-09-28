import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch }) => {
	// Fetch inventory
	const response = await fetch('/api/inventory');
	const data = await response.json();

	return {
		items: data.items,
		inventoryPublic: data.inventoryPublic,
		message: data.message
	};
};
