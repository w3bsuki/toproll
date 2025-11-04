import { test } from '@playwright/test';

test.describe('Debug Steam Auth Failure', () => {
	test('capture actual error from localhost', async ({ page }) => {
		// Intercept console logs
		const logs: string[] = [];
		const errors: string[] = [];
		
		page.on('console', msg => {
			const text = msg.text();
			logs.push(`[${msg.type()}] ${text}`);
			if (msg.type() === 'error') {
				errors.push(text);
			}
		});

		page.on('pageerror', error => {
			errors.push(`PAGE ERROR: ${error.message}\n${error.stack}`);
		});

		// Monitor network requests
		const requests: any[] = [];
		page.on('response', async response => {
			const url = response.url();
			if (url.includes('auth') || url.includes('steam')) {
				try {
					const status = response.status();
					const headers = response.headers();
					let body = '';
					
					if (status !== 200 && status !== 302) {
						try {
							body = await response.text();
						} catch (e) {
							body = '[Could not read body]';
						}
					}
					
					requests.push({
						url,
						status,
						statusText: response.statusText(),
						headers,
						body: body.substring(0, 500)
					});
				} catch (e) {
					console.log('Error capturing response:', e);
				}
			}
		});

		console.log('\n=== TESTING LOCALHOST STEAM AUTH ===\n');
		
		await page.goto('http://localhost:5173');
		await page.waitForLoadState('networkidle');
		
		console.log('1. Page loaded');
		
		// Click Steam button
		const steamButton = page.getByText('Sign in with Steam').first();
		await steamButton.click();
		
		console.log('2. Clicked Steam button');
		
		// Wait for either Steam redirect or error
		try {
			await page.waitForURL(/steamcommunity\.com|error/, { timeout: 10000 });
			console.log('3. Redirected to:', page.url());
		} catch (e) {
			console.log('3. No redirect, still on:', page.url());
		}
		
		// Wait a bit more to capture any delayed errors
		await page.waitForTimeout(3000);
		
		console.log('\n=== CONSOLE LOGS ===');
		logs.forEach(log => console.log(log));
		
		console.log('\n=== ERRORS ===');
		if (errors.length === 0) {
			console.log('No errors!');
		} else {
			errors.forEach(err => console.log(err));
		}
		
		console.log('\n=== AUTH REQUESTS ===');
		requests.forEach(req => {
			console.log(`\n${req.status} ${req.url}`);
			if (req.body && req.status !== 200 && req.status !== 302) {
				console.log('Body:', req.body);
			}
		});
	});

	test('test actual callback with error details', async ({ page }) => {
		console.log('\n=== TESTING CALLBACK ERROR HANDLING ===\n');
		
		const errors: string[] = [];
		page.on('console', msg => {
			if (msg.type() === 'error') {
				errors.push(msg.text());
			}
		});

		// Try to access callback directly with test params
		const testUrl = 'http://localhost:5173/api/auth/steam/callback?openid.mode=id_res&openid.claimed_id=https://steamcommunity.com/openid/id/76561197960287930&nonce=test123';
		
		await page.goto(testUrl);
		await page.waitForTimeout(2000);
		
		console.log('Redirect URL:', page.url());
		
		// Check if there's an error parameter
		const url = new URL(page.url());
		const error = url.searchParams.get('error');
		
		if (error) {
			console.log('\n❌ ERROR DETECTED:', error);
		}
		
		// Check page content for error messages
		const bodyText = await page.locator('body').textContent();
		console.log('\nPage content preview:', bodyText?.substring(0, 500));
		
		if (errors.length > 0) {
			console.log('\n=== CONSOLE ERRORS ===');
			errors.forEach(err => console.log(err));
		}
	});

	test('check server logs and response', async ({ page, request }) => {
		console.log('\n=== CHECKING SERVER RESPONSE ===\n');
		
		// Make direct request to login endpoint
		const response = await request.get('http://localhost:5173/api/auth/steam/login', {
			maxRedirects: 0
		});
		
		console.log('Status:', response.status());
		console.log('Status Text:', response.statusText());
		console.log('Headers:', response.headers());
		
		if (response.status() === 302) {
			const location = response.headers()['location'];
			console.log('\n✓ Redirect Location:', location);
			
			// Parse the redirect URL
			if (location) {
				const url = new URL(location);
				console.log('\nOpenID Parameters:');
				url.searchParams.forEach((value, key) => {
					if (key.startsWith('openid.')) {
						console.log(`  ${key}: ${value}`);
					}
				});
			}
		} else {
			console.log('\n❌ No redirect! Status:', response.status());
			const body = await response.text();
			console.log('Response body:', body.substring(0, 1000));
		}
	});

	test('verify environment variables are loaded', async ({ page }) => {
		console.log('\n=== CHECKING ENV VARS VIA TEST ENDPOINT ===\n');
		
		// Create a test to see if we can check env vars
		// Navigate and execute in browser context
		await page.goto('http://localhost:5173');
		
		// Check if we can make a request that would fail if env vars are wrong
		const response = await page.request.get('http://localhost:5173/api/auth/steam/login');
		
		if (response.status() === 302) {
			const location = response.headers()['location'];
			if (location) {
				const url = new URL(location);
				const returnTo = url.searchParams.get('openid.return_to');
				const realm = url.searchParams.get('openid.realm');
				
				console.log('✓ Steam login endpoint works');
				console.log('  Return To:', returnTo);
				console.log('  Realm:', realm);
				
				// These should NOT be the default values
				if (returnTo?.includes('localhost:5173')) {
					console.log('  ✓ Return URL configured for localhost');
				}
				if (realm?.includes('localhost:5173')) {
					console.log('  ✓ Realm configured for localhost');
				}
			}
		}
	});
});
