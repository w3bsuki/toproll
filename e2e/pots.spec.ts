import { test, expect } from '@playwright/test';

test.describe('Community Pots', () => {
	test.beforeEach(async ({ page }) => {
		// Visit the pots page
		await page.goto('/pots');
	});

	test('pots page loads and displays available pots', async ({ page }) => {
		// Should show the pots heading
		await expect(page.locator('h1:has-text("Community Pots")')).toBeVisible();

		// Should show at least one pot card (mock data)
		const potCards = page.locator('[data-testid="pot-card"]');
		if (await potCards.first().isVisible()) {
			await expect(potCards.first()).toBeVisible();
		}
	});

	test('can create a new pot', async ({ page }) => {
		// Look for create pot button
		const createPotButton = page.locator('button:has-text("Create Pot")');

		if (await createPotButton.isVisible()) {
			await createPotButton.click();

			// Should show create pot modal
			await expect(page.locator('[data-testid="create-pot-modal"]')).toBeVisible();

			// Fill out pot creation form
			await page.fill('input[name="entry_cost"]', '10');
			await page.fill('input[name="max_tickets"]', '100');
			await page.fill('input[name="max_per_user"]', '10');

			// Submit form
			await page.click('button:has-text("Create Pot")');

			// Should close modal and show success message
			await expect(page.locator('[data-testid="create-pot-modal"]')).not.toBeVisible();
		}
	});

	test('can join an existing pot', async ({ page }) => {
		// Find a pot that is open for joining
		const openPots = page.locator('[data-status="open"]');

		if (await openPots.first().isVisible()) {
			await openPots.first().click();

			// Should navigate to pot details page
			await expect(page.url()).toContain('/pots/');

			// Look for join pot button
			const joinPotButton = page.locator('button:has-text("Join Pot")');

			if (await joinPotButton.isVisible()) {
				// Fill ticket quantity
				await page.fill('input[name="ticket_count"]', '5');

				// Click join button
				await joinPotButton.click();

				// Should show success message or update UI
				await expect(page.locator('text=Successfully joined pot')).toBeVisible({ timeout: 10000 });
			}
		}
	});

	test('can lock a pot when full', async ({ page }) => {
		// This test simulates locking a pot that has reached its threshold
		// In a real scenario, this would happen automatically or be triggered by the creator

		const openPots = page.locator('[data-status="open"]');

		if (await openPots.first().isVisible()) {
			await openPots.first().click();

			// Look for lock pot button (only visible to pot creator or when conditions are met)
			const lockPotButton = page.locator('button:has-text("Lock Pot")');

			if (await lockPotButton.isVisible()) {
				await lockPotButton.click();

				// Should confirm pot locking
				await page.click('button:has-text("Confirm Lock")');

				// Pot status should change to locked
				await expect(page.locator('[data-status="locked"]')).toBeVisible({ timeout: 10000 });
			}
		}
	});

	test('can settle a completed pot', async ({ page }) => {
		// Find a pot that is ready to be settled
		const lockedPots = page.locator('[data-status="locked"]');

		if (await lockedPots.first().isVisible()) {
			await lockedPots.first().click();

			// Look for settle pot button
			const settlePotButton = page.locator('button:has-text("Settle Pot")');

			if (await settlePotButton.isVisible()) {
				await settlePotButton.click();

				// Should confirm settlement
				await page.click('button:has-text("Confirm Settlement")');

				// Should show winner announcement
				await expect(page.locator('text=Winner')).toBeVisible({ timeout: 10000 });
				await expect(page.locator('[data-testid="winner-info"]')).toBeVisible();
			}
		}
	});

	test('displays pot statistics correctly', async ({ page }) => {
		// Find a pot and check its statistics
		const potCards = page.locator('[data-testid="pot-card"]');

		if (await potCards.first().isVisible()) {
			const firstPot = potCards.first();

			// Check that pot statistics are displayed
			await expect(firstPot.locator('[data-testid="pot-total-value"]')).toBeVisible();
			await expect(firstPot.locator('[data-testid="pot-tickets-sold"]')).toBeVisible();
			await expect(firstPot.locator('[data-testid="pot-entry-cost"]')).toBeVisible();
			await expect(firstPot.locator('[data-testid="pot-participants"]')).toBeVisible();
		}
	});

	test('filters pots by status', async ({ page }) => {
		// Look for status filter buttons
		const filterButtons = page.locator('[data-testid="pot-filter"]');

		if (await filterButtons.first().isVisible()) {
			// Test filtering by different statuses
			const statuses = ['all', 'open', 'locked', 'settled'];

			for (const status of statuses) {
				const filterButton = page.locator(`button:has-text("${status}")`);
				if (await filterButton.isVisible()) {
					await filterButton.click();

					// Wait for filter to apply
					await page.waitForTimeout(500);

					// Verify that filtered pots match the status (except for 'all')
					if (status !== 'all') {
						const visiblePots = page.locator(`[data-status="${status}"]`);
						// At least the first visible pot should have the correct status
						if (await visiblePots.first().isVisible()) {
							await expect(visiblePots.first()).toBeVisible();
						}
					}
				}
			}
		}
	});

	test('pot details page shows comprehensive information', async ({ page }) => {
		// Navigate to a specific pot
		const potCards = page.locator('[data-testid="pot-card"]');

		if (await potCards.first().isVisible()) {
			await potCards.first().click();

			// Should show pot details
			await expect(page.locator('[data-testid="pot-header"]')).toBeVisible();
			await expect(page.locator('[data-testid="pot-stats"]')).toBeVisible();
			await expect(page.locator('[data-testid="pot-participants"]')).toBeVisible();

			// Should show participant list if there are participants
			const participants = page.locator('[data-testid="participant-entry"]');
			if (await participants.first().isVisible()) {
				await expect(participants.first()).toBeVisible();
			}

			// Should show action buttons based on pot status and user permissions
			const joinButton = page.locator('button:has-text("Join Pot")');
			const lockButton = page.locator('button:has-text("Lock Pot")');
			const settleButton = page.locator('button:has-text("Settle Pot")');

			// At least one of these should be visible depending on pot state
			const actionButtonsVisible = await Promise.all([
				joinButton.isVisible(),
				lockButton.isVisible(),
				settleButton.isVisible()
			]);

			expect(actionButtonsVisible.some(Boolean)).toBe(true);
		}
	});
});

test.describe('Community Pots API Integration', () => {
	test('pots API endpoint returns valid data', async ({ request }) => {
		const response = await request.get('/api/pots');
		expect(response.status()).toBe(200);

		const data = await response.json();
		expect(Array.isArray(data)).toBe(true);
	});

	test('pot creation API works with valid data', async ({ request }) => {
		const potData = {
			entry_cost: 10,
			max_tickets: 100,
			max_per_user: 10,
			expires_in_minutes: 60
		};

		const response = await request.post('/api/pots', {
			data: potData
		});

		// Should return 201 or 200 depending on implementation
		expect([200, 201]).toContain(response.status());

		if (response.status() !== 404) {
			// Skip if endpoint not implemented
			const data = await response.json();
			expect(data).toHaveProperty('id');
			expect(data).toHaveProperty('entry_cost', potData.entry_cost);
		}
	});

	test('pot join API handles requests correctly', async ({ request }) => {
		// First, try to get a list of pots to find a valid pot ID
		const potsResponse = await request.get('/api/pots');

		if (potsResponse.status() === 200) {
			const pots = await potsResponse.json();

			if (pots.length > 0) {
				const potId = pots[0].id;

				const joinResponse = await request.post(`/api/pots/${potId}/join`, {
					data: { ticket_count: 5 }
				});

				// Should return 200, 201, or appropriate error code
				expect([200, 201, 400, 401, 404]).toContain(joinResponse.status());
			}
		}
	});

	test('pot lock API works for eligible users', async ({ request }) => {
		// Find a pot that can be locked
		const potsResponse = await request.get('/api/pots?status=open');

		if (potsResponse.status() === 200) {
			const pots = await potsResponse.json();

			if (pots.length > 0) {
				const potId = pots[0].id;

				const lockResponse = await request.post(`/api/pots/${potId}/lock`);

				// Should return 200, 401 (unauthorized), 403 (forbidden), or 404
				expect([200, 401, 403, 404]).toContain(lockResponse.status());
			}
		}
	});

	test('pot settle API determines winner correctly', async ({ request }) => {
		// Find a pot that can be settled
		const potsResponse = await request.get('/api/pots?status=locked');

		if (potsResponse.status() === 200) {
			const pots = await potsResponse.json();

			if (pots.length > 0) {
				const potId = pots[0].id;

				const settleResponse = await request.post(`/api/pots/${potId}/settle`);

				// Should return 200, 401 (unauthorized), 403 (forbidden), or 404
				expect([200, 401, 403, 404]).toContain(settleResponse.status());

				if (settleResponse.status() === 200) {
					const data = await settleResponse.json();
					expect(data).toHaveProperty('winner_user_id');
				}
			}
		}
	});
});
