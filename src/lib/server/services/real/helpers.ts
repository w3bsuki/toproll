/**
 * API Helper Functions for Real Providers
 *
 * These functions provide consistent request handling, error management,
 * and authentication for all real API providers.
 */

/**
 * Makes an API request with proper credentials and error handling
 */
export async function apiRequest(url: string, options?: RequestInit): Promise<Response> {
	return fetch(url, {
		...options,
		headers: {
			'Content-Type': 'application/json',
			...options?.headers
		},
		credentials: 'same-origin' // Ensures cookies are sent for authentication
	});
}

/**
 * Handles API errors consistently across providers
 */
export async function handleApiError(response: Response): Promise<never> {
	if (response.status === 401) {
		throw new Error('Authentication required');
	}
	if (response.status === 404) {
		throw new Error('Resource not found');
	}
	if (response.status >= 400 && response.status < 500) {
		let errorMessage = 'Request failed';
		try {
			const error = await response.json();
			errorMessage = error.message || errorMessage;
		} catch {
			// If we can't parse the error, use the status text
			errorMessage = response.statusText || errorMessage;
		}
		throw new Error(errorMessage);
	}
	throw new Error(`Server error: ${response.statusText}`);
}

/**
 * Parses API responses consistently
 */
export async function parseApiResponse<T>(response: Response): Promise<T> {
	if (!response.ok) {
		await handleApiError(response);
	}

	try {
		const data = await response.json();

		// Handle different response formats
		if (data && typeof data === 'object' && 'success' in data && 'data' in data) {
			// Response format: { success: true, data: ... }
			return data.data as T;
		}

		// Response is already the data we need
		return data as T;
	} catch (error) {
		if (error instanceof Error) {
			throw error;
		}
		throw new Error('Failed to parse response');
	}
}

/**
 * Creates a POST request with JSON body
 */
export function createPostRequest(body: Record<string, unknown>): RequestInit {
	return {
		method: 'POST',
		body: JSON.stringify(body)
	};
}
