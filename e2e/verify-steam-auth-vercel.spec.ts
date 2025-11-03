import { test } from '@playwright/test';

test.describe('Steam Auth on Vercel Production', () => {
	test('should load homepage and check Steam auth button', async ({ page }) => {
		// Go to production site
		await page.goto('https://toproll-delta.vercel.app');

		// Wait for page to be fully loaded
		await page.waitForLoadState('networkidle');

		// Take screenshot of homepage
		await page.screenshot({ path: 'test-results/vercel-homepage.png', fullPage: true });

		// Check if auth button exists
		const authButton = page.locator('text=Sign in with Steam');
		const authButtonExists = await authButton.count();
		console.log('Steam auth button count:', authButtonExists);

		if (authButtonExists > 0) {
			await authButton.first().screenshot({ path: 'test-results/vercel-auth-button.png' });
		}

		// Check for any error messages
		const errorMessages = await page.locator('[class*="error"]').allTextContents();
		console.log('Error messages found:', errorMessages);

		// Check console for errors
		page.on('console', (msg) => {
			if (msg.type() === 'error') {
				console.error('Browser console error:', msg.text());
			}
		});

		// Try to click the Steam login button if it exists
		if (authButtonExists > 0) {
			console.log('Clicking Steam login button...');
			await authButton.first().click();

			// Wait for navigation
			await page.waitForTimeout(2000);

			// Capture the URL we're redirected to
			const currentUrl = page.url();
			console.log('Redirected to:', currentUrl);

			// Take screenshot after clicking
			await page.screenshot({ path: 'test-results/vercel-after-click.png', fullPage: true });

			// Check if we're on Steam's OpenID page or error page
			if (currentUrl.includes('steamcommunity.com')) {
				console.log('✅ Successfully redirected to Steam OpenID');
			} else if (currentUrl.includes('error')) {
				console.error('❌ Redirected to error page:', currentUrl);
			} else {
				console.log('⚠️ Unexpected redirect:', currentUrl);
			}
		}
	});

	test('should test direct login endpoint', async ({ page }) => {
		// Directly test the login endpoint
		const response = await page.goto('https://toproll-delta.vercel.app/api/auth/steam/login');

		console.log('Login endpoint status:', response?.status());
		console.log('Login endpoint URL:', page.url());

		// Take screenshot
		await page.screenshot({ path: 'test-results/vercel-login-endpoint.png', fullPage: true });

		// Check if we're redirected to Steam
		if (page.url().includes('steamcommunity.com')) {
			console.log('✅ Login endpoint correctly redirects to Steam');
		} else {
			console.error('❌ Login endpoint failed to redirect to Steam');
			console.error('Current URL:', page.url());
		}
	});

	test('should check environment configuration', async ({ request }) => {
		// Test if callback URL is accessible
		const callbackResponse = await request.get(
			'https://toproll-delta.vercel.app/api/auth/steam/callback'
		);
		console.log('Callback endpoint status:', callbackResponse.status());
		console.log('Callback headers:', await callbackResponse.headers());
	});
});
