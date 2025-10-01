import { redirect, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { createOrUpdateUserProfile, validateSteamCallback } from '$lib/services/steamAuth';

export const GET: RequestHandler = async ({ url, cookies }) => {
	try {
		const params = url.searchParams;

		// Validate Steam OpenID callback
		const steamUser = await validateSteamCallback(params);

		// Create or update user profile in Supabase
		const authResult = await createOrUpdateUserProfile(steamUser);

		const cookieOptions = {
			path: '/',
			maxAge: 60 * 60 * 24 * 7,
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'lax' as const
		};

		cookies.set('session_token', authResult.sessionToken, {
			...cookieOptions,
			expires: new Date(authResult.sessionExpiresAt)
		});

		// Set secure cookies for the session
		cookies.set('user_id', authResult.supabaseUserId, cookieOptions);

		cookies.set('steam_id', authResult.user.steamid, cookieOptions);

		// Log successful authentication
		console.info(
			`User ${authResult.user.personaname} (${authResult.user.steamid}) authenticated successfully`
		);

		throw redirect(302, '/profile');
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
			}
		}

		throw redirect(302, `/?error=${errorParam}`);
	}
};
