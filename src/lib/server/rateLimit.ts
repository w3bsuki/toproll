interface RateLimitResult {
	ok: boolean;
	retryAfter?: number;
}

interface RateLimiter {
	limit: number;
	windowMs: number;
	timestamps: Map<string, number[]>;
}

export function createSlidingLimiter({ limit, windowMs }: { limit: number; windowMs: number }): {
	allow: (ip: string, nowMs?: number) => RateLimitResult;
} {
	const limiter: RateLimiter = { limit, windowMs, timestamps: new Map() };

	return {
		allow: (ip: string, nowMs: number = Date.now()): RateLimitResult => {
			const ipTimestamps = limiter.timestamps.get(ip) || [];

			// Prune old timestamps
			const cutoff = nowMs - windowMs;
			const validTimestamps = ipTimestamps.filter((t) => t > cutoff);

			if (validTimestamps.length >= limit) {
				const oldestTimestamp = Math.min(...validTimestamps);
				const retryAfter = Math.ceil((oldestTimestamp + windowMs - nowMs) / 1000);
				return { ok: false, retryAfter };
			}

			// Add current timestamp
			validTimestamps.push(nowMs);
			limiter.timestamps.set(ip, validTimestamps);

			return { ok: true };
		}
	};
}

// Global limiters
export const apiLimiter = createSlidingLimiter({ limit: 60, windowMs: 60_000 });
export const authLimiter = createSlidingLimiter({ limit: 10, windowMs: 60_000 });
