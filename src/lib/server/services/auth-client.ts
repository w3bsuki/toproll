import { createClient } from '@supabase/supabase-js';
import { env } from '$env/dynamic/public';
import type { AuthUser } from '$lib/services/auth';
import type { UserProfile } from '$lib/types/index';

// Browser-compatible implementation of SHA-256
async function createHash(data: string): Promise<string> {
	const encoder = new TextEncoder();
	const dataBuffer = encoder.encode(data);
	const buffer = await crypto.subtle.digest('SHA-256', dataBuffer);
	const hashArray = Array.from(new Uint8Array(buffer));
	return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Client-side version of getCurrentUser for browser use
 * This function doesn't require server-side imports
 */
export async function getCurrentUserBrowser(): Promise<AuthUser | null> {
	try {
		// Try to get the user from a cookie-based session
		const cookieString = document.cookie;
		const cookies: Record<string, string> = {};

		if (cookieString) {
			cookieString.split(';').forEach((cookie) => {
				const [key, value] = cookie.trim().split('=');
				if (key && value) {
					cookies[key] = value;
				}
			});
		}

		const userId = cookies['user_id'];
		const sessionToken = cookies['session_token'];

		if (!userId || !sessionToken) {
			return null;
		}

		// Create a client-side Supabase instance
		const supabase = createClient(env.PUBLIC_SUPABASE_URL!, env.PUBLIC_SUPABASE_ANON_KEY!);

		const sessionHash = await createHash(sessionToken);

		const { data: profile, error } = await supabase
			.from('user_profiles')
			.select('steam_id, session_token_hash, session_expires_at')
			.eq('user_id', userId)
			.maybeSingle();

		if (error || !profile) {
			return null;
		}

		if (!profile.session_token_hash || profile.session_token_hash !== sessionHash) {
			return null;
		}

		if (
			profile.session_expires_at &&
			new Date(profile.session_expires_at).getTime() <= Date.now()
		) {
			return null;
		}

		return {
			id: userId,
			steamId: profile.steam_id,
			email: `${profile.steam_id}@steam.toproll.gg`
		};
	} catch (err) {
		console.error('Error getting current user:', err);
		return null;
	}
}

/**
 * Checks if a user is authenticated on the client side
 */
export function isAuthenticated(): boolean {
	// This is a simple check - in a real app, you'd want to validate the session
	const cookieString = document.cookie;
	const cookies: Record<string, string> = {};

	if (cookieString) {
		cookieString.split(';').forEach((cookie) => {
			const [key, value] = cookie.trim().split('=');
			if (key && value) {
				cookies[key] = value;
			}
		});
	}

	return !!(cookies['user_id'] && cookies['session_token']);
}

/**
 * Logs out the current user on the client side
 */
export function logout(): void {
	// Clear auth cookies
	document.cookie = 'user_id=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
	document.cookie = 'session_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';

	// Redirect to home page
	window.location.href = '/';
}

/**
 * Gets user profile from Supabase for client-side use
 */
export async function getUserProfileClient(userId: string): Promise<UserProfile | null> {
	try {
		const supabase = createClient(env.PUBLIC_SUPABASE_URL!, env.PUBLIC_SUPABASE_ANON_KEY!);

		const { data: profile, error } = await supabase
			.from('user_profiles')
			.select('*')
			.eq('user_id', userId)
			.single();

		if (error) {
			console.error('Error fetching user profile:', error);
			return null;
		}

		return profile;
	} catch (error) {
		console.error('Error getting user profile:', error);
		return null;
	}
}
