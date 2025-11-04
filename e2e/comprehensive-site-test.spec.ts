import { test, expect } from '@playwright/test';

test.describe('Comprehensive Site Testing', () => {
	const LIVE_URL = 'https://toproll-delta.vercel.app';

	test('test Steam auth button functionality', async ({ page }) => {
		await page.goto(LIVE_URL);
		await page.waitForLoadState('networkidle');
		
		console.log('\n=== TESTING STEAM AUTH ===');
		
		// Find all Steam login buttons
		const steamButtons = await page.getByText(/Sign in with Steam/i).all();
		console.log(`Found ${steamButtons.length} Steam login buttons`);
		
		for (let i = 0; i < steamButtons.length; i++) {
			const button = steamButtons[i];
			console.log(`\nButton ${i + 1}:`);
			console.log('  Visible:', await button.isVisible());
			console.log('  Enabled:', await button.isEnabled());
			
			// Get parent link if it exists
			const parent = button.locator('xpath=..');
			const tagName = await parent.evaluate(el => el.tagName);
			console.log('  Parent tag:', tagName);
			
			if (tagName === 'A') {
				const href = await parent.getAttribute('href');
				console.log('  HREF:', href);
			}
			
			// Try to get onclick handler
			const onclick = await button.getAttribute('onclick');
			console.log('  onclick:', onclick);
			
			// Check computed styles
			const box = await button.boundingBox();
			console.log('  Bounding box:', box);
			
			// Check if pointer-events is disabled
			const pointerEvents = await button.evaluate(el => 
				window.getComputedStyle(el).pointerEvents
			);
			console.log('  pointer-events:', pointerEvents);
		}
	});

	test('test button clickability', async ({ page }) => {
		await page.goto(LIVE_URL);
		await page.waitForLoadState('networkidle');
		
		console.log('\n=== TESTING BUTTON CLICKABILITY ===');
		
		// Test different button types
		const buttonTests = [
			{ name: 'Daily Bonus', selector: 'button:has-text("Daily Bonus")' },
			{ name: 'Join Rain Pot', selector: 'button:has-text("Join Rain Pot")' },
			{ name: 'Join Pot', selector: 'button:has-text("Join Pot")' },
			{ name: 'View Details', selector: 'button:has-text("View Details")' },
			{ name: 'Home', selector: 'button:has-text("Home")' },
			{ name: 'Cases', selector: 'button:has-text("Cases")' },
		];
		
		for (const test of buttonTests) {
			console.log(`\nTesting: ${test.name}`);
			try {
				const button = page.locator(test.selector).first();
				const isVisible = await button.isVisible({ timeout: 1000 });
				
				if (isVisible) {
					const isEnabled = await button.isEnabled();
					const box = await button.boundingBox();
					const pointerEvents = await button.evaluate(el => 
						window.getComputedStyle(el).pointerEvents
					);
					
					console.log('  ✓ Found');
					console.log('  Enabled:', isEnabled);
					console.log('  Position:', box ? `${box.x}, ${box.y}` : 'none');
					console.log('  pointer-events:', pointerEvents);
					
					// Try to click
					try {
						await button.click({ timeout: 2000, trial: true });
						console.log('  ✓ Clickable (trial)');
						
						// Actually click
						await button.click({ timeout: 2000 });
						console.log('  ✓ Clicked successfully');
						
						// Wait a bit to see if anything happens
						await page.waitForTimeout(500);
						const newUrl = page.url();
						console.log('  URL after click:', newUrl);
					} catch (e: any) {
						console.log('  ✗ Click failed:', e.message);
					}
				} else {
					console.log('  ✗ Not visible');
				}
			} catch (e: any) {
				console.log('  ✗ Not found:', e.message);
			}
		}
	});

	test('test navigation and routing', async ({ page }) => {
		await page.goto(LIVE_URL);
		await page.waitForLoadState('networkidle');
		
		console.log('\n=== TESTING NAVIGATION ===');
		
		const navLinks = [
			{ name: 'Cases', path: '/cases' },
			{ name: 'Battles', path: '/battles' },
			{ name: 'Upgrader', path: '/upgrader' },
			{ name: 'Locker', path: '/locker' },
		];
		
		for (const link of navLinks) {
			console.log(`\nTesting navigation to: ${link.name}`);
			
			// Try direct navigation
			await page.goto(`${LIVE_URL}${link.path}`);
			await page.waitForLoadState('networkidle');
			
			const currentUrl = page.url();
			console.log('  Current URL:', currentUrl);
			console.log('  Expected path:', link.path);
			console.log('  Match:', currentUrl.includes(link.path) ? '✓' : '✗');
			
			// Take screenshot
			await page.screenshot({ 
				path: `test-nav-${link.name.toLowerCase()}.png`,
				fullPage: false 
			});
			
			// Go back to home
			await page.goto(LIVE_URL);
			await page.waitForLoadState('networkidle');
		}
	});

	test('test form interactions', async ({ page }) => {
		await page.goto(LIVE_URL);
		await page.waitForLoadState('networkidle');
		
		console.log('\n=== TESTING FORM INTERACTIONS ===');
		
		// Find the chat input
		const input = page.locator('input').first();
		const isVisible = await input.isVisible();
		
		console.log('Chat input visible:', isVisible);
		
		if (isVisible) {
			const isEnabled = await input.isEnabled();
			const placeholder = await input.getAttribute('placeholder');
			
			console.log('  Enabled:', isEnabled);
			console.log('  Placeholder:', placeholder);
			
			// Try to type
			try {
				await input.click();
				await input.fill('Test message');
				const value = await input.inputValue();
				console.log('  ✓ Can type, value:', value);
			} catch (e: any) {
				console.log('  ✗ Cannot type:', e.message);
			}
		}
	});

	test('check for JavaScript errors and warnings', async ({ page }) => {
		const logs: any[] = [];
		
		page.on('console', msg => {
			logs.push({
				type: msg.type(),
				text: msg.text(),
				location: msg.location()
			});
		});
		
		page.on('pageerror', error => {
			console.log('PAGE ERROR:', error.message);
		});
		
		await page.goto(LIVE_URL);
		await page.waitForLoadState('networkidle');
		await page.waitForTimeout(2000);
		
		console.log('\n=== CONSOLE LOGS ===');
		const errors = logs.filter(l => l.type === 'error');
		const warnings = logs.filter(l => l.type === 'warning');
		
		console.log(`Errors: ${errors.length}`);
		errors.forEach(e => console.log('  -', e.text));
		
		console.log(`Warnings: ${warnings.length}`);
		warnings.forEach(w => console.log('  -', w.text));
		
		console.log('\nAll logs:');
		logs.forEach(l => console.log(`  [${l.type}]`, l.text));
	});

	test('test Steam OAuth flow initiation', async ({ page }) => {
		await page.goto(LIVE_URL);
		await page.waitForLoadState('networkidle');
		
		console.log('\n=== TESTING STEAM OAUTH FLOW ===');
		
		// Find Steam button
		const steamButton = page.getByText('Sign in with Steam').first();
		
		try {
			await steamButton.waitFor({ timeout: 5000 });
			console.log('✓ Steam button found');
			
			// Try to click and see what happens
			const [response] = await Promise.race([
				Promise.all([
					page.waitForNavigation({ timeout: 5000 }).catch(() => null),
					steamButton.click()
				]),
				page.waitForTimeout(5000).then(() => [null])
			]);
			
			if (response) {
				console.log('✓ Navigation occurred');
				console.log('  New URL:', page.url());
				console.log('  Status:', response.status());
			} else {
				console.log('✗ No navigation occurred');
				console.log('  Current URL:', page.url());
			}
			
		} catch (e: any) {
			console.log('✗ Error:', e.message);
		}
	});

	test('inspect DOM structure', async ({ page }) => {
		await page.goto(LIVE_URL);
		await page.waitForLoadState('networkidle');
		
		console.log('\n=== DOM STRUCTURE INSPECTION ===');
		
		// Check for overlays or blockers
		const overlays = await page.locator('[style*="position: fixed"], [style*="position: absolute"]').all();
		console.log(`\nFound ${overlays.length} positioned elements`);
		
		for (let i = 0; i < Math.min(overlays.length, 5); i++) {
			const overlay = overlays[i];
			const zIndex = await overlay.evaluate(el => window.getComputedStyle(el).zIndex);
			const display = await overlay.evaluate(el => window.getComputedStyle(el).display);
			const opacity = await overlay.evaluate(el => window.getComputedStyle(el).opacity);
			const pointerEvents = await overlay.evaluate(el => window.getComputedStyle(el).pointerEvents);
			
			console.log(`Element ${i + 1}:`);
			console.log('  z-index:', zIndex);
			console.log('  display:', display);
			console.log('  opacity:', opacity);
			console.log('  pointer-events:', pointerEvents);
		}
		
		// Check body styles
		const bodyStyles = await page.evaluate(() => {
			const body = document.body;
			const styles = window.getComputedStyle(body);
			return {
				overflow: styles.overflow,
				pointerEvents: styles.pointerEvents,
				userSelect: styles.userSelect,
			};
		});
		console.log('\nBody styles:', bodyStyles);
		
		// Check for any elements with pointer-events: none
		const blockedElements = await page.evaluate(() => {
			const all = document.querySelectorAll('*');
			const blocked: any[] = [];
			all.forEach(el => {
				const styles = window.getComputedStyle(el);
				if (styles.pointerEvents === 'none') {
					blocked.push({
						tag: el.tagName,
						class: el.className,
						id: el.id
					});
				}
			});
			return blocked.slice(0, 10);
		});
		
		console.log('\nElements with pointer-events: none:');
		blockedElements.forEach(el => console.log('  -', el.tag, el.class, el.id));
	});
});
