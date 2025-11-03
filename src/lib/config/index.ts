/**
 * Application Configuration
 *
 * This file contains configuration switches that control application behavior.
 */

const isDev = typeof import.meta.env?.DEV === 'boolean' ? import.meta.env.DEV : true;

// Development flags
export const DEV_FLAGS = {
	// Show debug information in console
	DEBUG_API_CALLS: isDev // Show API debug logs in dev mode
};
