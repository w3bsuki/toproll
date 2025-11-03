import { test } from '@playwright/test';

test('check auth state on Vercel', async ({ page }) => {
	// Listen for console messages
	const consoleMessages: string[] = [];
	page.on('console', (msg) => {
		const text = msg.text();
		consoleMessages.push(`[${msg.type()}] ${text}`);
		console.log(`[${msg.type()}] ${text}`);
	});

	// Listen for errors
	page.on('pageerror', (error) => {
		console.error('Page error:', error.message);
	});

	// Listen for failed requests
	page.on('response', (response) => {
		if (response.status() >= 400) {
			console.error(`Failed request: ${response.url()} - Status: ${response.status()}`);
		}
	});

	// Go to production site
	await page.goto('https://toproll-delta.vercel.app');

	// Wait for page to load
	await page.waitForLoadState('networkidle');

	// Wait a bit to see auth state resolve
	await page.waitForTimeout(6000);

	// Take screenshot
	await page.screenshot({ path: 'test-results/auth-state-check.png', fullPage: true });

	// Check if still showing "Connecting..."
	const connectingText = await page.locator('text=Connecting...').count();
	console.log('Connecting... buttons found:', connectingText);

	// Check if showing "Sign in with Steam"
	const steamButton = await page.locator('text=Sign in with Steam').count();
	console.log('Sign in with Steam buttons found:', steamButton);

	// Print all console messages
	console.log('\n=== Console Messages ===');
	consoleMessages.forEach((msg) => console.log(msg));
});
