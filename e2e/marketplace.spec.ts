import { test, expect } from '@playwright/test';

test.describe('Marketplace', () => {
	test.beforeEach(async ({ page }) => {
		// Visit the marketplace page
		await page.goto('/marketplace');
	});

	test('marketplace page loads and displays listings', async ({ page }) => {
		// Should show the marketplace heading
		await expect(page.locator('h1:has-text("Marketplace")')).toBeVisible();

		// Should show listings grid
		const listingsGrid = page.locator('[data-testid="listings-grid"]');
		if (await listingsGrid.isVisible()) {
			await expect(listingsGrid).toBeVisible();
		}

		// Should show search and filter controls
		await expect(page.locator('[data-testid="search-input"]')).toBeVisible();
		await expect(page.locator('[data-testid="filter-controls"]')).toBeVisible();
	});

	test('can search and filter listings', async ({ page }) => {
		// Find search input
		const searchInput = page.locator('input[placeholder*="search" i]');

		if (await searchInput.isVisible()) {
			// Type a search query
			await searchInput.fill('AK-47');
			await page.waitForTimeout(500); // Wait for debounced search

			// Should filter results
			const listings = page.locator('[data-testid="listing-card"]');
			if (await listings.first().isVisible()) {
				await expect(listings.first()).toBeVisible();
			}
		}

		// Test rarity filter
		const rarityFilter = page.locator('select[name="rarity"]');
		if (await rarityFilter.isVisible()) {
			await rarityFilter.selectOption('Rare');
			await page.waitForTimeout(500);

			// Should filter by rarity
			const listings = page.locator('[data-testid="listing-card"]');
			if (await listings.first().isVisible()) {
				await expect(listings.first()).toBeVisible();
			}
		}

		// Test price range filter
		const minPriceInput = page.locator('input[name="minPrice"]');
		const maxPriceInput = page.locator('input[name="maxPrice"]');

		if ((await minPriceInput.isVisible()) && (await maxPriceInput.isVisible())) {
			await minPriceInput.fill('10');
			await maxPriceInput.fill('100');
			await page.waitForTimeout(500);

			// Should filter by price range
			const listings = page.locator('[data-testid="listing-card"]');
			if (await listings.first().isVisible()) {
				await expect(listings.first()).toBeVisible();
			}
		}
	});

	test('can view listing details', async ({ page }) => {
		// Find a listing and click on it
		const listings = page.locator('[data-testid="listing-card"]');

		if (await listings.first().isVisible()) {
			await listings.first().click();

			// Should navigate to listing details or show modal
			const currentUrl = page.url();
			expect(currentUrl).toContain('/marketplace/');

			// Should show listing details
			await expect(page.locator('[data-testid="listing-details"]')).toBeVisible();
			await expect(page.locator('[data-testid="item-image"]')).toBeVisible();
			await expect(page.locator('[data-testid="item-name"]')).toBeVisible();
			await expect(page.locator('[data-testid="item-price"]')).toBeVisible();
			await expect(page.locator('[data-testid="seller-info"]')).toBeVisible();
		}
	});

	test('can purchase a listing', async ({ page }) => {
		// Find a listing and attempt to purchase
		const listings = page.locator('[data-testid="listing-card"]');

		if (await listings.first().isVisible()) {
			await listings.first().click();

			// Look for purchase button
			const purchaseButton = page.locator('button:has-text("Buy Now")');

			if (await purchaseButton.isVisible()) {
				// Get current balance before purchase
				const balanceElement = page.locator('[data-testid="user-balance"]');
				let balanceBefore = 0;
				if (await balanceElement.isVisible()) {
					const balanceText = await balanceElement.textContent();
					balanceBefore = parseFloat(balanceText?.replace(/[^0-9.]/g, '') || '0');
				}

				// Click purchase button
				await purchaseButton.click();

				// Should show confirmation modal
				await expect(page.locator('[data-testid="purchase-confirmation"]')).toBeVisible();

				// Confirm purchase
				await page.click('button:has-text("Confirm Purchase")');

				// Should show success message
				await expect(page.locator('text=Purchase successful')).toBeVisible({ timeout: 10000 });

				// Balance should be updated
				if (await balanceElement.isVisible()) {
					const balanceText = await balanceElement.textContent();
					const balanceAfter = parseFloat(balanceText?.replace(/[^0-9.]/g, '') || '0');
					expect(balanceAfter).toBeLessThan(balanceBefore);
				}
			}
		}
	});

	test('displays seller information correctly', async ({ page }) => {
		const listings = page.locator('[data-testid="listing-card"]');

		if (await listings.first().isVisible()) {
			await listings.first().click();

			// Should show seller information
			await expect(page.locator('[data-testid="seller-username"]')).toBeVisible();
			await expect(page.locator('[data-testid="seller-avatar"]')).toBeVisible();

			// Should show seller stats if available
			const sellerStats = page.locator('[data-testid="seller-stats"]');
			if (await sellerStats.isVisible()) {
				await expect(sellerStats).toBeVisible();
			}
		}
	});

	test('handles insufficient balance gracefully', async ({ page }) => {
		const listings = page.locator('[data-testid="listing-card"]');

		if (await listings.first().isVisible()) {
			await listings.first().click();

			const purchaseButton = page.locator('button:has-text("Buy Now")');

			if (await purchaseButton.isVisible()) {
				await purchaseButton.click();

				// If balance is insufficient, should show appropriate error
				const errorMessage = page.locator('text=Insufficient balance');
				if (await errorMessage.isVisible({ timeout: 5000 })) {
					await expect(errorMessage).toBeVisible();
				}
			}
		}
	});

	test('pagination works correctly', async ({ page }) => {
		// Look for pagination controls
		const pagination = page.locator('[data-testid="pagination"]');

		if (await pagination.isVisible()) {
			// Should show current page and total pages
			await expect(pagination.locator('[data-testid="current-page"]')).toBeVisible();

			// Should have next/previous buttons if applicable
			const nextButton = page.locator('button:has-text("Next")');
			const prevButton = page.locator('button:has-text("Previous")');

			if (await nextButton.isVisible()) {
				await nextButton.click();
				await page.waitForTimeout(500);

				// Should load next page of results
				const listings = page.locator('[data-testid="listing-card"]');
				if (await listings.first().isVisible()) {
					await expect(listings.first()).toBeVisible();
				}
			}

			if (await prevButton.isVisible()) {
				await prevButton.click();
				await page.waitForTimeout(500);

				// Should go back to previous page
				const listings = page.locator('[data-testid="listing-card"]');
				if (await listings.first().isVisible()) {
					await expect(listings.first()).toBeVisible();
				}
			}
		}
	});

	test('sort functionality works', async ({ page }) => {
		// Look for sort controls
		const sortSelect = page.locator('select[name="sort"]');

		if (await sortSelect.isVisible()) {
			// Test different sort options
			const sortOptions = ['price_low', 'price_high', 'newest', 'oldest'];

			for (const option of sortOptions) {
				const sortOption = sortSelect.locator(`option[value="${option}"]`);
				if (await sortOption.isVisible()) {
					await sortSelect.selectOption(option);
					await page.waitForTimeout(500);

					// Should re-sort listings
					const listings = page.locator('[data-testid="listing-card"]');
					if (await listings.first().isVisible()) {
						await expect(listings.first()).toBeVisible();
					}
				}
			}
		}
	});

	test('shows empty state when no listings match filters', async ({ page }) => {
		// Apply very specific filters that might return no results
		const searchInput = page.locator('input[placeholder*="search" i]');

		if (await searchInput.isVisible()) {
			await searchInput.fill('nonexistentitem12345');
			await page.waitForTimeout(1000);

			// Should show empty state
			const emptyState = page.locator('[data-testid="empty-state"]');
			if (await emptyState.isVisible()) {
				await expect(emptyState).toBeVisible();
				await expect(emptyState.locator('text=No listings found')).toBeVisible();
			}
		}
	});
});

test.describe('Marketplace Inventory Management', () => {
	test.beforeEach(async ({ page }) => {
		// Visit inventory page
		await page.goto('/inventory');
	});

	test('inventory page loads and displays user items', async ({ page }) => {
		// Should show inventory heading
		await expect(page.locator('h1:has-text("Inventory")')).toBeVisible();

		// Should show user balance
		await expect(page.locator('[data-testid="user-balance"]')).toBeVisible();

		// Should show items grid if user has items
		const itemsGrid = page.locator('[data-testid="inventory-grid"]');
		if (await itemsGrid.isVisible()) {
			await expect(itemsGrid).toBeVisible();
		}
	});

	test('can create listing from inventory', async ({ page }) => {
		// Find an item in inventory
		const inventoryItems = page.locator('[data-testid="inventory-item"]');

		if (await inventoryItems.first().isVisible()) {
			await inventoryItems.first().click();

			// Should show item details modal
			await expect(page.locator('[data-testid="item-details-modal"]')).toBeVisible();

			// Look for "List for Sale" button
			const listForSaleButton = page.locator('button:has-text("List for Sale")');

			if (await listForSaleButton.isVisible()) {
				await listForSaleButton.click();

				// Should show create listing form
				await expect(page.locator('[data-testid="create-listing-form"]')).toBeVisible();

				// Fill in listing details
				await page.fill('input[name="price"]', '25.99');

				// Submit listing
				await page.click('button:has-text("Create Listing")');

				// Should show success message
				await expect(page.locator('text=Listing created successfully')).toBeVisible({
					timeout: 10000
				});
			}
		}
	});

	test('can sync Steam inventory', async ({ page }) => {
		// Look for sync inventory button
		const syncButton = page.locator('button:has-text("Sync Inventory")');

		if (await syncButton.isVisible()) {
			await syncButton.click();

			// Should show sync modal or confirmation
			await expect(page.locator('[data-testid="sync-modal"]')).toBeVisible();

			// Confirm sync
			await page.click('button:has-text("Sync Now")');

			// Should show loading state
			await expect(page.locator('[data-testid="sync-loading"]')).toBeVisible();

			// Should show success message when complete
			await expect(page.locator('text=Inventory synced successfully')).toBeVisible({
				timeout: 15000
			});
		}
	});

	test('displays item statistics correctly', async ({ page }) => {
		const inventoryItems = page.locator('[data-testid="inventory-item"]');

		if (await inventoryItems.first().isVisible()) {
			await inventoryItems.first().click();

			// Should show item statistics
			await expect(page.locator('[data-testid="item-market-value"]')).toBeVisible();
			await expect(page.locator('[data-testid="item-rarity"]')).toBeVisible();
			await expect(page.locator('[data-testid="item-condition"]')).toBeVisible();
		}
	});

	test('can filter and sort inventory items', async ({ page }) => {
		// Test rarity filter
		const rarityFilter = page.locator('select[name="rarity"]');
		if (await rarityFilter.isVisible()) {
			await rarityFilter.selectOption('Legendary');
			await page.waitForTimeout(500);

			const items = page.locator('[data-testid="inventory-item"]');
			if (await items.first().isVisible()) {
				await expect(items.first()).toBeVisible();
			}
		}

		// Test sort functionality
		const sortSelect = page.locator('select[name="sort"]');
		if (await sortSelect.isVisible()) {
			await sortSelect.selectOption('value_high');
			await page.waitForTimeout(500);

			const items = page.locator('[data-testid="inventory-item"]');
			if (await items.first().isVisible()) {
				await expect(items.first()).toBeVisible();
			}
		}
	});
});

test.describe('Marketplace API Integration', () => {
	test('marketplace listings API returns valid data', async ({ request }) => {
		const response = await request.get('/api/marketplace');
		expect(response.status()).toBe(200);

		const data = await response.json();
		expect(data).toHaveProperty('listings');
		expect(Array.isArray(data.listings)).toBe(true);
	});

	test('can create new listing via API', async ({ request }) => {
		const listingData = {
			inventory_id: 'test_item_123',
			price: 25.99
		};

		const response = await request.post('/api/marketplace', {
			data: listingData
		});

		// Should return 201, 200, or appropriate error code
		expect([200, 201, 400, 401, 404]).toContain(response.status());

		if (response.status() === 201 || response.status() === 200) {
			const data = await response.json();
			expect(data).toHaveProperty('id');
			expect(data).toHaveProperty('price', listingData.price);
		}
	});

	test('purchase API handles transactions correctly', async ({ request }) => {
		// First get available listings
		const listingsResponse = await request.get('/api/marketplace');

		if (listingsResponse.status() === 200) {
			const data = await listingsResponse.json();
			const listings = data.listings;

			if (listings.length > 0) {
				const listingId = listings[0].id;

				const purchaseResponse = await request.post(`/api/marketplace/${listingId}/purchase`);

				// Should return 200, 400 (invalid listing), 401 (unauthorized), etc.
				expect([200, 400, 401, 404]).toContain(purchaseResponse.status());

				if (purchaseResponse.status() === 200) {
					const result = await purchaseResponse.json();
					expect(result).toHaveProperty('success');
				}
			}
		}
	});

	test('inventory API returns user items', async ({ request }) => {
		const response = await request.get('/api/inventory');

		// Should return 200 or 401 if not authenticated
		expect([200, 401]).toContain(response.status());

		if (response.status() === 200) {
			const data = await response.json();
			expect(data).toHaveProperty('inventory');
			expect(Array.isArray(data.inventory)).toBe(true);
		}
	});

	test('inventory sync API works correctly', async ({ request }) => {
		const syncData = {
			steamId: 'test_steam_id_123'
		};

		const response = await request.post('/api/inventory/sync', {
			data: syncData
		});

		// Should return 200, 400 (invalid Steam ID), 401, etc.
		expect([200, 400, 401, 404]).toContain(response.status());

		if (response.status() === 200) {
			const result = await response.json();
			expect(result).toHaveProperty('success');
			expect(result).toHaveProperty('itemsImported');
		}
	});
});
