import { test } from '@playwright/test';

test('diagnose auth issue with full logging', async ({ page }) => {
	const logs: string[] = [];
	
	// Capture ALL console messages
	page.on('console', (msg) => {
		const text = `[${msg.type()}] ${msg.text()}`;
		logs.push(text);
		console.log(text);
	});

	// Capture errors
	page.on('pageerror', (error) => {
		const text = `[PAGE ERROR] ${error.message}`;
		logs.push(text);
		console.log(text);
	});

	// Capture failed requests
	page.on('requestfailed', (request) => {
		const text = `[REQUEST FAILED] ${request.url()} - ${request.failure()?.errorText}`;
		logs.push(text);
		console.log(text);
	});

	console.log('\n=== Loading page ===\n');
	await page.goto('https://toproll-delta.vercel.app');
	
	// Wait for network to be idle
	await page.waitForLoadState('networkidle');

	console.log('\n=== Waiting 10 seconds to see auth state ===\n');
	await page.waitForTimeout(10000);

	// Check auth button state
	const connectingCount = await page.locator('text=Connecting').count();
	const signInCount = await page.locator('text=Sign in with Steam').count();
	
	console.log('\n=== Auth Button State ===');
	console.log('Connecting buttons:', connectingCount);
	console.log('Sign in buttons:', signInCount);

	// Check for cookies
	const cookies = await page.context().cookies();
	console.log('\n=== Cookies ===');
	cookies.forEach(cookie => {
		if (cookie.name.includes('supabase') || cookie.name.includes('steam') || cookie.name.includes('auth')) {
			console.log(`${cookie.name}: ${cookie.value.substring(0, 50)}...`);
		}
	});

	// Check localStorage
	const localStorage = await page.evaluate(() => {
		const items: Record<string, string> = {};
		for (let i = 0; i < window.localStorage.length; i++) {
			const key = window.localStorage.key(i);
			if (key) {
				items[key] = window.localStorage.getItem(key) || '';
			}
		}
		return items;
	});
	
	console.log('\n=== LocalStorage ===');
	Object.entries(localStorage).forEach(([key, value]) => {
		if (key.includes('supabase') || key.includes('steam') || key.includes('auth')) {
			console.log(`${key}: ${value.substring(0, 100)}...`);
		}
	});

	// Take screenshot
	await page.screenshot({ path: 'test-results/auth-diagnostic.png', fullPage: true });

	console.log('\n=== All Console Logs ===');
	logs.forEach(log => console.log(log));
});
