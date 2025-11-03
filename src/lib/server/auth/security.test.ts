/**
 * Simple tests for security implementation
 * Run with: pnpm test:unit src/lib/security/test.ts
 */

import { describe, it, expect } from 'vitest';
import { RateLimiter } from './rateLimiter';
import { applySecurityHeaders, getSecurityConfig } from './headers';
import { validateSecurityHeaders } from './utils';

describe('RateLimiter', () => {
	it('should allow requests within limit', () => {
		const limiter = new RateLimiter(5, 1000); // 5 requests per second
		const clientId = 'test-client';

		// First 5 requests should be allowed
		for (let i = 0; i < 5; i++) {
			const result = limiter.check(clientId);
			expect(result.allowed).toBe(true);
			expect(result.remaining).toBe(4 - i);
		}
	});

	it('should block requests exceeding limit', () => {
		const limiter = new RateLimiter(2, 1000); // 2 requests per second
		const clientId = 'test-client-2';

		// First 2 requests should be allowed
		expect(limiter.check(clientId).allowed).toBe(true);
		expect(limiter.check(clientId).allowed).toBe(true);

		// Third request should be blocked
		const result = limiter.check(clientId);
		expect(result.allowed).toBe(false);
		expect(result.remaining).toBe(0);
	});

	it('should reset after window expires', async () => {
		const limiter = new RateLimiter(1, 100); // 1 request per 100ms
		const clientId = 'test-client-3';

		// First request should be allowed
		expect(limiter.check(clientId).allowed).toBe(true);

		// Second request should be blocked
		expect(limiter.check(clientId).allowed).toBe(false);

		// Wait for window to expire
		await new Promise((resolve) => setTimeout(resolve, 150));

		// Should be allowed again
		const result = limiter.check(clientId);
		expect(result.allowed).toBe(true);
		expect(result.remaining).toBe(0);
	});

	it('should handle different clients separately', () => {
		const limiter = new RateLimiter(1, 1000); // 1 request per second
		const client1 = 'client-1';
		const client2 = 'client-2';

		// Both clients should be allowed their first request
		expect(limiter.check(client1).allowed).toBe(true);
		expect(limiter.check(client2).allowed).toBe(true);

		// Second requests should be blocked for both
		expect(limiter.check(client1).allowed).toBe(false);
		expect(limiter.check(client2).allowed).toBe(false);
	});
});

describe('Security Headers', () => {
	it('should apply security headers to response', () => {
		const response = new Response('test');
		const config = getSecurityConfig();

		const securedResponse = applySecurityHeaders(response, config);

		// Check that important headers are set
		expect(securedResponse.headers.get('X-Content-Type-Options')).toBe('nosniff');
		expect(securedResponse.headers.get('X-Frame-Options')).toBe('DENY');
		expect(securedResponse.headers.get('X-XSS-Protection')).toBe('1; mode=block');
		expect(securedResponse.headers.get('Referrer-Policy')).toBe('strict-origin-when-cross-origin');
		expect(securedResponse.headers.get('Cross-Origin-Opener-Policy')).toBe('same-origin');
		expect(securedResponse.headers.get('Cross-Origin-Resource-Policy')).toBe('same-origin');
		expect(securedResponse.headers.get('Permissions-Policy')).toBe(
			'camera=(), microphone=(), geolocation=()'
		);
	});

	it('should include CSP header', () => {
		const response = new Response('test');
		const config = getSecurityConfig();

		const securedResponse = applySecurityHeaders(response, config);

		const csp = securedResponse.headers.get('Content-Security-Policy');
		expect(csp).toBeTruthy();
		expect(csp).toContain("default-src 'self'");
	});

	it('should include HSTS only in production', () => {
		const response = new Response('test');
		const config = getSecurityConfig();

		// Store original NODE_ENV
		const originalEnv = process.env.NODE_ENV;

		try {
			// Test production environment
			process.env.NODE_ENV = 'production';
			const prodResponse = applySecurityHeaders(response.clone(), config);
			const hsts = prodResponse.headers.get('Strict-Transport-Security');
			expect(hsts).toBeTruthy();

			// Test development environment
			process.env.NODE_ENV = 'development';
			const devResponse = applySecurityHeaders(response.clone(), config);
			const hstsDev = devResponse.headers.get('Strict-Transport-Security');
			expect(hstsDev).toBeNull();
		} finally {
			// Restore original NODE_ENV
			process.env.NODE_ENV = originalEnv;
		}
	});
});

describe('Security Validation', () => {
	it('should validate security headers correctly', () => {
		const response = new Response('test');
		response.headers.set('X-Content-Type-Options', 'nosniff');
		response.headers.set('X-Frame-Options', 'DENY');
		response.headers.set('X-XSS-Protection', '1; mode=block');
		response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
		response.headers.set('Cross-Origin-Opener-Policy', 'same-origin');
		response.headers.set('Cross-Origin-Resource-Policy', 'same-origin');

		const validation = validateSecurityHeaders(response);
		expect(validation.valid).toBe(true);
		expect(validation.missing).toHaveLength(0);
		expect(validation.invalid).toHaveLength(0);
	});

	it('should detect missing headers', () => {
		const response = new Response('test');
		// No headers set

		const validation = validateSecurityHeaders(response);
		expect(validation.valid).toBe(false);
		expect(validation.missing.length).toBeGreaterThan(0);
	});

	it('should detect invalid header values', () => {
		const response = new Response('test');
		response.headers.set('X-Content-Type-Options', 'invalid');
		response.headers.set('X-Frame-Options', 'INVALID');

		const validation = validateSecurityHeaders(response);
		expect(validation.valid).toBe(false);
		expect(validation.invalid.length).toBeGreaterThan(0);
	});
});

describe('Client IP Detection', () => {
	it('should extract Cloudflare IP', () => {
		const request = new Request('https://example.com');
		request.headers.set('cf-connecting-ip', '192.168.1.1');

		// Mock the getClientIdentifier method by creating a fake event
		const mockEvent = {
			request,
			getClientAddress: () => '127.0.0.1'
		};

		const ip = RateLimiter.getClientIdentifier(mockEvent);
		expect(ip).toBe('192.168.1.1');
	});

	it('should fallback to getClientAddress', () => {
		const request = new Request('https://example.com');
		const mockEvent = {
			request,
			getClientAddress: () => '127.0.0.1'
		};

		const ip = RateLimiter.getClientIdentifier(mockEvent);
		expect(ip).toBe('127.0.0.1');
	});

	it('should handle x-forwarded-for header', () => {
		const request = new Request('https://example.com');
		request.headers.set('x-forwarded-for', '192.168.1.1, 10.0.0.1');

		const mockEvent = {
			request,
			getClientAddress: () => '127.0.0.1'
		};

		const ip = RateLimiter.getClientIdentifier(mockEvent);
		expect(ip).toBe('192.168.1.1'); // Should take first IP
	});
});
