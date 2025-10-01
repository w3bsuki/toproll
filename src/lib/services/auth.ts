import { createHash } from 'node:crypto';
import { getSupabaseServer } from '$lib/supabase/server';
import type { UserProfile } from '$lib/types';

export interface AuthUser {
	id: string;
	steamId: string;
	email: string;
}

/**
 * Gets the current authenticated user from cookies
 */
export async function getCurrentUser(cookies: any): Promise<AuthUser | null> {
	const userId = cookies.get('user_id');
	const sessionToken = cookies.get('session_token');

	if (!userId || !sessionToken) {
		return null;
	}

	const supabase = getSupabaseServer();
	const sessionHash = createHash('sha256').update(sessionToken).digest('hex');

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

	if (profile.session_expires_at && new Date(profile.session_expires_at).getTime() <= Date.now()) {
		return null;
	}

	return {
		id: userId,
		steamId: profile.steam_id,
		email: `${profile.steam_id}@steam.toproll.gg`
	};
}

/**
 * Validates if a user is authenticated
 */
export async function requireAuth(cookies: any): Promise<AuthUser> {
	const user = await getCurrentUser(cookies);

	if (!user) {
		throw new Error('Authentication required');
	}

	return user;
}

/**
 * Gets user profile from Supabase
 */
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
	const supabase = getSupabaseServer();

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
}

/**
 * Signs in a user with Supabase Auth using a magic link approach
 */
export async function signInUser(steamId: string, redirectTo: string): Promise<string> {
	const supabase = getSupabaseServer();
	const email = `${steamId}@steam.toproll.gg`;

	// Generate a magic link for the user
	const { data, error } = await supabase.auth.admin.generateLink({
		type: 'magiclink',
		email: email,
		options: {
			redirectTo: redirectTo
		}
	});

	if (error) {
		throw new Error(`Failed to generate magic link: ${error.message}`);
	}

	return data.properties.action_link;
}

/**
 * Creates a Supabase session for the authenticated user
 */
export async function createSession(
	steamId: string,
	redirectTo: string = '/profile'
): Promise<{ session: any; user: AuthUser }> {
	const supabase = getSupabaseServer();
	const email = `${steamId}@steam.toproll.gg`;

	// For now, we'll create a session using admin API
	// In production, you might want to use a different approach
	const { data: session, error } = await supabase.auth.admin.generateLink({
		type: 'magiclink',
		email: email,
		options: {
			redirectTo: redirectTo
		}
	});

	if (error) {
		throw new Error(`Failed to create session: ${error.message}`);
	}

	const user: AuthUser = {
		id: session.user?.id || '',
		steamId: steamId,
		email: email
	};

	return { session, user };
}
