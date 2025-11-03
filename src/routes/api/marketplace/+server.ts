import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getCurrentUser } from '$lib/server/services/auth';
import { getMarketplaceListings, createMarketplaceListing } from '$lib/server/services/steamInventory';

// GET /api/marketplace -> get marketplace listings
export const GET: RequestHandler = async ({ url, cookies }) => {
	try {
		const searchParams = url.searchParams;
		const limit = parseInt(searchParams.get('limit') || '20');
		const offset = parseInt(searchParams.get('offset') || '0');
		const minPriceParam = searchParams.get('minPrice');
		const maxPriceParam = searchParams.get('maxPrice');
		const minPrice = minPriceParam ? parseFloat(minPriceParam) : undefined;
		const maxPrice = maxPriceParam ? parseFloat(maxPriceParam) : undefined;
		const rarity = searchParams.get('rarity') || undefined;
		const search = searchParams.get('search') || undefined;

		// Validate pagination parameters
		if (limit < 1 || limit > 100) {
			throw error(400, 'Limit must be between 1 and 100');
		}

		if (offset < 0) {
			throw error(400, 'Offset must be non-negative');
		}

		// Get marketplace listings
		const listings = await getMarketplaceListings(
			limit,
			offset,
			minPrice,
			maxPrice,
			rarity,
			search
		);

		// Get current user if authenticated
		const currentUser = await getCurrentUser(cookies);

		return json({
			listings,
			pagination: {
				limit,
				offset,
				hasMore: listings.length === limit
			},
			currentUser: currentUser
				? {
						id: currentUser.id,
						steamId: currentUser.steamId
					}
				: null
		});
	} catch (err) {
		console.error('Marketplace listings error:', err);

		if (err instanceof Error) {
			if (err.message.includes('Limit must be') || err.message.includes('Offset must be')) {
				throw error(400, err.message);
			}
		}

		throw error(500, 'Failed to fetch marketplace listings');
	}
};

// POST /api/marketplace -> create marketplace listing
export const POST: RequestHandler = async ({ request, cookies }) => {
	try {
		const user = await getCurrentUser(cookies);

		if (!user) {
			throw error(401, 'Authentication required');
		}

		const body = await request.json();
		const { inventory_id, price, expires_in_days } = body;

		// Validate request body
		if (!inventory_id) {
			throw error(400, 'Inventory ID is required');
		}

		if (!price || typeof price !== 'number' || price <= 0) {
			throw error(400, 'Price must be a positive number');
		}

		if (
			expires_in_days &&
			(typeof expires_in_days !== 'number' || expires_in_days <= 0 || expires_in_days > 30)
		) {
			throw error(400, 'Expires in days must be between 1 and 30');
		}

		// Create marketplace listing
		const result = await createMarketplaceListing(user.id, inventory_id, price, expires_in_days);

		if (!result.success) {
			throw error(400, result.error || 'Failed to create listing');
		}

		return json({
			success: true,
			message: 'Listing created successfully',
			listingId: result.listingId
		});
	} catch (err) {
		console.error('Create marketplace listing error:', err);

		if (err instanceof Error) {
			if (err.message.includes('Authentication required')) {
				throw error(401, err.message);
			}
			if (
				err.message.includes('Inventory ID is required') ||
				err.message.includes('Price must be') ||
				err.message.includes('Expires in days must be') ||
				err.message.includes('You do not own this item')
			) {
				throw error(400, err.message);
			}
		}

		throw error(500, 'Failed to create marketplace listing');
	}
};
