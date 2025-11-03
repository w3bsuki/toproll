import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getCurrentUser } from '$lib/server/services/auth';
import { getUserInventory, syncUserInventory } from '$lib/server/services/steamInventory';

// GET /api/inventory -> get user's inventory
export const GET: RequestHandler = async ({ cookies }) => {
	try {
		const user = await getCurrentUser(cookies);

		if (!user) {
			throw error(401, 'Authentication required');
		}

		// Get user's inventory
		const inventory = await getUserInventory(user.id);

		return json({
			inventory,
			user: {
				id: user.id,
				steamId: user.steamId
			}
		});
	} catch (err) {
		console.error('Get user inventory error:', err);

		if (err instanceof Error) {
			if (err.message.includes('Authentication required')) {
				throw error(401, err.message);
			}
		}

		throw error(500, 'Failed to fetch inventory');
	}
};

// POST /api/inventory/sync -> sync user's Steam inventory
export const POST: RequestHandler = async ({ cookies, request }) => {
	try {
		const user = await getCurrentUser(cookies);

		if (!user) {
			throw error(401, 'Authentication required');
		}

		const body = await request.json();
		const { steamId } = body;

		if (!steamId) {
			throw error(400, 'Steam ID is required');
		}

		// Sync user's Steam inventory
		const result = await syncUserInventory(user.id, steamId);

		return json({
			success: result.success,
			itemsImported: result.itemsImported,
			error: result.error
		});
	} catch (err) {
		console.error('Sync inventory error:', err);

		if (err instanceof Error) {
			if (err.message.includes('Authentication required')) {
				throw error(401, err.message);
			}
			if (err.message.includes('Steam ID is required')) {
				throw error(400, err.message);
			}
			if (err.message.includes('Steam Web API key not configured')) {
				throw error(500, 'Steam integration not configured');
			}
		}

		throw error(500, 'Failed to sync inventory');
	}
};
