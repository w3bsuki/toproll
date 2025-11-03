/**
 * Security headers configuration for SvelteKit
 * Follows OWASP best practices
 */

export interface SecurityHeaderConfig {
	// Content Security Policy
	contentSecurityPolicy?: {
		defaultSrc?: string[];
		scriptSrc?: string[];
		styleSrc?: string[];
		imgSrc?: string[];
		connectSrc?: string[];
		fontSrc?: string[];
		objectSrc?: string[];
		mediaSrc?: string[];
		frameSrc?: string[];
		childSrc?: string[];
		workerSrc?: string[];
		manifestSrc?: string[];
	};

	// HSTS configuration
	hsts?: {
		maxAge?: number;
		includeSubDomains?: boolean;
		preload?: boolean;
	};
}

/**
 * Default security configuration
 */
const defaultConfig: SecurityHeaderConfig = {
	contentSecurityPolicy: {
		defaultSrc: ["'self'"],
		scriptSrc: ["'self'", "'unsafe-inline'"], // Add 'unsafe-eval' only if absolutely necessary
		styleSrc: ["'self'", "'unsafe-inline'"], // Required for Tailwind CSS
		imgSrc: ["'self'", 'data:', 'https:'],
		connectSrc: ["'self'", 'https://api.steampowered.com'], // Allow Steam API
		fontSrc: ["'self'", 'data:'],
		objectSrc: ["'none'"],
		mediaSrc: ["'self'"],
		frameSrc: ["'none'"],
		childSrc: ["'none'"],
		workerSrc: ["'self'"],
		manifestSrc: ["'self'"]
	},
	hsts: {
		maxAge: 31536000, // 1 year
		includeSubDomains: true,
		preload: false // Set to true only if you're ready for HSTS preload
	}
};

/**
 * Generate CSP header value from configuration
 */
function generateCSP(config: SecurityHeaderConfig['contentSecurityPolicy']): string {
	if (!config) return '';

	const directives = Object.entries(config).map(([directive, sources]) => {
		const kebabDirective = directive.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
		return `${kebabDirective} ${sources.join(' ')}`;
	});

	return directives.join('; ');
}

/**
 * Apply security headers to response
 */
export function applySecurityHeaders(
	response: Response,
	config: Partial<SecurityHeaderConfig> = {}
): Response {
	const finalConfig = { ...defaultConfig, ...config };

	// Content Security Policy
	if (finalConfig.contentSecurityPolicy) {
		const cspValue = generateCSP(finalConfig.contentSecurityPolicy);
		if (cspValue) {
			response.headers.set('Content-Security-Policy', cspValue);
		}
	}

	// HSTS (only in production with HTTPS)
	if (finalConfig.hsts && process.env.NODE_ENV === 'production') {
		const hstsValue = [
			`max-age=${finalConfig.hsts.maxAge}`,
			finalConfig.hsts.includeSubDomains ? 'includeSubDomains' : '',
			finalConfig.hsts.preload ? 'preload' : ''
		]
			.filter(Boolean)
			.join('; ');
		response.headers.set('Strict-Transport-Security', hstsValue);
	}

	// Other important security headers
	response.headers.set('X-Content-Type-Options', 'nosniff');
	response.headers.set('X-Frame-Options', 'DENY');
	response.headers.set('X-XSS-Protection', '1; mode=block');
	response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
	response.headers.set('Cross-Origin-Opener-Policy', 'same-origin');
	response.headers.set('Cross-Origin-Resource-Policy', 'same-origin');
	response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

	// Remove server information
	response.headers.delete('Server');
	response.headers.delete('X-Powered-By');

	return response;
}

/**
 * Environment-specific security configurations
 */
export const securityConfigs = {
	development: {
		contentSecurityPolicy: {
			...defaultConfig.contentSecurityPolicy,
			// Allow dev server and hot reload
			scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", 'localhost:*', '127.0.0.1:*'],
			connectSrc: [
				"'self'",
				'ws:',
				'wss:',
				'localhost:*',
				'127.0.0.1:*',
				'https://api.steampowered.com'
			]
		}
	},
	production: defaultConfig
};

/**
 * Get appropriate config based on environment
 */
export function getSecurityConfig(): SecurityHeaderConfig {
	return (
		securityConfigs[process.env.NODE_ENV as keyof typeof securityConfigs] ||
		securityConfigs.production
	);
}
