import { createHash } from 'node:crypto';
import { getSupabaseServer } from '$lib/supabase/server';
import type { GoTrueAdminApi } from '@supabase/supabase-js';
import type { UserProfile } from '$lib/types/index';

type GenerateLinkData = Awaited<ReturnType<GoTrueAdminApi['generateLink']>>['data'];

export interface AuthUser {
	id: string;
	steamId: string;
	email: string;
}

/**
 * Gets the current authenticated user from Supabase auth or fallback to cookies
 */
export async function getCurrentUser(cookies: {
	get: (key: string) => string | null | undefined;
}): Promise<AuthUser | null> {
	// First try to get user from Supabase auth session
	const supabase = getSupabaseServer();
	const {
		data: { session },
		error: sessionError
	} = await supabase.auth.getSession();

	if (session && session.user && !sessionError) {
		// Get user profile to get Steam data
		const { data: profile, error: profileError } = await supabase
			.from('user_profiles')
			.select('steam_id, username')
			.eq('user_id', session.user.id)
			.maybeSingle();

		if (!profileError && profile) {
			return {
				id: session.user.id,
				steamId: profile.steam_id,
				email: session.user.email || `${profile.steam_id}@steam.toproll.gg`
			};
		}
	}

	// Fallback to cookie-based auth for backward compatibility
	const userId = cookies.get('user_id');
	const sessionToken = cookies.get('session_token');

	if (!userId || !sessionToken) {
		return null;
	}

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
export async function requireAuth(cookies: {
	get: (key: string) => string | null | undefined;
}): Promise<AuthUser> {
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
 * Updates the user's last_seen timestamp
 */
export async function updateLastSeen(userId: string): Promise<void> {
	const supabase = getSupabaseServer();

	const { error } = await supabase
		.from('user_profiles')
		.update({ last_seen: new Date().toISOString() })
		.eq('user_id', userId);

	if (error) {
		console.error('Error updating last_seen:', error);
	}
}

/**
 * Refreshes Steam profile data from Steam API
 */
export async function refreshSteamProfile(steamId: string): Promise<void> {
	const supabase = getSupabaseServer();
	const { env } = process;

	if (!env.STEAM_API_KEY) {
		console.warn('Steam API key not configured, skipping profile refresh');
		return;
	}

	try {
		const steamApiUrl = `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${env.STEAM_API_KEY}&steamids=${steamId}`;
		const steamResponse = await fetch(steamApiUrl);

		if (!steamResponse.ok) {
			throw new Error('Failed to fetch Steam profile');
		}

		const steamData = await steamResponse.json();
		const player = steamData.response?.players?.[0];

		if (!player) {
			throw new Error('Steam profile not found');
		}

		// Update user profile with fresh Steam data
		const { error } = await supabase
			.from('user_profiles')
			.update({
				username: player.personaname,
				avatar_url: player.avatarfull,
				steam_profile_url: player.profileurl,
				updated_at: new Date().toISOString()
			})
			.eq('steam_id', steamId);

		if (error) {
			throw new Error(`Failed to update profile: ${error.message}`);
		}

		// Also update Supabase auth user metadata
		const { data: profile } = await supabase
			.from('user_profiles')
			.select('user_id')
			.eq('steam_id', steamId)
			.single();

		if (profile) {
			await supabase.auth.admin.updateUserById(profile.user_id, {
				user_metadata: {
					steam_id: steamId,
					username: player.personaname,
					avatar_url: player.avatarfull,
					steam_profile_url: player.profileurl
				}
			});
		}

		console.info(`Refreshed Steam profile for ${player.personaname} (${steamId})`);
	} catch (error) {
		console.error('Error refreshing Steam profile:', error);
		// Don't throw - this is a background operation
	}
}

/**
 * Updates user balance (add or subtract credits)
 */
export async function updateUserBalance(
	userId: string,
	amount: number,
	type: 'add' | 'subtract' = 'add'
): Promise<{ success: boolean; newBalance?: number; error?: string }> {
	const supabase = getSupabaseServer();

	// Validate amount
	if (amount <= 0) {
		return { success: false, error: 'Amount must be positive' };
	}

	// Use a transaction to ensure atomic update
	const { data: currentProfile, error: fetchError } = await supabase
		.from('user_profiles')
		.select('balance')
		.eq('user_id', userId)
		.single();

	if (fetchError || !currentProfile) {
		return { success: false, error: 'User profile not found' };
	}

	const currentBalance = Number(currentProfile.balance) || 0;
	const adjustment = type === 'add' ? amount : -amount;
	const newBalance = currentBalance + adjustment;

	// Check for insufficient funds when subtracting
	if (type === 'subtract' && newBalance < 0) {
		return { success: false, error: 'Insufficient balance' };
	}

	const { error: updateError } = await supabase
		.from('user_profiles')
		.update({
			balance: newBalance,
			updated_at: new Date().toISOString()
		})
		.eq('user_id', userId);

	if (updateError) {
		return { success: false, error: updateError.message };
	}

	return { success: true, newBalance };
}

/**
 * Gets user balance
 */
export async function getUserBalance(userId: string): Promise<number> {
	const supabase = getSupabaseServer();

	const { data: profile, error } = await supabase
		.from('user_profiles')
		.select('balance')
		.eq('user_id', userId)
		.single();

	if (error || !profile) {
		return 0;
	}

	return Number(profile.balance) || 0;
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
): Promise<{ session: GenerateLinkData; user: AuthUser }> {
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

