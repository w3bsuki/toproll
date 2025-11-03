/**
 * Marketplace Mock Provider
 *
 * Provides mock marketplace functionality for development and testing.
 * Simulates inventory management, listings creation, and purchasing.
 */

import { withMockLatency, logApiCall } from '$lib/api/client';
import { globalPRNG, MOCK_USERS, MOCK_CS2_SKINS } from './seeds';
import type { MarketplaceListing, CS2Item } from '$lib/types/index';

// In-memory storage for mock marketplace data
let mockInventory: CS2Item[] = [];
let mockListings: MarketplaceListing[] = [];

// Initialize mock marketplace data
function initializeMockMarketplace(): void {
	if (mockInventory.length > 0) return; // Already initialized

	// Create mock inventory for first user
	mockInventory = MOCK_CS2_SKINS.map((skin, index) => ({
		...skin,
		assetid: `asset_${MOCK_USERS[0].id}_${index}`,
		classid: `class_${MOCK_USERS[0].id}_${index}`,
		instanceid: `instance_${MOCK_USERS[0].id}_${index}`
	}));

	// Create mock listings
	mockListings = [
		{
			id: 'listing_1',
			user_id: MOCK_USERS[1].id,
			inventory_id: 'asset_76561198000000002_0',
			price: 275.0,
			status: 'active',
			expires_at: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString(),
			created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
			updated_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
			inventory: {
				...MOCK_CS2_SKINS[0],
				assetid: 'asset_76561198000000002_0',
				classid: 'class_76561198000000002_0',
				instanceid: 'instance_76561198000000002_0'
			},
			seller: {
				id: MOCK_USERS[1].id,
				username: MOCK_USERS[1].username,
				avatar_url: MOCK_USERS[1].avatarUrl
			}
		},
		{
			id: 'listing_2',
			user_id: MOCK_USERS[2].id,
			inventory_id: 'asset_76561198000000003_1',
			price: 12000.0,
			status: 'active',
			expires_at: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3).toISOString(),
			created_at: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
			updated_at: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
			inventory: {
				...MOCK_CS2_SKINS[1],
				assetid: 'asset_76561198000000003_1',
				classid: 'class_76561198000000003_1',
				instanceid: 'instance_76561198000000003_1'
			},
			seller: {
				id: MOCK_USERS[2].id,
				username: MOCK_USERS[2].username,
				avatar_url: MOCK_USERS[2].avatarUrl
			}
		},
		{
			id: 'listing_3',
			user_id: MOCK_USERS[1].id,
			inventory_id: 'asset_76561198000000002_2',
			price: 8250.0,
			status: 'sold',
			expires_at: new Date(Date.now() + 1000 * 60 * 60 * 24 * 5).toISOString(),
			created_at: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
			updated_at: new Date(Date.now() - 1000 * 60 * 60 * 1).toISOString(),
			sold_at: new Date(Date.now() - 1000 * 60 * 60 * 1).toISOString(),
			buyer_id: MOCK_USERS[0].id,
			inventory: {
				...MOCK_CS2_SKINS[2],
				assetid: 'asset_76561198000000002_2',
				classid: 'class_76561198000000002_2',
				instanceid: 'instance_76561198000000002_2'
			},
			seller: {
				id: MOCK_USERS[1].id,
				username: MOCK_USERS[1].username,
				avatar_url: MOCK_USERS[1].avatarUrl
			}
		},
		{
			id: 'listing_4',
			user_id: MOCK_USERS[2].id,
			inventory_id: 'asset_76561198000000003_3',
			price: 6150.0,
			status: 'active',
			expires_at: new Date(Date.now() + 1000 * 60 * 60 * 24 * 10).toISOString(),
			created_at: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
			updated_at: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
			inventory: {
				...MOCK_CS2_SKINS[3],
				assetid: 'asset_76561198000000003_3',
				classid: 'class_76561198000000003_3',
				instanceid: 'instance_76561198000000003_3'
			},
			seller: {
				id: MOCK_USERS[2].id,
				username: MOCK_USERS[2].username,
				avatar_url: MOCK_USERS[2].avatarUrl
			}
		},
		{
			id: 'listing_5',
			user_id: MOCK_USERS[1].id,
			inventory_id: 'asset_76561198000000002_4',
			price: 635.0,
			status: 'active',
			expires_at: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14).toISOString(),
			created_at: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
			updated_at: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
			inventory: {
				...MOCK_CS2_SKINS[4],
				assetid: 'asset_76561198000000002_4',
				classid: 'class_76561198000000002_4',
				instanceid: 'instance_76561198000000002_4'
			},
			seller: {
				id: MOCK_USERS[1].id,
				username: MOCK_USERS[1].username,
				avatar_url: MOCK_USERS[1].avatarUrl
			}
		}
	];
}

/**
 * Mock marketplace provider
 */
export const marketplace = {
	/**
	 * List inventory items for current user
	 */
	async listInventory(): Promise<CS2Item[]> {
		return withMockLatency(async () => {
			logApiCall('GET', '/inventory');

			initializeMockMarketplace();

			// Return inventory for first mock user
			return [...mockInventory];
		});
	},

	/**
	 * List marketplace listings with filters
	 */
	async listListings(filters?: {
		search?: string;
		rarity?: string;
		minPrice?: number;
		maxPrice?: number;
		limit?: number;
		offset?: number;
	}): Promise<MarketplaceListing[]> {
		return withMockLatency(async () => {
			logApiCall('GET', '/marketplace', filters);

			initializeMockMarketplace();

			let filteredListings = mockListings.filter((listing) => listing.status === 'active');

			// Apply search filter
			if (filters?.search) {
				const searchTerm = filters.search.toLowerCase();
				filteredListings = filteredListings.filter(
					(listing) =>
						listing.inventory?.name.toLowerCase().includes(searchTerm) ||
						listing.inventory?.market_name.toLowerCase().includes(searchTerm)
				);
			}

			// Apply rarity filter
			if (filters?.rarity && filters.rarity !== 'all') {
				filteredListings = filteredListings.filter(
					(listing) => listing.inventory?.rarity === filters.rarity
				);
			}

			// Apply price filters
			if (filters?.minPrice !== undefined) {
				filteredListings = filteredListings.filter((listing) => listing.price >= filters.minPrice!);
			}

			if (filters?.maxPrice !== undefined) {
				filteredListings = filteredListings.filter((listing) => listing.price <= filters.maxPrice!);
			}

			// Apply pagination
			if (filters?.offset !== undefined) {
				filteredListings = filteredListings.slice(filters.offset);
			}

			if (filters?.limit !== undefined) {
				filteredListings = filteredListings.slice(0, filters.limit);
			}

			// Sort by created_at (newest first)
			filteredListings.sort(
				(a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
			);

			return filteredListings;
		});
	},

	/**
	 * Create a new marketplace listing
	 */
	async createListing(itemId: string, price: number): Promise<MarketplaceListing> {
		return withMockLatency(async () => {
			logApiCall('POST', '/marketplace/create', { itemId, price });

			initializeMockMarketplace();

			const item = mockInventory.find((item) => item.assetid === itemId);
			if (!item) {
				throw new Error('Item not found in inventory');
			}

			// Check if item is already listed
			const existingListing = mockListings.find(
				(listing) => listing.inventory_id === itemId && listing.status === 'active'
			);

			if (existingListing) {
				throw new Error('Item is already listed');
			}

			const newListing: MarketplaceListing = {
				id: `listing_${Date.now()}_${globalPRNG.next()}`,
				user_id: MOCK_USERS[0].id, // Current user
				inventory_id: itemId,
				price,
				status: 'active',
				expires_at: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString(), // 7 days
				created_at: new Date().toISOString(),
				updated_at: new Date().toISOString(),
				inventory: item,
				seller: {
					id: MOCK_USERS[0].id,
					username: MOCK_USERS[0].username,
					avatar_url: MOCK_USERS[0].avatarUrl
				}
			};

			mockListings.push(newListing);

			return newListing;
		});
	},

	/**
	 * Purchase a marketplace listing
	 */
	async purchase(listingId: string): Promise<{ success: boolean; message?: string }> {
		return withMockLatency(async () => {
			logApiCall('POST', `/marketplace/${listingId}/purchase`);

			initializeMockMarketplace();

			const listing = mockListings.find((l) => l.id === listingId);
			if (!listing) {
				throw new Error('Listing not found');
			}

			if (listing.status !== 'active') {
				throw new Error('Listing is no longer active');
			}

			if (listing.user_id === MOCK_USERS[0].id) {
				throw new Error('Cannot purchase your own listing');
			}

			// Update listing status
			listing.status = 'sold';
			listing.buyer_id = MOCK_USERS[0].id;
			listing.sold_at = new Date().toISOString();
			listing.updated_at = new Date().toISOString();

			// Move item from seller's inventory to buyer's inventory
			const itemIndex = mockInventory.findIndex((item) => item.assetid === listing.inventory_id);
			if (itemIndex !== -1) {
				const item = mockInventory[itemIndex];
				// Create new item for buyer
				const newItem = {
					...item,
					assetid: `asset_${MOCK_USERS[0].id}_${Date.now()}`,
					classid: `class_${MOCK_USERS[0].id}_${Date.now()}`,
					instanceid: `instance_${MOCK_USERS[0].id}_${Date.now()}`
				};
				mockInventory.push(newItem);
			}

			return {
				success: true,
				message: 'Purchase successful! Item has been added to your inventory.'
			};
		});
	},

	/**
	 * Sync Steam inventory (mock implementation)
	 */
	async syncInventory(steamId: string): Promise<{ success: boolean; itemsImported: number }> {
		return withMockLatency(async () => {
			logApiCall('POST', '/inventory/sync', { steamId });

			initializeMockMarketplace();

			// Simulate importing new items
			const newItemsCount = globalPRNG.nextInt(1, 5);

			for (let i = 0; i < newItemsCount; i++) {
				const randomSkin = globalPRNG.nextChoice(MOCK_CS2_SKINS);
				const newItem: CS2Item = {
					...randomSkin,
					assetid: `asset_${MOCK_USERS[0].id}_sync_${Date.now()}_${i}`,
					classid: `class_${MOCK_USERS[0].id}_sync_${Date.now()}_${i}`,
					instanceid: `instance_${MOCK_USERS[0].id}_sync_${Date.now()}_${i}`
				};
				mockInventory.push(newItem);
			}

			return {
				success: true,
				itemsImported: newItemsCount
			};
		});
	},

	/**
	 * Get user's balance (delegates to auth provider)
	 */
	async getUserBalance(): Promise<number> {
		return withMockLatency(async () => {
			logApiCall('GET', '/marketplace/balance');

			// Return balance from first mock user
			return MOCK_USERS[0].balance;
		});
	}
};
