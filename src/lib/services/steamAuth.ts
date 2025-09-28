import { getSupabaseServer } from '$lib/supabase/server';
import { env } from '$env/dynamic/private';
import type { UserProfile } from '$lib/types';

export interface SteamUser {
	steamid: string;
	personaname: string;
	avatar: string;
	avatarmedium: string;
	avatarfull: string;
	profileurl: string;
	communityvisibilitystate: number;
}

export interface SteamAuthResult {
	user: SteamUser;
	supabaseUserId: string;
}

/**
 * Validates Steam OpenID callback parameters and returns Steam user data
 */
export async function validateSteamCallback(params: URLSearchParams): Promise<SteamUser> {
	// Verify OpenID response
	if (params.get('openid.mode') !== 'id_res') {
		throw new Error('Invalid OpenID mode');
	}

	// Extract Steam ID from claimed_id
	const claimedId = params.get('openid.claimed_id') || '';
	const steamIdMatch = claimedId.match(/\/id\/(\d+)$/);

	if (!steamIdMatch) {
		throw new Error('Invalid Steam ID format');
	}

	const steamId = steamIdMatch[1];

	// Verify the signature (in production, implement proper OpenID signature verification)
	// For now, we'll verify by fetching the profile from Steam API

	if (!env.STEAM_API_KEY) {
		throw new Error('Steam API key not configured');
	}

	// Fetch Steam profile data to verify the user
	const steamApiUrl = `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${env.STEAM_API_KEY}&steamids=${steamId}`;
	const steamResponse = await fetch(steamApiUrl);

	if (!steamResponse.ok) {
		throw new Error('Failed to fetch Steam profile');
	}

	const steamData = await steamResponse.json();

	if (!steamData.response?.players?.[0]) {
		throw new Error('Steam profile not found');
	}

	return steamData.response.players[0] as SteamUser;
}

/**
 * Creates or updates a Supabase user profile from Steam data
 */
export async function createOrUpdateUserProfile(steamUser: SteamUser): Promise<SteamAuthResult> {
	const supabase = getSupabaseServer();

	// Check if user already exists
	const { data: existingProfile } = await supabase
		.from('user_profiles')
		.select('user_id')
		.eq('steam_id', steamUser.steamid)
		.single();

	if (existingProfile) {
		// Update existing profile with latest Steam data
		const { data: updatedProfile, error } = await supabase
			.from('user_profiles')
			.update({
				username: steamUser.personaname,
				avatar_url: steamUser.avatarfull,
				steam_profile_url: steamUser.profileurl,
				updated_at: new Date().toISOString()
			})
			.eq('steam_id', steamUser.steamid)
			.select()
			.single();

		if (error) {
			throw new Error(`Failed to update profile: ${error.message}`);
		}

		return {
			user: steamUser,
			supabaseUserId: updatedProfile.user_id
		};
	}

	// Create new Supabase auth user
	const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
		user_metadata: {
			steam_id: steamUser.steamid,
			username: steamUser.personaname,
			avatar_url: steamUser.avatarfull,
			steam_profile_url: steamUser.profileurl
		},
		email: `${steamUser.steamid}@steam.toproll.gg` // Placeholder email for Steam users
	});

	if (authError) {
		throw new Error(`Failed to create auth user: ${authError.message}`);
	}

	// Create user profile
	const { data: newProfile, error: profileError } = await supabase
		.from('user_profiles')
		.insert({
			user_id: authUser.user.id,
			steam_id: steamUser.steamid,
			username: steamUser.personaname,
			avatar_url: steamUser.avatarfull,
			steam_profile_url: steamUser.profileurl
		})
		.select()
		.single();

	if (profileError) {
		// Clean up auth user if profile creation fails
		await supabase.auth.admin.deleteUser(authUser.user.id);
		throw new Error(`Failed to create profile: ${profileError.message}`);
	}

	return {
		user: steamUser,
		supabaseUserId: newProfile.user_id
	};
}
