import { env } from '$env/dynamic/private';
import { getSupabaseServer } from '$lib/supabase/server';
import { createHash, randomUUID } from 'node:crypto';

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
	sessionToken: string;
	sessionExpiresAt: string;
}

const OPEN_ID_ENDPOINT = 'https://steamcommunity.com/openid/login';
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days

function extractSteamId(claimedId: string): string {
	const steamIdMatch = claimedId.match(/\/id\/(\d+)$/);

	if (!steamIdMatch) {
		throw new Error('Invalid Steam ID format');
	}

	return steamIdMatch[1];
}

async function verifyOpenIdResponse(params: URLSearchParams): Promise<void> {
	const verificationPayload = new URLSearchParams();

	params.forEach((value, key) => {
		if (key.startsWith('openid.')) {
			verificationPayload.set(key, value);
		}
	});

	verificationPayload.set('openid.mode', 'check_authentication');

	const response = await fetch(OPEN_ID_ENDPOINT, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded'
		},
		body: verificationPayload.toString()
	});

	if (!response.ok) {
		throw new Error('Failed to verify OpenID response');
	}

	const body = await response.text();

	if (!/is_valid\s*:\s*true/.test(body)) {
		throw new Error('Invalid OpenID signature');
	}
}

/**
 * Validates Steam OpenID callback parameters and returns Steam user data
 */
export async function validateSteamCallback(params: URLSearchParams): Promise<SteamUser> {
	// Verify OpenID response
	if (params.get('openid.mode') !== 'id_res') {
		throw new Error('Invalid OpenID mode');
	}

	const claimedId = params.get('openid.claimed_id') || '';
	const steamId = extractSteamId(claimedId);

	await verifyOpenIdResponse(params);

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
	const sessionToken = randomUUID();
	const sessionTokenHash = createHash('sha256').update(sessionToken).digest('hex');
	const sessionExpiresAt = new Date(Date.now() + SESSION_TTL_SECONDS * 1000).toISOString();
	const loginTimestamp = new Date().toISOString();

	const { data: existingProfile, error: profileLookupError } = await supabase
		.from('user_profiles')
		.select('user_id')
		.eq('steam_id', steamUser.steamid)
		.maybeSingle();

	if (profileLookupError) {
		throw new Error(`Failed to check existing profile: ${profileLookupError.message}`);
	}

	if (existingProfile) {
		const { error: updateUserError } = await supabase.auth.admin.updateUserById(
			existingProfile.user_id,
			{
				user_metadata: {
					steam_id: steamUser.steamid,
					username: steamUser.personaname,
					avatar_url: steamUser.avatarfull,
					steam_profile_url: steamUser.profileurl
				}
			}
		);

		if (updateUserError) {
			throw new Error(`Failed to sync auth metadata: ${updateUserError.message}`);
		}

		// Update existing profile with latest Steam data
		const { data: updatedProfile, error } = await supabase
			.from('user_profiles')
			.update({
				username: steamUser.personaname,
				avatar_url: steamUser.avatarfull,
				steam_profile_url: steamUser.profileurl,
				session_token_hash: sessionTokenHash,
				session_expires_at: sessionExpiresAt,
				last_login_at: loginTimestamp
			})
			.eq('steam_id', steamUser.steamid)
			.select()
			.single();

		if (error) {
			throw new Error(`Failed to update profile: ${error.message}`);
		}

		return {
			user: steamUser,
			supabaseUserId: updatedProfile.user_id,
			sessionToken,
			sessionExpiresAt
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
			steam_profile_url: steamUser.profileurl,
			session_token_hash: sessionTokenHash,
			session_expires_at: sessionExpiresAt,
			last_login_at: loginTimestamp
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
		supabaseUserId: newProfile.user_id,
		sessionToken,
		sessionExpiresAt
	};
}
