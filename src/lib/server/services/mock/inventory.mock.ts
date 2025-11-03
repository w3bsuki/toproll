/**
 * Inventory Mock Provider
 *
 * Provides mock inventory functionality for development and testing.
 * Simulates Steam inventory synchronization and management.
 */

import { withMockLatency, logApiCall } from '$lib/api/client';
import { globalPRNG, MOCK_USERS, MOCK_CS2_SKINS } from './seeds';
import type { CS2Item } from '$lib/types/index';

// In-memory storage for mock inventory data
let mockInventory: CS2Item[] = [];

// Initialize mock inventory data
function initializeMockInventory(): void {
	if (mockInventory.length > 0) return; // Already initialized

	// Create mock inventory for first user
	mockInventory = MOCK_CS2_SKINS.map((skin, index) => ({
		...skin,
		assetid: `asset_${MOCK_USERS[0].id}_${index}`,
		classid: `class_${MOCK_USERS[0].id}_${index}`,
		instanceid: `instance_${MOCK_USERS[0].id}_${index}`
	}));
}

/**
 * Mock inventory provider
 */
export const inventory = {
	/**
	 * List inventory items for current user
	 */
	async listInventory(): Promise<CS2Item[]> {
		return withMockLatency(async () => {
			logApiCall('GET', '/inventory');

			initializeMockInventory();

			return [...mockInventory];
		});
	},

	/**
	 * Sync Steam inventory (mock implementation)
	 */
	async syncInventory(steamId: string): Promise<{ success: boolean; itemsImported: number }> {
		return withMockLatency(async () => {
			logApiCall('POST', '/inventory/sync', { steamId });

			initializeMockInventory();

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
	 * Get item by asset ID
	 */
	async getItem(assetId: string): Promise<CS2Item | null> {
		return withMockLatency(async () => {
			logApiCall('GET', `/inventory/${assetId}`);

			initializeMockInventory();

			const item = mockInventory.find((item) => item.assetid === assetId);
			return item || null;
		});
	},

	/**
	 * Remove item from inventory (for marketplace listings)
	 */
	async removeItem(assetId: string): Promise<boolean> {
		return withMockLatency(async () => {
			logApiCall('DELETE', `/inventory/${assetId}`);

			initializeMockInventory();

			const index = mockInventory.findIndex((item) => item.assetid === assetId);
			if (index !== -1) {
				mockInventory.splice(index, 1);
				return true;
			}

			return false;
		});
	},

	/**
	 * Add item to inventory (for marketplace purchases)
	 */
	async addItem(item: Omit<CS2Item, 'assetid' | 'classid' | 'instanceid'>): Promise<CS2Item> {
		return withMockLatency(async () => {
			logApiCall('POST', '/inventory/add', item);

			initializeMockInventory();

			const newItem: CS2Item = {
				...item,
				assetid: `asset_${MOCK_USERS[0].id}_new_${Date.now()}`,
				classid: `class_${MOCK_USERS[0].id}_new_${Date.now()}`,
				instanceid: `instance_${MOCK_USERS[0].id}_new_${Date.now()}`
			};

			mockInventory.push(newItem);

			return newItem;
		});
	}
};
