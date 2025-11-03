import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getCurrentUser } from '$lib/services/auth';
import { purchaseMarketplaceListing } from '$lib/server/services/steamInventory';

// POST /api/marketplace/[id]/purchase
export const POST: RequestHandler = async ({ params, cookies }) => {
	try {
		const { id } = params;
		const user = await getCurrentUser(cookies);

		if (!user) {
			throw error(401, 'Authentication required');
		}

		if (!id) {
			throw error(400, 'Listing ID is required');
		}

		// Purchase the marketplace listing
		const result = await purchaseMarketplaceListing(user.id, id);

		if (!result.success) {
			throw error(400, result.error || 'Failed to purchase item');
		}

		return json({
			success: true,
			message: 'Item purchased successfully'
		});
	} catch (err) {
		console.error('Purchase marketplace item error:', err);

		if (err instanceof Error) {
			if (err.message.includes('Authentication required')) {
				throw error(401, err.message);
			}
			if (
				err.message.includes('Listing ID is required') ||
				err.message.includes('Listing not found') ||
				err.message.includes('Insufficient balance') ||
				err.message.includes('Cannot purchase your own listing') ||
				err.message.includes('Failed to process payment') ||
				err.message.includes('Failed to transfer item')
			) {
				throw error(400, err.message);
			}
		}

		throw error(500, 'Failed to purchase marketplace item');
	}
};
