import { describe, it, expect } from 'vitest';
import { createSlidingLimiter } from './rateLimit';

describe('rate limiter', () => {
	it('allows requests within limit', () => {
		const limiter = createSlidingLimiter({ limit: 3, windowMs: 1000 });

		expect(limiter.allow('ip1').ok).toBe(true);
		expect(limiter.allow('ip1').ok).toBe(true);
		expect(limiter.allow('ip1').ok).toBe(true);
	});

	it('blocks requests exceeding limit', () => {
		const limiter = createSlidingLimiter({ limit: 2, windowMs: 1000 });

		expect(limiter.allow('ip1').ok).toBe(true);
		expect(limiter.allow('ip1').ok).toBe(true);
		expect(limiter.allow('ip1').ok).toBe(false);
	});

	it('provides retry after seconds when blocked', () => {
		const limiter = createSlidingLimiter({ limit: 1, windowMs: 5000 });

		limiter.allow('ip1');
		const result = limiter.allow('ip1');

		expect(result.ok).toBe(false);
		expect(result.retryAfter).toBeGreaterThan(0);
		expect(result.retryAfter).toBeLessThanOrEqual(5);
	});

	it('respects sliding window', () => {
		const limiter = createSlidingLimiter({ limit: 1, windowMs: 1000 });
		const now = Date.now();

		expect(limiter.allow('ip1', now).ok).toBe(true);
		expect(limiter.allow('ip1', now + 500).ok).toBe(false);
		expect(limiter.allow('ip1', now + 1001).ok).toBe(true);
	});

	it('isolates different IPs', () => {
		const limiter = createSlidingLimiter({ limit: 1, windowMs: 1000 });

		expect(limiter.allow('ip1').ok).toBe(true);
		expect(limiter.allow('ip2').ok).toBe(true);
		expect(limiter.allow('ip1').ok).toBe(false);
		expect(limiter.allow('ip2').ok).toBe(false);
	});
});
