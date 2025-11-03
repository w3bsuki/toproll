import { defineConfig } from '@playwright/test';

export default defineConfig({
	// No webServer needed for production testing
	testDir: 'e2e',
	use: {
		baseURL: 'https://toproll-delta.vercel.app',
		screenshot: 'only-on-failure',
		video: 'retain-on-failure'
	}
});
