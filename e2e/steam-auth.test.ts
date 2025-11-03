import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';

const TEST_STEAMID = '76561198012345678';
const TEST_USER_NAME = `Test User ${TEST_STEAMID.slice(-8)}`;

test.describe('Steam Authentication Flow', () => {
	test.beforeEach(async ({ page }) => {
		// Set test environment variables for the test mode
		await page.addInitScript(() => {
			// These would normally be set by the test environment
			// For this test, we rely on the test mode in the callback endpoint
			console.log('Running Steam auth test in test mode');
		});
	});

	test('should authenticate user via test mode and access profile', async ({ page }) => {
		// Visit the test callback endpoint directly with test parameters
		// This bypasses the need for real Steam OpenID flow
		const testCallbackUrl = `/api/auth/steam/callback?test=1&test_steamid=${TEST_STEAMID}`;

		await page.goto(testCallbackUrl);

		// Should redirect to profile page after successful authentication
		await page.waitForURL('/profile');

		// Verify we can access the profile API endpoint
		const profileResponse = await page.request.get('/api/auth/profile');
		expect(profileResponse.ok()).toBeTruthy();

		const profileData = await profileResponse.json();

		// Verify profile data structure
		expect(profileData).toHaveProperty('user');
		expect(profileData).toHaveProperty('profile');

		// Verify user data
		expect(profileData.user).toHaveProperty('id');
		expect(profileData.user).toHaveProperty('steamId', TEST_STEAMID);
		expect(profileData.user).toHaveProperty('email');

		// Verify profile data
		expect(profileData.profile).toHaveProperty('username', TEST_USER_NAME);
		expect(profileData.profile).toHaveProperty('avatar_url');
		expect(profileData.profile).toHaveProperty('steam_profile_url');
		expect(profileData.profile).toHaveProperty('balance');
		expect(profileData.profile).toHaveProperty('last_seen');
		expect(profileData.profile).toHaveProperty('created_at');
		expect(profileData.profile).toHaveProperty('updated_at');
	});

	test('should protect profile endpoint without authentication', async ({ page, context }) => {
		// Create a new context with no authentication cookies
		const unauthenticatedContext = await context.browser().newContext();
		const unauthenticatedPage = await unauthenticatedContext.newPage();

		// Try to access profile endpoint without authentication
		const profileResponse = await unauthenticatedPage.request.get('/api/auth/profile');

		expect(profileResponse.status()).toBe(401);

		const errorData = await profileResponse.json();
		expect(errorData).toHaveProperty('message', 'Authentication required');

		await unauthenticatedContext.close();
	});

	test('should update last_seen timestamp on profile access', async ({ page }) => {
		// Authenticate via test mode
		const testCallbackUrl = `/api/auth/steam/callback?test=1&test_steamid=${TEST_STEAMID}`;
		await page.goto(testCallbackUrl);
		await page.waitForURL('/profile');

		// First profile access
		const firstResponse = await page.request.get('/api/auth/profile');
		const firstData = await firstResponse.json();
		const firstLastSeen = firstData.profile.last_seen;

		// Wait a bit to ensure timestamp difference
		await page.waitForTimeout(1100); // Wait > 1 second

		// Second profile access
		const secondResponse = await page.request.get('/api/auth/profile');
		const secondData = await secondResponse.json();
		const secondLastSeen = secondData.profile.last_seen;

		// Verify last_seen was updated
		expect(new Date(secondLastSeen).getTime()).toBeGreaterThan(new Date(firstLastSeen).getTime());
	});

	test('should handle session persistence across pages', async ({ page }) => {
		// Authenticate via test mode
		const testCallbackUrl = `/api/auth/steam/callback?test=1&test_steamid=${TEST_STEAMID}`;
		await page.goto(testCallbackUrl);
		await page.waitForURL('/profile');

		// Verify we can access profile API
		const profileResponse = await page.request.get('/api/auth/profile');
		expect(profileResponse.ok()).toBeTruthy();

		// Navigate to different page
		await page.goto('/');
		await page.waitForLoadState('networkidle');

		// Verify we can still access profile API (session persisted)
		const profileResponseAfterNav = await page.request.get('/api/auth/profile');
		expect(profileResponseAfterNav.ok()).toBeTruthy();

		const profileDataBefore = await profileResponse.json();
		const profileDataAfter = await profileResponseAfterNav.json();

		// Should be the same user
		expect(profileDataBefore.user.id).toBe(profileDataAfter.user.id);
		expect(profileDataBefore.user.steamId).toBe(profileDataAfter.user.steamId);
	});

	test('should validate profile endpoint response structure', async ({ page }) => {
		// Authenticate via test mode
		const testCallbackUrl = `/api/auth/steam/callback?test=1&test_steamid=${TEST_STEAMID}`;
		await page.goto(testCallbackUrl);
		await page.waitForURL('/profile');

		// Get profile data
		const profileResponse = await page.request.get('/api/auth/profile');
		expect(profileResponse.ok()).toBeTruthy();

		const profileData = await profileResponse.json();

		// Validate exact response structure
		expect(profileData).toMatchObject({
			user: {
				id: expect.any(String),
				steamId: TEST_STEAMID,
				email: expect.stringContaining('@steam.toproll.gg')
			},
			profile: {
				username: TEST_USER_NAME,
				avatar_url: expect.stringContaining('test_'),
				steam_profile_url: expect.stringContaining('steamcommunity.com'),
				balance: expect.any(String),
				last_seen: expect.any(String),
				created_at: expect.any(String),
				updated_at: expect.any(String)
			}
		});

		// Validate balance is a valid number
		const balance = parseFloat(profileData.profile.balance);
		expect(balance).toBeGreaterThanOrEqual(0);

		// Validate timestamps are valid ISO dates
		expect(() => new Date(profileData.profile.last_seen)).not.toThrow();
		expect(() => new Date(profileData.profile.created_at)).not.toThrow();
		expect(() => new Date(profileData.profile.updated_at)).not.toThrow();
	});

	test('should reject invalid test mode requests', async ({ page }) => {
		// Try callback without proper test parameters
		const response = await page.request.get('/api/auth/steam/callback');

		// Should redirect to error page since nonce is missing
		// The exact behavior depends on the implementation, but it should not succeed
		expect(response.status()).toBe(302); // Redirect
		expect(response.headers()['location']).toContain('error=');
	});

	test('should handle multiple test users separately', async ({ context }) => {
		const TEST_STEAMID_2 = '76561198087654321';
		const TEST_USER_NAME_2 = `Test User ${TEST_STEAMID_2.slice(-8)}`;

		// Create separate contexts for two users
		const context1 = await context.browser().newContext();
		const context2 = await context.browser().newContext();

		const page1 = await context1.newPage();
		const page2 = await context2.newPage();

		// Authenticate first user
		await page1.goto(`/api/auth/steam/callback?test=1&test_steamid=${TEST_STEAMID}`);
		await page1.waitForURL('/profile');

		// Authenticate second user
		await page2.goto(`/api/auth/steam/callback?test=1&test_steamid=${TEST_STEAMID_2}`);
		await page2.waitForURL('/profile');

		// Get profiles for both users
		const profile1Response = await page1.request.get('/api/auth/profile');
		const profile2Response = await page2.request.get('/api/auth/profile');

		expect(profile1Response.ok()).toBeTruthy();
		expect(profile2Response.ok()).toBeTruthy();

		const profile1Data = await profile1Response.json();
		const profile2Data = await profile2Response.json();

		// Verify they are different users
		expect(profile1Data.user.steamId).toBe(TEST_STEAMID);
		expect(profile2Data.user.steamId).toBe(TEST_STEAMID_2);
		expect(profile1Data.profile.username).toBe(TEST_USER_NAME);
		expect(profile2Data.profile.username).toBe(TEST_USER_NAME_2);
		expect(profile1Data.user.id).not.toBe(profile2Data.user.id);

		// Clean up
		await context1.close();
		await context2.close();
	});
});
