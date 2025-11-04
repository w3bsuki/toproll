import { test } from '@playwright/test';

test('test localhost Steam auth NOW', async ({ page }) => {
	console.log('\n=== TESTING LOCALHOST WITH REAL API KEY ===\n');
	
	// Monitor all console messages
	page.on('console', msg => console.log(`[BROWSER ${msg.type()}]`, msg.text()));
	page.on('pageerror', err => console.log(`[PAGE ERROR]`, err.message));
	
	// Monitor network
	page.on('response', async response => {
		const url = response.url();
		if (url.includes('auth') || url.includes('steam') || url.includes('callback')) {
			console.log(`[NETWORK] ${response.status()} ${url}`);
			if (response.status() >= 400) {
				try {
					const body = await response.text();
					console.log(`[ERROR BODY] ${body.substring(0, 300)}`);
				} catch (e) {
					// ignore
				}
			}
		}
	});
	
	await page.goto('http://localhost:5173');
	await page.waitForLoadState('networkidle');
	
	console.log('✓ Page loaded');
	
	// Find and click Steam button
	const steamButton = page.getByText('Sign in with Steam').first();
	await steamButton.waitFor({ timeout: 5000 });
	console.log('✓ Steam button found');
	
	// Click it
	await steamButton.click();
	console.log('✓ Clicked Steam button');
	
	// Wait for navigation
	await page.waitForTimeout(3000);
	const currentUrl = page.url();
	
	console.log('\n=== RESULT ===');
	console.log('Final URL:', currentUrl);
	
	if (currentUrl.includes('steamcommunity.com')) {
		console.log('✅ SUCCESS! Redirected to Steam login page');
		console.log('\nNow you can:');
		console.log('1. Sign in with your Steam account');
		console.log('2. You should be redirected back to localhost');
		console.log('3. Your profile should appear\n');
	} else if (currentUrl.includes('error')) {
		console.log('❌ FAILED! Got error redirect:', currentUrl);
	} else {
		console.log('⚠️ Still on original page:', currentUrl);
	}
});

test('test Vercel Steam auth NOW', async ({ page }) => {
	console.log('\n=== TESTING VERCEL WITH REAL API KEY ===\n');
	
	page.on('console', msg => {
		if (msg.type() === 'error') {
			console.log(`[BROWSER ERROR]`, msg.text());
		}
	});
	
	await page.goto('https://toproll-delta.vercel.app');
	await page.waitForLoadState('networkidle');
	console.log('✓ Page loaded');
	
	const steamButton = page.getByText('Sign in with Steam').first();
	await steamButton.waitFor({ timeout: 5000 });
	console.log('✓ Steam button found');
	
	await steamButton.click();
	console.log('✓ Clicked Steam button');
	
	await page.waitForTimeout(3000);
	const currentUrl = page.url();
	
	console.log('\n=== RESULT ===');
	console.log('Final URL:', currentUrl);
	
	if (currentUrl.includes('steamcommunity.com')) {
		console.log('✅ SUCCESS! Vercel Steam auth works!');
	} else if (currentUrl.includes('error')) {
		console.log('❌ FAILED! Got error:', currentUrl);
	} else {
		console.log('⚠️ Still on original page');
	}
});
