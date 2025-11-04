import { test, expect } from '@playwright/test';

test.describe('Live Site Diagnostic', () => {
	const LIVE_URL = 'https://toproll-delta.vercel.app';

	test('check if site loads', async ({ page }) => {
		await page.goto(LIVE_URL);
		await page.waitForLoadState('networkidle');
		
		// Take screenshot
		await page.screenshot({ path: 'live-site-load.png', fullPage: true });
		
		// Check if basic elements exist
		const body = await page.locator('body');
		await expect(body).toBeVisible();
		
		console.log('Page title:', await page.title());
		console.log('URL:', page.url());
	});

	test('check console errors', async ({ page }) => {
		const errors: string[] = [];
		page.on('console', msg => {
			if (msg.type() === 'error') {
				errors.push(msg.text());
			}
		});

		await page.goto(LIVE_URL);
		await page.waitForLoadState('networkidle');
		
		console.log('Console errors:', errors);
		
		// Log all errors but don't fail the test
		if (errors.length > 0) {
			console.log('Found console errors:', errors);
		}
	});

	test('check if Steam login button exists and is clickable', async ({ page }) => {
		await page.goto(LIVE_URL);
		await page.waitForLoadState('networkidle');
		
		// Look for Steam login button
		const steamButton = page.getByRole('button', { name: /sign in with steam/i });
		
		try {
			await expect(steamButton).toBeVisible({ timeout: 5000 });
			console.log('✓ Steam login button found');
			
			// Check if it's enabled
			const isEnabled = await steamButton.isEnabled();
			console.log('Button enabled:', isEnabled);
			
			// Check href if it's a link
			const href = await steamButton.getAttribute('href');
			console.log('Button href:', href);
		} catch (e) {
			console.log('✗ Steam login button not found');
			
			// Try to find any buttons
			const buttons = await page.locator('button').all();
			console.log('Found', buttons.length, 'buttons total');
			
			// Log all button texts
			for (const btn of buttons) {
				const text = await btn.textContent();
				console.log('Button text:', text);
			}
		}
	});

	test('check auth state initialization', async ({ page }) => {
		// Listen for console logs
		const logs: string[] = [];
		page.on('console', msg => {
			logs.push(`[${msg.type()}] ${msg.text()}`);
		});

		await page.goto(LIVE_URL);
		await page.waitForLoadState('networkidle');
		
		// Wait a bit for auth to initialize
		await page.waitForTimeout(2000);
		
		console.log('Console logs:', logs.filter(log => 
			log.includes('auth') || 
			log.includes('Auth') || 
			log.includes('session') ||
			log.includes('Supabase')
		));
	});

	test('check network requests', async ({ page }) => {
		const requests: string[] = [];
		const failures: string[] = [];
		
		page.on('request', request => {
			requests.push(`${request.method()} ${request.url()}`);
		});
		
		page.on('requestfailed', request => {
			failures.push(`FAILED: ${request.method()} ${request.url()} - ${request.failure()?.errorText}`);
		});

		await page.goto(LIVE_URL);
		await page.waitForLoadState('networkidle');
		
		console.log('Total requests:', requests.length);
		console.log('Failed requests:', failures);
		
		// Log Supabase-related requests
		const supabaseRequests = requests.filter(r => r.includes('supabase'));
		console.log('Supabase requests:', supabaseRequests);
	});

	test('try clicking anything interactive', async ({ page }) => {
		await page.goto(LIVE_URL);
		await page.waitForLoadState('networkidle');
		
		// Try to find and click various interactive elements
		const interactiveSelectors = [
			'button',
			'a[href]',
			'[role="button"]',
			'input',
			'select'
		];
		
		for (const selector of interactiveSelectors) {
			const elements = await page.locator(selector).all();
			console.log(`Found ${elements.length} ${selector} elements`);
			
			if (elements.length > 0) {
				const first = elements[0];
				const text = await first.textContent();
				const isVisible = await first.isVisible();
				const isEnabled = await first.isEnabled();
				
				console.log(`First ${selector}:`, {
					text,
					visible: isVisible,
					enabled: isEnabled
				});
			}
		}
	});
});
