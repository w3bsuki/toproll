import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getCurrentUser, updateLastSeen } from '$lib/server/services/auth';

export const GET: RequestHandler = async ({ cookies }) => {
	try {
		// Get current authenticated user
		const user = await getCurrentUser(cookies);

		if (!user) {
			throw error(401, 'Authentication required');
		}

		// Get full user profile from database
		const { getSupabaseServer } = await import('$lib/server/auth/server');
		const supabase = getSupabaseServer();

		const { data: profile, error: profileError } = await supabase
			.from('user_profiles')
			.select('*')
			.eq('user_id', user.id)
			.single();

		if (profileError) {
			console.error('Profile fetch error:', profileError);
			throw error(500, 'Failed to fetch user profile');
		}

		// Update last_seen timestamp
		try {
			await updateLastSeen(user.id);
		} catch (updateError) {
			console.warn('Failed to update last_seen:', updateError);
			// Don't fail the request if last_seen update fails
		}

		// Return user profile data
		return json({
			user: {
				id: user.id,
				steamId: user.steamId,
				email: user.email
			},
			profile: {
				username: profile.username,
				avatar_url: profile.avatar_url,
				steam_profile_url: profile.steam_profile_url,
				balance: Number(profile.balance) || 0,
				last_seen: profile.last_seen,
				created_at: profile.created_at,
				updated_at: profile.updated_at
			}
		});
	} catch (err) {
		// If it's already a SvelteKit error, rethrow it
		if (err && typeof err === 'object' && 'status' in err) {
			throw err;
		}

		console.error('Profile endpoint error:', err);
		throw error(500, 'Internal server error');
	}
};
