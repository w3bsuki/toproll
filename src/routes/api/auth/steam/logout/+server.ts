import { createHash } from 'node:crypto';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getSupabaseServer } from '$lib/supabase/server';

const COOKIE_OPTIONS = {
	path: '/',
	httpOnly: true,
	sameSite: 'lax' as const,
	secure: process.env.NODE_ENV === 'production'
};

export const POST: RequestHandler = async ({ cookies }) => {
	const sessionToken = cookies.get('session_token');
	const userId = cookies.get('user_id');

	if (sessionToken && userId) {
		const supabase = getSupabaseServer();
		const sessionHash = createHash('sha256').update(sessionToken).digest('hex');

		await supabase
			.from('user_profiles')
			.update({
				session_token_hash: null,
				session_expires_at: null
			})
			.eq('user_id', userId)
			.eq('session_token_hash', sessionHash);
	}

	cookies.delete('session_token', COOKIE_OPTIONS);
	cookies.delete('user_id', COOKIE_OPTIONS);
	cookies.delete('steam_id', COOKIE_OPTIONS);

	return json({ success: true });
};
