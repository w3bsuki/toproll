import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getCurrentUser } from '$lib/services/auth';
import { getCS2Inventory, isInventoryPublic } from '$lib/services/steamAPI';

export const GET: RequestHandler = async ({ cookies }) => {
	try {
		const user = await getCurrentUser(cookies);

		if (!user) {
			throw error(401, 'Authentication required');
		}

		// Check if inventory is public
		const inventoryPublic = await isInventoryPublic(user.steamId);

		if (!inventoryPublic) {
			return json({
				items: [],
				inventoryPublic: false,
				message: 'Your CS2 inventory is private. Please make it public in Steam to view items here.'
			});
		}

		// Fetch inventory from Steam API
		const items = await getCS2Inventory(user.steamId);

		return json({
			items,
			inventoryPublic: true,
			count: items.length
		});
	} catch (err) {
		console.error('Inventory API error:', err);

		if (err instanceof Error && err.message === 'Authentication required') {
			throw error(401, err.message);
		}

		if (err instanceof Error && err.message === 'Inventory is private') {
			return json({
				items: [],
				inventoryPublic: false,
				message: 'Your CS2 inventory is private. Please make it public in Steam to view items here.'
			});
		}

		throw error(500, 'Failed to fetch inventory');
	}
};
