/**
 * Simple in-memory rate limiter for API routes
 * Uses sliding window approach with cleanup of old entries
 */

export interface RateLimitEntry {
	count: number;
	resetTime: number;
}

export interface RateLimitResult {
	allowed: boolean;
	remaining: number;
	resetTime: number;
}

export class RateLimiter {
	private store = new Map<string, RateLimitEntry>();
	private cleanupInterval: NodeJS.Timeout;

	constructor(
		private maxRequests: number = 100,
		private windowMs: number = 60 * 1000 // 1 minute default
	) {
		// Clean up expired entries every minute
		this.cleanupInterval = setInterval(() => {
			this.cleanup();
		}, 60 * 1000);
	}

	/**
	 * Check if a request is allowed
	 */
	check(identifier: string): RateLimitResult {
		const now = Date.now();
		const entry = this.store.get(identifier);

		if (!entry || now > entry.resetTime) {
			// New entry or expired window
			const newEntry: RateLimitEntry = {
				count: 1,
				resetTime: now + this.windowMs
			};
			this.store.set(identifier, newEntry);

			return {
				allowed: true,
				remaining: this.maxRequests - 1,
				resetTime: newEntry.resetTime
			};
		}

		// Existing entry within window
		if (entry.count >= this.maxRequests) {
			return {
				allowed: false,
				remaining: 0,
				resetTime: entry.resetTime
			};
		}

		entry.count++;
		return {
			allowed: true,
			remaining: this.maxRequests - entry.count,
			resetTime: entry.resetTime
		};
	}

	/**
	 * Clean up expired entries
	 */
	private cleanup(): void {
		const now = Date.now();
		for (const [key, entry] of this.store.entries()) {
			if (now > entry.resetTime) {
				this.store.delete(key);
			}
		}
	}

	/**
	 * Get client identifier from request
	 */
	static getClientIdentifier(event: { request: Request; getClientAddress: () => string }): string {
		// Try various headers for real IP, fallback to SvelteKit's method
		const headers = event.request.headers;

		const cfConnectingIp = headers.get('cf-connecting-ip');
		if (cfConnectingIp) return cfConnectingIp;

		const xForwardedFor = headers.get('x-forwarded-for');
		if (xForwardedFor) {
			// x-forwarded-for can contain multiple IPs, take the first one
			return xForwardedFor.split(',')[0].trim();
		}

		const xRealIp = headers.get('x-real-ip');
		if (xRealIp) return xRealIp;

		// Fallback to SvelteKit's method
		return event.getClientAddress();
	}

	/**
	 * Cleanup interval for graceful shutdown
	 */
	destroy(): void {
		if (this.cleanupInterval) {
			clearInterval(this.cleanupInterval);
		}
	}
}

// Pre-configured rate limiters for different use cases
export const apiRateLimiter = new RateLimiter(100, 60 * 1000); // 100 requests per minute
export const authRateLimiter = new RateLimiter(10, 60 * 1000); // 10 requests per minute for auth
export const strictRateLimiter = new RateLimiter(20, 60 * 1000); // 20 requests per minute for sensitive endpoints
