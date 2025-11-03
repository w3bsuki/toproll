/**
 * Examples of how to use the security module
 */

import { RateLimiter } from './rateLimiter';
import { validateSecurityHeaders } from './utils';

/**
 * Example: Custom rate limiting in an API route
 */
export async function customRateLimitExample(request: Request) {
	// Create a custom rate limiter for this specific endpoint
	const customLimiter = new RateLimiter(5, 60 * 1000); // 5 requests per minute

	// Get client IP
	const clientId =
		request.headers.get('cf-connecting-ip') ||
		request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
		'127.0.0.1';

	// Check rate limit
	const rateLimitResult = customLimiter.check(clientId);

	if (!rateLimitResult.allowed) {
		return new Response(
			JSON.stringify({
				error: 'Too Many Requests',
				message: 'Rate limit exceeded for this endpoint',
				retryAfter: Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000)
			}),
			{
				status: 429,
				headers: {
					'Content-Type': 'application/json',
					'X-RateLimit-Limit': '5',
					'X-RateLimit-Remaining': '0',
					'X-RateLimit-Reset': new Date(rateLimitResult.resetTime).toISOString(),
					'Retry-After': Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000).toString()
				}
			}
		);
	}

	// Proceed with the request
	return new Response(
		JSON.stringify({
			success: true,
			message: 'Request processed successfully',
			rateLimitRemaining: rateLimitResult.remaining
		}),
		{
			status: 200,
			headers: {
				'Content-Type': 'application/json',
				'X-RateLimit-Limit': '5',
				'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
				'X-RateLimit-Reset': new Date(rateLimitResult.resetTime).toISOString()
			}
		}
	);
}

/**
 * Example: Validate security headers on external service responses
 */
export async function validateExternalServiceSecurity() {
	try {
		const response = await fetch('https://api.example.com/health');

		const validation = validateSecurityHeaders(response);

		console.log('Security Validation Results:', validation);

		if (!validation.valid) {
			console.warn('Security Issues Found:', {
				missing: validation.missing,
				invalid: validation.invalid,
				warnings: validation.warnings
			});
		}

		return validation;
	} catch (error) {
		console.error('Failed to validate external service:', error);
		throw error;
	}
}

/**
 * Example: Middleware for custom rate limiting with user authentication
 */
export function createAuthenticatedRateLimiter() {
	const userLimiters = new Map<string, RateLimiter>();

	return function checkUserRateLimit(userId: string, tier: 'free' | 'premium' | 'enterprise') {
		// Get or create rate limiter for this user
		if (!userLimiters.has(userId)) {
			let maxRequests: number;
			switch (tier) {
				case 'enterprise':
					maxRequests = 1000;
					break;
				case 'premium':
					maxRequests = 100;
					break;
				case 'free':
				default:
					maxRequests = 10;
					break;
			}

			userLimiters.set(userId, new RateLimiter(maxRequests, 60 * 1000));
		}

		const limiter = userLimiters.get(userId)!;
		return limiter.check(userId);
	};
}

/**
 * Example: API route handler with comprehensive security
 */
export async function secureApiHandler(request: Request, event: any) {
	// The global hooks already handle:
	// 1. Rate limiting
	// 2. Security headers
	// 3. IP detection

	// Your API logic here
	const clientId = event.getClientAddress();

	// Log request for monitoring
	if (event.locals.logger) {
		event.locals.logger.info('api_request', {
			path: new URL(request.url).pathname,
			clientId,
			userAgent: request.headers.get('user-agent')
		});
	}

	// Process the request
	// ...

	return new Response(
		JSON.stringify({
			success: true,
			message: 'Secure API response'
		}),
		{
			headers: {
				'Content-Type': 'application/json'
				// Security headers are already added by the global hook
			}
		}
	);
}

/**
 * Example: Custom security middleware for specific routes
 */
export function createCustomSecurityMiddleware(options: {
	maxRequests?: number;
	windowMs?: number;
	allowedOrigins?: string[];
}) {
	const rateLimiter = new RateLimiter(options.maxRequests || 100, options.windowMs || 60 * 1000);

	return async function middleware(request: Request, event: any) {
		// Custom rate limiting
		const clientId = event.getClientAddress();
		const rateLimitResult = rateLimiter.check(clientId);

		if (!rateLimitResult.allowed) {
			return new Response(
				JSON.stringify({
					error: 'Rate limit exceeded',
					message: 'Too many requests to this endpoint'
				}),
				{ status: 429 }
			);
		}

		// Custom origin checking
		if (options.allowedOrigins) {
			const origin = request.headers.get('origin');
			if (origin && !options.allowedOrigins.includes(origin)) {
				return new Response(
					JSON.stringify({
						error: 'Forbidden',
						message: 'Origin not allowed'
					}),
					{ status: 403 }
				);
			}
		}

		// Continue with the request
		return null; // Let the request proceed
	};
}
