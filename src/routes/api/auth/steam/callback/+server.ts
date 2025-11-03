import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { createOrUpdateUserProfile, validateSteamCallback } from '$lib/server/services/steamAuth';
import { getSupabaseSSR } from '$lib/server/auth/ssr';
import { getSupabaseServer as getSupabaseAdmin } from '$lib/supabase/server';
import { getNonce, deleteNonce } from '$lib/server/auth/nonceStore';

export const GET: RequestHandler = async (event) => {
	const { url, cookies } = event;
	try {
		const params = url.searchParams;
		// Prefer nonce from URL, but fall back to cookie for providers that strip query params
		const urlNonce = params.get('nonce');
		const cookieNonce = cookies.get('steam_auth_nonce');
		const nonce = urlNonce || cookieNonce || null;

		// TEST MODE: Only enabled when NODE_ENV === 'test' and TEST_STEAMID is set
		// This allows CI to bypass Steam OpenID validation for reliable testing
		if (process.env.NODE_ENV === 'test' && process.env.TEST_STEAMID && params.get('test') === '1') {
			console.warn(
				'TEST MODE: Bypassing Steam OpenID validation for TEST_STEAMID:',
				process.env.TEST_STEAMID
			);

			// Create mock Steam user for testing
			const mockSteamUser = {
				steamid: process.env.TEST_STEAMID,
				personaname: `Test User ${process.env.TEST_STEAMID.slice(-8)}`,
				profileurl: `https://steamcommunity.com/profiles/${process.env.TEST_STEAMID}/`,
				avatar: `https://avatars.steamstatic.com/test_${process.env.TEST_STEAMID}.jpg`,
				avatarmedium: `https://avatars.steamstatic.com/test_medium_${process.env.TEST_STEAMID}.jpg`,
				avatarfull: `https://avatars.steamstatic.com/test_full_${process.env.TEST_STEAMID}.jpg`,
				communityvisibilitystate: 3
			};

			// Create or update user profile
			const authResult = await createOrUpdateUserProfile(mockSteamUser);

			// Get Supabase admin client to generate a proper session
			const admin = getSupabaseAdmin();

			// Generate a magic link for test mode
			const { data: linkData, error: linkError } = await admin.auth.admin.generateLink({
				type: 'magiclink',
				email: `${mockSteamUser.steamid}@steam.toproll.gg`,
				options: {
					redirectTo: '/'
				}
			});

			if (linkError || !linkData) {
				console.error('TEST MODE: Failed to generate session link:', linkError);
				throw new Error('Failed to create test authentication session');
			}

			// Extract and verify token hash
			const tokenHash = new URL(linkData.properties.action_link).searchParams.get('token_hash');
			if (!tokenHash) {
				throw new Error('Failed to extract token from magic link');
			}

			const ssr = getSupabaseSSR(event);
			const { data: sessionData, error: sessionError } = await ssr.auth.verifyOtp({
				type: 'magiclink',
				token_hash: tokenHash
			});

			if (sessionError || !sessionData.session) {
				console.error('TEST MODE: Failed to verify OTP:', sessionError);
				throw new Error('Failed to create test authenticated session');
			}

			// Set additional metadata cookies
			const cookieOptions = {
				path: '/',
				maxAge: 60 * 60 * 24 * 7,
				httpOnly: true,
				secure: false, // Allow in test environment
				sameSite: 'lax' as const
			};
			cookies.set('steam_id', authResult.user.steamid, cookieOptions);

			// Update last seen
			await admin
				.from('user_profiles')
				.update({ last_seen: new Date().toISOString() })
				.eq('user_id', authResult.supabaseUserId);

			console.info(`TEST MODE: User ${authResult.user.personaname} authenticated via test mode`);
			throw redirect(302, '/profile');
		}

		// Verify nonce for CSRF protection
		if (!nonce) {
			throw new Error('Missing nonce parameter');
		}

		// If both URL and cookie values exist, they must match
		if (urlNonce && cookieNonce && urlNonce !== cookieNonce) {
			throw new Error('Invalid nonce');
		}

		// Use resolved nonce and clear cookie
		cookies.delete('steam_auth_nonce', { path: '/' });

		const nonceData = getNonce(nonce);
		if (!nonceData) {
			throw new Error('Nonce expired or not found');
		}

		// Clean up nonce
		deleteNonce(nonce);

		// Validate Steam OpenID callback
		const steamUser = await validateSteamCallback(params);

		// Create or update user profile in Supabase
		const authResult = await createOrUpdateUserProfile(steamUser);

		// Get Supabase admin client to generate a proper session
	const admin = getSupabaseAdmin();

		// Generate a magic link that gives us proper Supabase session tokens
		// This is the server-side way to create sessions for custom auth providers
	const { data: linkData, error: linkError } = await admin.auth.admin.generateLink({
			type: 'magiclink',
			email: `${steamUser.steamid}@steam.toproll.gg`,
			options: {
				redirectTo: '/'
			}
		});

		if (linkError || !linkData) {
			console.error('Failed to generate session link:', linkError);
			throw new Error('Failed to create authentication session');
		}

		// Extract the token hash from the generated link
		const tokenHash = new URL(linkData.properties.action_link).searchParams.get('token_hash');
		if (!tokenHash) {
			throw new Error('Failed to extract token from magic link');
		}

		// Exchange the token hash for a real Supabase session
		const ssr = getSupabaseSSR(event);
		const { data: sessionData, error: sessionError } = await ssr.auth.verifyOtp({
			type: 'magiclink',
			token_hash: tokenHash
		});

		if (sessionError || !sessionData.session) {
			console.error('Failed to verify OTP:', sessionError);
			throw new Error('Failed to create authenticated session');
		}

		// Set the session cookies - this is handled automatically by the Supabase client
		// but we can also set them explicitly for better control
		const cookieOptions = {
			path: '/',
			maxAge: 60 * 60 * 24 * 7, // 7 days
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'lax' as const
		};

		// Store Supabase session tokens in cookies
		// The @supabase/ssr package handles this automatically, but we set additional metadata
		cookies.set('steam_id', authResult.user.steamid, cookieOptions);

		// Update last seen
		await admin
			.from('user_profiles')
			.update({ last_seen: new Date().toISOString() })
			.eq('user_id', authResult.supabaseUserId);

		// Log successful authentication
		console.info(
			`User ${authResult.user.personaname} (${authResult.user.steamid}) authenticated successfully`
		);

		// Redirect to stored return URL or default
		const redirectUrl = nonceData.returnUrl || '/profile';
		throw redirect(302, redirectUrl);
	} catch (err) {
		console.error('Steam auth error:', err);

		// Determine appropriate error redirect
		let errorParam = 'auth_failed';
		if (err instanceof Error) {
			if (err.message.includes('Invalid OpenID')) {
				errorParam = 'steam_auth_failed';
			} else if (err.message.includes('Steam profile')) {
				errorParam = 'steam_profile_not_found';
			} else if (err.message.includes('API key')) {
				errorParam = 'config_error';
			} else if (err.message.includes('nonce')) {
				errorParam = 'csrf_failed';
			}
		}

		throw redirect(302, `/?error=${errorParam}`);
	}
};
