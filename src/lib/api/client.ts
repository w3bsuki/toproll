/**
 * API Client Facade
 *
 * Unified API interface for all backend operations.
 * Routes to real Supabase endpoints and SvelteKit API routes.
 */

import { DEV_FLAGS } from '$lib/config/index';
import * as realProviders from './providers/real/index.js';

// Export real API providers only
export const api = realProviders;

/**
 * Logs API calls for debugging
 */
export function logApiCall(method: string, endpoint: string, data?: unknown): void {
	if (DEV_FLAGS.DEBUG_API_CALLS) {
		console.debug(`[API] ${method} ${endpoint}`, data);
	}
}

/**
 * Type definitions for API responses
 */
export interface ApiResponse<T> {
	success: boolean;
	data?: T;
	error?: string;
	message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
	pagination?: {
		limit: number;
		offset: number;
		total?: number;
		hasMore: boolean;
	};
}

// Re-export all provider methods for convenience
export const { auth, pots, marketplace, battles, inventory } = api;
