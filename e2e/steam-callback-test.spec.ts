import { test } from '@playwright/test';

test.describe('Steam Callback Testing', () => {
	const LIVE_URL = 'https://toproll-delta.vercel.app';

	test('simulate Steam callback with mock data', async ({ page }) => {
		console.log('\n=== TESTING STEAM CALLBACK ===');
		
		// First, get a nonce from initiating auth
		await page.goto(LIVE_URL);
		await page.waitForLoadState('networkidle');
		
		// Click Steam button and capture the nonce
		const steamButton = page.getByText('Sign in with Steam').first();
		await steamButton.click();
		
		// Wait for navigation to Steam
		await page.waitForURL(/steamcommunity\.com/);
		
		const currentUrl = page.url();
		console.log('Redirected to Steam:', currentUrl);
		
		// Extract nonce from return_to parameter
		const url = new URL(currentUrl);
		const returnTo = url.searchParams.get('openid.return_to');
		console.log('Return URL:', returnTo);
		
		if (returnTo) {
			const returnUrl = new URL(returnTo);
			const nonce = returnUrl.searchParams.get('nonce');
			console.log('Nonce:', nonce);
			
			// Try to navigate back with a mock Steam response
			// This won't work without actual Steam login, but we can test the callback endpoint
			console.log('\nAttempting to test callback endpoint...');
			
			// Go back to see what happens
			await page.goBack();
			await page.waitForLoadState('networkidle');
			console.log('Back to:', page.url());
		}
	});

	test('check Steam auth API endpoint directly', async ({ page, request }) => {
		console.log('\n=== TESTING STEAM AUTH API ===');
		
		// Test the auth initiate endpoint
		const response = await request.get(`${LIVE_URL}/api/auth/steam`);
		console.log('GET /api/auth/steam status:', response.status());
		console.log('Response headers:', response.headers());
		
		// Check if it redirects
		const location = response.headers()['location'];
		if (location) {
			console.log('Redirects to:', location);
		}
	});

	test('check what happens when clicking buttons without auth', async ({ page }) => {
		console.log('\n=== TESTING UNAUTHENTICATED INTERACTIONS ===');
		
		await page.goto(LIVE_URL);
		await page.waitForLoadState('networkidle');
		
		const tests = [
			{ name: 'Daily Bonus', selector: 'button:has-text("Daily Bonus")' },
			{ name: 'Join Rain Pot', selector: 'button:has-text("Join Rain Pot")' },
			{ name: 'Join Pot', selector: 'button:has-text("Join Pot")' },
		];
		
		for (const testCase of tests) {
			console.log(`\nTesting: ${testCase.name}`);
			
			// Listen for any popups or modals
			page.on('dialog', dialog => {
				console.log('  Dialog appeared:', dialog.message());
			});
			
			const button = page.locator(testCase.selector).first();
			
			if (await button.isVisible()) {
				// Check for data attributes that might indicate auth requirement
				const attrs = await button.evaluate(el => {
					const result: Record<string, string> = {};
					for (const attr of el.attributes) {
						result[attr.name] = attr.value;
					}
					return result;
				});
				console.log('  Attributes:', attrs);
				
				await button.click();
				await page.waitForTimeout(1000);
				
				// Check if any modal or popup appeared
				const modals = await page.locator('[role="dialog"], .modal, [data-modal]').all();
				console.log('  Modals after click:', modals.length);
				
				if (modals.length > 0) {
					const modalText = await modals[0].textContent();
					console.log('  Modal content:', modalText);
				}
				
				console.log('  URL after click:', page.url());
			}
		}
	});

	test('check session/auth state in localStorage', async ({ page }) => {
		console.log('\n=== CHECKING AUTH STATE STORAGE ===');
		
		await page.goto(LIVE_URL);
		await page.waitForLoadState('networkidle');
		await page.waitForTimeout(2000);
		
		const storage = await page.evaluate(() => {
			const result: Record<string, string> = {};
			
			// Check localStorage
			console.log('localStorage keys:', Object.keys(localStorage));
			for (let i = 0; i < localStorage.length; i++) {
				const key = localStorage.key(i);
				if (key) {
					result[`localStorage.${key}`] = localStorage.getItem(key) || '';
				}
			}
			
			// Check sessionStorage
			console.log('sessionStorage keys:', Object.keys(sessionStorage));
			for (let i = 0; i < sessionStorage.length; i++) {
				const key = sessionStorage.key(i);
				if (key) {
					result[`sessionStorage.${key}`] = sessionStorage.getItem(key) || '';
				}
			}
			
			// Check cookies
			result['cookies'] = document.cookie;
			
			return result;
		});
		
		console.log('\nStorage data:');
		Object.entries(storage).forEach(([key, value]) => {
			if (value.length > 100) {
				console.log(`  ${key}: [${value.length} chars]`);
			} else {
				console.log(`  ${key}:`, value);
			}
		});
	});

	test('examine auth-related network requests', async ({ page }) => {
		console.log('\n=== EXAMINING AUTH NETWORK REQUESTS ===');
		
		const authRequests: Array<{ url: string; method: string; status: number | null }> = [];
		
		page.on('response', response => {
			const url = response.url();
			if (url.includes('auth') || url.includes('session') || url.includes('supabase')) {
				authRequests.push({
					url,
					method: response.request().method(),
					status: response.status()
				});
			}
		});
		
		await page.goto(LIVE_URL);
		await page.waitForLoadState('networkidle');
		await page.waitForTimeout(2000);
		
		console.log('\nAuth-related requests:');
		authRequests.forEach(req => {
			console.log(`  ${req.method} ${req.url} - ${req.status}`);
		});
		
		// Try to trigger auth
		console.log('\nClicking Steam button...');
		const steamButton = page.getByText('Sign in with Steam').first();
		await steamButton.click();
		
		await page.waitForTimeout(2000);
		
		console.log('\nRequests after clicking Steam:');
		authRequests.forEach(req => {
			console.log(`  ${req.method} ${req.url} - ${req.status}`);
		});
	});
});
