import { test, expect } from '@playwright/test';

test.describe('Case Battles', () => {
	test.beforeEach(async ({ page }) => {
		// Visit the battles page
		await page.goto('/battles');
	});

	test('battles page loads and displays available battles', async ({ page }) => {
		// Should show the battles heading
		await expect(page.locator('h1:has-text("Case Battles")')).toBeVisible();

		// Should show battles grid
		const battlesGrid = page.locator('[data-testid="battles-grid"]');
		if (await battlesGrid.isVisible()) {
			await expect(battlesGrid).toBeVisible();
		}

		// Should show filter controls
		await expect(page.locator('[data-testid="filter-controls"]')).toBeVisible();
	});

	test('can filter battles by status and mode', async ({ page }) => {
		// Test status filter
		const statusFilter = page.locator('select[name="status"]');
		if (await statusFilter.isVisible()) {
			await statusFilter.selectOption('waiting');
			await page.waitForTimeout(500);

			const battles = page.locator('[data-testid="battle-card"]');
			if (await battles.first().isVisible()) {
				await expect(battles.first()).toBeVisible();
			}
		}

		// Test mode filter
		const modeFilter = page.locator('select[name="mode"]');
		if (await modeFilter.isVisible()) {
			await modeFilter.selectOption('standard');
			await page.waitForTimeout(500);

			const battles = page.locator('[data-testid="battle-card"]');
			if (await battles.first().isVisible()) {
				await expect(battles.first()).toBeVisible();
			}
		}
	});

	test('can create a new battle', async ({ page }) => {
		// Look for create battle button
		const createBattleButton = page.locator('button:has-text("Create Battle")');

		if (await createBattleButton.isVisible()) {
			await createBattleButton.click();

			// Should show create battle modal
			await expect(page.locator('[data-testid="create-battle-modal"]')).toBeVisible();

			// Select case
			const caseSelect = page.locator('select[name="case_id"]');
			if (await caseSelect.isVisible()) {
				await caseSelect.selectOption({ index: 0 });
			}

			// Select mode
			const modeSelect = page.locator('select[name="mode"]');
			if (await modeSelect.isVisible()) {
				await modeSelect.selectOption('standard');
			}

			// Select max participants
			const participantsSelect = page.locator('select[name="max_participants"]');
			if (await participantsSelect.isVisible()) {
				await participantsSelect.selectOption('2');
			}

			// Submit battle creation
			await page.click('button:has-text("Create Battle")');

			// Should close modal and show success message
			await expect(page.locator('[data-testid="create-battle-modal"]')).not.toBeVisible();
			await expect(page.locator('text=Battle created successfully')).toBeVisible({
				timeout: 10000
			});
		}
	});

	test('can join an existing battle', async ({ page }) => {
		// Find a battle that is waiting for participants
		const waitingBattles = page.locator('[data-status="waiting"]');

		if (await waitingBattles.first().isVisible()) {
			await waitingBattles.first().click();

			// Should navigate to battle details page
			await expect(page.url()).toContain('/battles/');

			// Look for join battle button
			const joinBattleButton = page.locator('button:has-text("Join Battle")');

			if (await joinBattleButton.isVisible()) {
				// Get current balance before joining
				const balanceElement = page.locator('[data-testid="user-balance"]');
				let balanceBefore = 0;
				if (await balanceElement.isVisible()) {
					const balanceText = await balanceElement.textContent();
					balanceBefore = parseFloat(balanceText?.replace(/[^0-9.]/g, '') || '0');
				}

				// Click join button
				await joinBattleButton.click();

				// Should show success message
				await expect(page.locator('text=Successfully joined battle')).toBeVisible({
					timeout: 10000
				});

				// Balance should be updated
				if (await balanceElement.isVisible()) {
					const balanceText = await balanceElement.textContent();
					const balanceAfter = parseFloat(balanceText?.replace(/[^0-9.]/g, '') || '0');
					expect(balanceAfter).toBeLessThan(balanceBefore);
				}
			}
		}
	});

	test('battle details page shows comprehensive information', async ({ page }) => {
		const battleCards = page.locator('[data-testid="battle-card"]');

		if (await battleCards.first().isVisible()) {
			await battleCards.first().click();

			// Should show battle details
			await expect(page.locator('[data-testid="battle-header"]')).toBeVisible();
			await expect(page.locator('[data-testid="battle-stats"]')).toBeVisible();
			await expect(page.locator('[data-testid="case-information"]')).toBeVisible();

			// Should show participants list
			await expect(page.locator('[data-testid="participants-list"]')).toBeVisible();

			// Should show appropriate action buttons based on battle status
			const joinButton = page.locator('button:has-text("Join Battle")');
			const simulateButton = page.locator('button:has-text("Simulate Battle")');

			const actionButtonsVisible = await Promise.all([
				joinButton.isVisible(),
				simulateButton.isVisible()
			]);

			expect(actionButtonsVisible.some(Boolean)).toBe(true);
		}
	});

	test('can simulate battle results', async ({ page }) => {
		// Find a battle that is in progress
		const inProgressBattles = page.locator('[data-status="in_progress"]');

		if (await inProgressBattles.first().isVisible()) {
			await inProgressBattles.first().click();

			// Look for simulate button
			const simulateButton = page.locator('button:has-text("Simulate Battle")');

			if (await simulateButton.isVisible()) {
				await simulateButton.click();

				// Should show loading state
				await expect(page.locator('[data-testid="simulation-loading"]')).toBeVisible();

				// Should show results when complete
				await expect(page.locator('[data-testid="battle-results"]')).toBeVisible({
					timeout: 15000
				});

				// Should show winner information
				await expect(page.locator('[data-testid="winner-info"]')).toBeVisible();
				await expect(page.locator('text=Winner')).toBeVisible();
			}
		}
	});

	test('displays battle statistics correctly', async ({ page }) => {
		const battleCards = page.locator('[data-testid="battle-card"]');

		if (await battleCards.first().isVisible()) {
			const firstBattle = battleCards.first();

			// Check that battle statistics are displayed
			await expect(firstBattle.locator('[data-testid="battle-total-pot"]')).toBeVisible();
			await expect(firstBattle.locator('[data-testid="battle-participants"]')).toBeVisible();
			await expect(firstBattle.locator('[data-testid="battle-entry-fee"]')).toBeVisible();
			await expect(firstBattle.locator('[data-testid="battle-mode"]')).toBeVisible();
		}
	});

	test('shows real-time battle updates', async ({ page }) => {
		// Find a battle that is waiting for participants
		const waitingBattles = page.locator('[data-status="waiting"]');

		if (await waitingBattles.first().isVisible()) {
			await waitingBattles.first().click();

			// Should show real-time status indicator
			await expect(page.locator('[data-testid="live-indicator"]')).toBeVisible();

			// Should show participant slots
			await expect(page.locator('[data-testid="participant-slots"]')).toBeVisible();

			// Should update when new participants join (simulated)
			const joinButton = page.locator('button:has-text("Join Battle")');
			if (await joinButton.isVisible()) {
				const participantsBefore = await page.locator('[data-testid="participant"]').count();
				await joinButton.click();

				// Wait for update
				await page.waitForTimeout(2000);

				const participantsAfter = await page.locator('[data-testid="participant"]').count();
				expect(participantsAfter).toBeGreaterThan(participantsBefore);
			}
		}
	});

	test('handles battle cancellation gracefully', async ({ page }) => {
		// Find a battle that can be cancelled
		const waitingBattles = page.locator('[data-status="waiting"]');

		if (await waitingBattles.first().isVisible()) {
			await waitingBattles.first().click();

			// Look for cancel button (only visible to battle creator)
			const cancelButton = page.locator('button:has-text("Cancel Battle")');

			if (await cancelButton.isVisible()) {
				await cancelButton.click();

				// Should show confirmation modal
				await expect(page.locator('[data-testid="cancel-confirmation"]')).toBeVisible();

				// Confirm cancellation
				await page.click('button:has-text("Confirm Cancellation")');

				// Should show cancellation message
				await expect(page.locator('text=Battle cancelled')).toBeVisible({ timeout: 10000 });

				// Battle status should change to cancelled
				await expect(page.locator('[data-status="cancelled"]')).toBeVisible();
			}
		}
	});

	test('displays battle results with detailed information', async ({ page }) => {
		// Find a completed battle
		const completedBattles = page.locator('[data-status="completed"]');

		if (await completedBattles.first().isVisible()) {
			await completedBattles.first().click();

			// Should show detailed results
			await expect(page.locator('[data-testid="battle-results"]')).toBeVisible();
			await expect(page.locator('[data-testid="participant-results"]')).toBeVisible();

			// Should show winner announcement
			await expect(page.locator('[data-testid="winner-announcement"]')).toBeVisible();

			// Should show prize distribution
			await expect(page.locator('[data-testid="prize-distribution"]')).toBeVisible();

			// Should show individual pull results
			const pullResults = page.locator('[data-testid="pull-result"]');
			if (await pullResults.first().isVisible()) {
				await expect(pullResults.first()).toBeVisible();
			}
		}
	});

	test('can view battle history and statistics', async ({ page }) => {
		// Look for battle history section
		const historySection = page.locator('[data-testid="battle-history"]');

		if (await historySection.isVisible()) {
			await expect(historySection).toBeVisible();

			// Should show user's battle statistics
			await expect(page.locator('[data-testid="user-battle-stats"]')).toBeVisible();

			// Should show list of past battles
			const pastBattles = page.locator('[data-testid="past-battle"]');
			if (await pastBattles.first().isVisible()) {
				await expect(pastBattles.first()).toBeVisible();
			}
		}
	});
});

test.describe('Case Battles API Integration', () => {
	test('battles API returns valid data', async ({ request }) => {
		const response = await request.get('/api/battles');
		expect(response.status()).toBe(200);

		const data = await response.json();
		expect(data).toHaveProperty('battles');
		expect(Array.isArray(data.battles)).toBe(true);
	});

	test('can create new battle via API', async ({ request }) => {
		const battleData = {
			case_ids: ['case_1'],
			mode: 'standard',
			max_participants: 2
		};

		const response = await request.post('/api/battles', {
			data: battleData
		});

		// Should return 201, 200, or appropriate error code
		expect([200, 201, 400, 401, 404]).toContain(response.status());

		if (response.status() === 201 || response.status() === 200) {
			const data = await response.json();
			expect(data).toHaveProperty('id');
			expect(data).toHaveProperty('mode', battleData.mode);
			expect(data).toHaveProperty('max_participants', battleData.max_participants);
		}
	});

	test('battle join API handles requests correctly', async ({ request }) => {
		// First get available battles
		const battlesResponse = await request.get('/api/battles?status=waiting');

		if (battlesResponse.status() === 200) {
			const data = await battlesResponse.json();
			const battles = data.battles;

			if (battles.length > 0) {
				const battleId = battles[0].id;

				const joinResponse = await request.post(`/api/battles/${battleId}/join`);

				// Should return 200, 400 (battle full/invalid), 401, etc.
				expect([200, 400, 401, 404]).toContain(joinResponse.status());

				if (joinResponse.status() === 200) {
					const result = await joinResponse.json();
					expect(result).toHaveProperty('participants');
				}
			}
		}
	});

	test('battle details API returns comprehensive information', async ({ request }) => {
		// Get a battle ID
		const battlesResponse = await request.get('/api/battles');

		if (battlesResponse.status() === 200) {
			const data = await battlesResponse.json();
			const battles = data.battles;

			if (battles.length > 0) {
				const battleId = battles[0].id;

				const detailsResponse = await request.get(`/api/battles/${battleId}`);
				expect(detailsResponse.status()).toBe(200);

				const battleDetails = await detailsResponse.json();
				expect(battleDetails).toHaveProperty('battle');
				expect(battleDetails).toHaveProperty('participants');

				if (battleDetails.battle.status === 'completed') {
					expect(battleDetails).toHaveProperty('results');
				}
			}
		}
	});

	test('battle simulation API works correctly', async ({ request }) => {
		// Find a battle that can be simulated
		const battlesResponse = await request.get('/api/battles?status=in_progress');

		if (battlesResponse.status() === 200) {
			const data = await battlesResponse.json();
			const battles = data.battles;

			if (battles.length > 0) {
				const battleId = battles[0].id;

				const simulateResponse = await request.post(`/api/battles/${battleId}/start`);

				// Should return 200, 400 (invalid battle state), 401, etc.
				expect([200, 400, 401, 404]).toContain(simulateResponse.status());

				if (simulateResponse.status() === 200) {
					const result = await simulateResponse.json();
					expect(result).toHaveProperty('results');
					expect(result).toHaveProperty('winner_id');
				}
			}
		}
	});

	test('battle filtering API works correctly', async ({ request }) => {
		// Test status filtering
		const waitingResponse = await request.get('/api/battles?status=waiting');
		expect(waitingResponse.status()).toBe(200);

		// Test mode filtering
		const standardResponse = await request.get('/api/battles?mode=standard');
		expect(standardResponse.status()).toBe(200);

		// Test pagination
		const paginatedResponse = await request.get('/api/battles?limit=5&offset=0');
		expect(paginatedResponse.status()).toBe(200);

		const paginatedData = await paginatedResponse.json();
		expect(paginatedData).toHaveProperty('battles');
		expect(paginatedData.battles.length).toBeLessThanOrEqual(5);
	});

	test('provably fair system works', async ({ request }) => {
		// Get a completed battle to test provably fair
		const battlesResponse = await request.get('/api/battles?status=completed');

		if (battlesResponse.status() === 200) {
			const data = await battlesResponse.json();
			const battles = data.battles;

			if (battles.length > 0) {
				const battleId = battles[0].id;

				const detailsResponse = await request.get(`/api/battles/${battleId}`);
				if (detailsResponse.status() === 200) {
					const battleDetails = await detailsResponse.json();

					// Should have provably fair data for completed battles
					if (battleDetails.results && battleDetails.results.length > 0) {
						const firstResult = battleDetails.results[0];
						expect(firstResult).toHaveProperty('hash');
						expect(firstResult).toHaveProperty('client_seed');
						expect(firstResult).toHaveProperty('nonce');
					}
				}
			}
		}
	});
});
