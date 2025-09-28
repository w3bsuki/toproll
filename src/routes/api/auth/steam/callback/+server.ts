import { redirect, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { validateSteamCallback, createOrUpdateUserProfile } from '$lib/services/steamAuth';

export const GET: RequestHandler = async ({ url, cookies }) => {
	try {
		const params = url.searchParams;

		// Validate Steam OpenID callback
		const steamUser = await validateSteamCallback(params);

		// Create or update user profile in Supabase
		const authResult = await createOrUpdateUserProfile(steamUser);

		// Set secure cookies for the session
		cookies.set('user_id', authResult.supabaseUserId, {
			path: '/',
			maxAge: 60 * 60 * 24 * 7, // 7 days
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'lax'
		});

		cookies.set('steam_id', authResult.user.steamid, {
			path: '/',
			maxAge: 60 * 60 * 24 * 7, // 7 days
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'lax'
		});

		// Log successful authentication
		console.log(
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
