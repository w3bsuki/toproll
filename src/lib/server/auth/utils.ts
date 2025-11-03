/**
 * Security utilities for testing and validation
 */

/**
 * Test rate limiting on a specific endpoint
 */
export async function testRateLimit(
	url: string,
	maxRequests: number = 10
): Promise<{
	success: boolean;
	totalRequests: number;
	rateLimited: boolean;
	message: string;
}> {
	const results = {
		success: true,
		totalRequests: 0,
		rateLimited: false,
		message: ''
	};

	try {
		// Make requests until we get rate limited
		for (let i = 0; i < maxRequests; i++) {
			const response = await fetch(url);
			results.totalRequests++;

			if (response.status === 429) {
				results.rateLimited = true;
				results.message = `Rate limited after ${i + 1} requests`;
				break;
			}

			// Add small delay between requests
			await new Promise((resolve) => setTimeout(resolve, 100));
		}

		if (!results.rateLimited) {
			results.message = `No rate limiting detected after ${results.totalRequests} requests`;
		}
	} catch (error) {
		results.success = false;
		results.message = `Error: ${error instanceof Error ? error.message : 'Unknown error'}`;
	}

	return results;
}

/**
 * Validate security headers on a response
 */
export function validateSecurityHeaders(response: Response): {
	valid: boolean;
	missing: string[];
	invalid: string[];
	warnings: string[];
} {
	const requiredHeaders = [
		'X-Content-Type-Options',
		'X-Frame-Options',
		'X-XSS-Protection',
		'Referrer-Policy',
		'Cross-Origin-Opener-Policy',
		'Cross-Origin-Resource-Policy'
	];

	const results = {
		valid: true,
		missing: [] as string[],
		invalid: [] as string[],
		warnings: [] as string[]
	};

	// Check required headers
	requiredHeaders.forEach((header) => {
		if (!response.headers.get(header)) {
			results.missing.push(header);
			results.valid = false;
		}
	});

	// Validate header values
	const xContentTypeOptions = response.headers.get('X-Content-Type-Options');
	if (xContentTypeOptions && xContentTypeOptions !== 'nosniff') {
		results.invalid.push(
			`X-Content-Type-Options should be 'nosniff', got '${xContentTypeOptions}'`
		);
		results.valid = false;
	}

	const xFrameOptions = response.headers.get('X-Frame-Options');
	if (xFrameOptions && !['DENY', 'SAMEORIGIN'].includes(xFrameOptions)) {
		results.invalid.push(
			`X-Frame-Options should be 'DENY' or 'SAMEORIGIN', got '${xFrameOptions}'`
		);
		results.valid = false;
	}

	const referrerPolicy = response.headers.get('Referrer-Policy');
	if (referrerPolicy && !referrerPolicy.includes('strict')) {
		results.warnings.push(`Consider using stricter Referrer-Policy, current: '${referrerPolicy}'`);
	}

	// Check CSP if present
	const csp = response.headers.get('Content-Security-Policy');
	if (csp) {
		if (csp.includes("'unsafe-inline'") && csp.includes("'unsafe-eval'")) {
			results.warnings.push(
				'CSP allows both unsafe-inline and unsafe-eval - consider tightening policy'
			);
		}
	} else {
		results.warnings.push('No Content-Security-Policy header found');
	}

	// Check HSTS in production
	if (process.env.NODE_ENV === 'production') {
		const hsts = response.headers.get('Strict-Transport-Security');
		if (!hsts) {
			results.warnings.push('No HSTS header in production - consider enabling');
		}
	}

	return results;
}

/**
 * Get client IP information for debugging
 */
export function getClientInfo(request: Request): {
	ip: string;
	userAgent: string;
	referer?: string;
	forwarded?: string;
} {
	return {
		ip:
			request.headers.get('x-forwarded-for') ||
			request.headers.get('x-real-ip') ||
			request.headers.get('cf-connecting-ip') ||
			'unknown',
		userAgent: request.headers.get('user-agent') || 'unknown',
		referer: request.headers.get('referer') || undefined,
		forwarded: request.headers.get('forwarded') || undefined
	};
}
