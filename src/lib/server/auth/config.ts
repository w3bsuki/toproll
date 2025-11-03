/**
 * Security configuration
 * Central place to adjust security settings
 */

export const SECURITY_CONFIG = {
	// Rate limiting settings
	rateLimit: {
		// General API rate limit
		api: {
			maxRequests: 100,
			windowMs: 60 * 1000 // 1 minute
		},
		// Auth endpoints are more sensitive
		auth: {
			maxRequests: 10,
			windowMs: 60 * 1000 // 1 minute
		},
		// Sensitive operations
		strict: {
			maxRequests: 20,
			windowMs: 60 * 1000 // 1 minute
		},
		// Routes that need custom rate limiting
		customRoutes: {
			'/api/battles': { maxRequests: 30, windowMs: 60 * 1000 },
			'/api/inventory': { maxRequests: 50, windowMs: 60 * 1000 },
			'/api/marketplace': { maxRequests: 40, windowMs: 60 * 1000 }
		}
	},

	// Security header settings
	headers: {
		// HSTS (HTTPS only)
		hsts: {
			enabled: true,
			maxAge: 31536000, // 1 year
			includeSubDomains: true,
			preload: false // Set to true only if you're ready for HSTS preload
		},

		// Content Security Policy
		csp: {
			enabled: true,
			// Development allows more permissive policies for hot reload
			development: {
				scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", 'localhost:*', '127.0.0.1:*'],
				connectSrc: [
					"'self'",
					'ws:',
					'wss:',
					'localhost:*',
					'127.0.0.1:*',
					'https://api.steampowered.com'
				]
			},
			// Production is more restrictive
			production: {
				scriptSrc: ["'self'"], // Remove unsafe-inline in production
				connectSrc: ["'self'", 'https://api.steampowered.com']
			}
		}
	},

	// IP blocking settings
	ipBlocking: {
		// Enable automatic IP blocking for repeated violations
		enabled: false, // Set to true when you have proper blocking infrastructure
		threshold: 10, // Number of violations before blocking
		blockDuration: 24 * 60 * 60 * 1000 // 24 hours
	}
} as const;

// Type exports for better TypeScript support
export type RateLimitConfig = typeof SECURITY_CONFIG.rateLimit;
export type SecurityHeaderConfig = typeof SECURITY_CONFIG.headers;
