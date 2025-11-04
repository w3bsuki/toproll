import { test, expect } from '@playwright/test';

test.describe('Steam API Key Validation', () => {
	test('verify Steam API key is configured', async ({ request }) => {
		console.log('\n=== CHECKING STEAM API CONFIGURATION ===\n');

		// Test Steam API with a known Steam ID (Gabe Newell's public profile)
		const testSteamId = '76561197960287930';
		const apiKey = process.env.STEAM_API_KEY || process.env.STEAM_WEB_API_KEY;

		console.log('Steam API Key present:', apiKey ? '✓ Yes' : '✗ No');
		console.log('API Key value:', apiKey ? apiKey.substring(0, 8) + '...' : 'NOT SET');

		if (!apiKey || apiKey === 'your_steam_api_key_here') {
			console.log('\n❌ STEAM API KEY NOT CONFIGURED\n');
			console.log('You need to:');
			console.log('1. Get a Steam API key from: https://steamcommunity.com/dev/apikey');
			console.log('2. Update your .env file with the real key');
			console.log('3. Restart your dev server\n');
			return;
		}

		console.log('\n✓ API key is set, testing with Steam API...\n');

		// Test the Steam API endpoint
		const steamApiUrl = `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${apiKey}&steamids=${testSteamId}`;

		try {
			const response = await request.get(steamApiUrl);
			const status = response.status();

			console.log('Steam API Response Status:', status);

			if (status === 200) {
				const data = await response.json();
				console.log('\n✅ STEAM API KEY IS VALID!\n');
				console.log('Test response:', JSON.stringify(data, null, 2));
				expect(data.response.players).toBeDefined();
				expect(data.response.players.length).toBeGreaterThan(0);
			} else if (status === 403 || status === 401) {
				console.log('\n❌ STEAM API KEY IS INVALID\n');
				console.log('The API key you provided is not valid or has been revoked.');
				console.log('Get a new one from: https://steamcommunity.com/dev/apikey\n');
			} else {
				console.log('\n⚠️ UNEXPECTED RESPONSE\n');
				console.log('Status:', status);
				const text = await response.text();
				console.log('Response:', text);
			}
		} catch (error) {
			console.log('\n❌ ERROR TESTING STEAM API\n');
			console.log('Error:', error);
		}
	});

	test('check localhost environment variables', async ({ page }) => {
		console.log('\n=== CHECKING LOCALHOST CONFIGURATION ===\n');

		// Navigate to a test endpoint that will show env vars (we'll create this)
		await page.goto('http://localhost:5173');
		await page.waitForLoadState('networkidle');

		// Check if Steam auth endpoint exists
		const response = await page.request.get('http://localhost:5173/api/auth/steam/login');
		console.log('Steam login endpoint status:', response.status());

		if (response.status() === 302) {
			const location = response.headers()['location'];
			console.log('✓ Redirects to:', location);

			if (location && location.includes('steamcommunity.com')) {
				console.log('✅ Steam OAuth flow is configured correctly');

				// Check if the return URL is correct
				if (location.includes('localhost:5173')) {
					console.log('✓ Return URL points to localhost');
				} else {
					console.log('⚠️ Return URL might not be configured for localhost');
				}
			}
		} else {
			console.log('⚠️ Expected 302 redirect, got:', response.status());
		}
	});

	test('check Vercel environment variables', async ({ request }) => {
		console.log('\n=== CHECKING VERCEL CONFIGURATION ===\n');

		const vercelUrl = 'https://toproll-delta.vercel.app';

		// Check if Steam auth endpoint exists on Vercel
		const response = await request.get(`${vercelUrl}/api/auth/steam/login`, {
			maxRedirects: 0
		});

		console.log('Vercel Steam login endpoint status:', response.status());

		if (response.status() === 302) {
			const location = response.headers()['location'];
			console.log('✓ Redirects to:', location);

			if (location && location.includes('steamcommunity.com')) {
				console.log('✅ Vercel Steam OAuth flow is configured');

				// Check if the return URL is correct
				if (location.includes('toproll-delta.vercel.app')) {
					console.log('✓ Return URL points to Vercel domain');
				} else {
					console.log('⚠️ Return URL:', location.match(/return_to=([^&]+)/)?.[1]);
				}
			}
		} else {
			console.log('⚠️ Expected 302 redirect, got:', response.status());
		}
	});

	test('full auth flow simulation', async ({ page }) => {
		console.log('\n=== SIMULATING FULL AUTH FLOW ===\n');

		await page.goto('http://localhost:5173');
		await page.waitForLoadState('networkidle');

		console.log('1. Looking for Steam login button...');
		const steamButton = page.getByText('Sign in with Steam').first();

		try {
			await steamButton.waitFor({ timeout: 5000 });
			console.log('   ✓ Steam button found');

			console.log('2. Clicking Steam button...');
			await steamButton.click();

			console.log('3. Waiting for navigation...');
			await page.waitForURL(/steamcommunity\.com/, { timeout: 5000 });

			const currentUrl = page.url();
			console.log('   ✓ Redirected to Steam');
			console.log('   URL:', currentUrl);

			// Parse the URL to check configuration
			const url = new URL(currentUrl);
			const returnTo = new URL(
				decodeURIComponent(
					url.searchParams.get('openid.return_to') ||
						url.href.match(/return_to=([^&]+)/)?.[1] ||
						''
				)
			);

			console.log('\n4. Checking OAuth parameters:');
			console.log('   Return URL:', returnTo.origin + returnTo.pathname);
			console.log('   Nonce present:', returnTo.searchParams.has('nonce') ? '✓' : '✗');
			console.log('   Realm:', url.searchParams.get('openid.realm'));

			if (returnTo.origin === 'http://localhost:5173') {
				console.log('\n✅ LOCAL AUTH FLOW CONFIGURED CORRECTLY\n');
				console.log('Next steps:');
				console.log('1. Sign in with Steam in the browser');
				console.log('2. You should be redirected back to localhost');
				console.log('3. Check if your profile appears\n');
			} else {
				console.log(
					'\n⚠️ Return URL is not localhost:5173, check STEAM_OPENID_RETURN_TO\n'
				);
			}
		} catch (error) {
			console.log('   ✗ Error:', error);
		}
	});
});
