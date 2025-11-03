import type { Handle } from '@sveltejs/kit';
import { paraglideMiddleware } from '$lib/paraglide/server';
import { createLogger } from '$lib/server/observability/logger';
import { apiLimiter, authLimiter } from '$lib/server/rateLimit';
import { getSupabaseSSR } from '$lib/server/auth/ssr';

// Tiny, fast request ID generator (not cryptographically secure)
function genReqId() {
	// 8 bytes of randomness as hex
	return Math.random().toString(16).slice(2, 10) + Math.random().toString(16).slice(2, 10);
}

/**
 * Supabase auth hook - initializes Supabase SSR client and refreshes session
 */
const handleSupabase: Handle = async ({ event, resolve }) => {
	// Initialize Supabase SSR client
	event.locals.supabase = getSupabaseSSR(event);

	// Helper function to get session
	event.locals.getSession = async () => {
		const {
			data: { session }
		} = await event.locals.supabase.auth.getSession();
		return session;
	};

	return resolve(event, {
		filterSerializedResponseHeaders(name) {
			// Allow Set-Cookie headers from Supabase
			return name === 'content-range' || name === 'x-supabase-api-version';
		}
	});
};

/**
 * Rate limiting hook - handles API route rate limiting
 */
const handleRateLimit: Handle = async ({ event, resolve }) => {
	const pathname = new URL(event.request.url).pathname;

	// Only rate limit API routes
	if (!pathname.startsWith('/api/')) {
		return resolve(event);
	}

	// Get client IP
	const ip = event.getClientAddress() || event.request.headers.get('x-forwarded-for') || 'unknown';

	// Choose appropriate rate limiter
	const limiter = pathname.startsWith('/api/auth/') ? authLimiter : apiLimiter;

	// Check rate limit
	const result = limiter.allow(ip);

	if (!result.ok) {
		return new Response(JSON.stringify({ error: 'Too Many Requests' }), {
			status: 429,
			headers: {
				'Content-Type': 'application/json',
				...(result.retryAfter && { 'Retry-After': result.retryAfter.toString() })
			}
		});
	}

	return resolve(event);
};

/**
 * Security headers hook - applies security headers to all responses
 */
const handleSecurityHeaders: Handle = async ({ event, resolve }) => {
	const response = await resolve(event);

	// Basic security headers
	response.headers.set('X-Content-Type-Options', 'nosniff');
	response.headers.set('Referrer-Policy', 'no-referrer');
	response.headers.set('X-Frame-Options', 'DENY');
	response.headers.set('Cross-Origin-Opener-Policy', 'same-origin');
	response.headers.set('Cross-Origin-Resource-Policy', 'same-origin');

	// HSTS only in production or over HTTPS
	const url = new URL(event.request.url);
	if (url.protocol === 'https:' || process.env.NODE_ENV === 'production') {
		response.headers.set('Strict-Transport-Security', 'max-age=15552000; includeSubDomains');
	}

	return response;
};

/**
 * Paraglide middleware with observability
 */
const handleParaglide: Handle = ({ event, resolve }) =>
	paraglideMiddleware(event.request, async ({ request, locale }) => {
		event.request = request;

		// Observability: attach correlation ID and logger to locals
		const requestId = event.locals.requestId ?? genReqId();
		event.locals.requestId = requestId;
		const routePath = event.route?.id || new URL(event.request.url).pathname;
		const logger = createLogger({ requestId, route: routePath });
		event.locals.logger = logger;

		const startedAt = performance.now();
		logger.info('request:start', {
			method: event.request.method,
			path: routePath
		});

		try {
			const response = await resolve(event, {
				transformPageChunk: ({ html }) => html.replace('%paraglide.lang%', locale)
			});
			const durationMs = Math.round(performance.now() - startedAt);
			logger.info('request:finish', { status: response.status, durationMs });
			// Add response header for downstream correlation
			response.headers.set('x-request-id', requestId);
			return response;
		} catch (err) {
			const durationMs = Math.round(performance.now() - startedAt);
			logger.error('request:error', err, { durationMs });
			throw err;
		}
	});

/**
 * Compose all hooks in order
 * Note: Order matters! Supabase must run first to set up auth, then rate limiting
 */
export const handle: Handle = sequence(
	handleSupabase,
	handleRateLimit,
	handleSecurityHeaders,
	handleParaglide
);

/**
 * Helper function to sequence multiple hooks
 * This is the recommended pattern in SvelteKit 2 for multiple middleware
 */
function sequence(...handlers: Handle[]): Handle {
	return async ({ event, resolve }) => {
		for (const handler of handlers) {
			const result = await handler({ event, resolve });
			if (result) return result;
		}
		return resolve(event);
	};
}
