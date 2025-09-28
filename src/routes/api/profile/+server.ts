import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getCurrentUser, getUserProfile } from '$lib/services/auth';
import { getPlayerSummary } from '$lib/services/steamAPI';
import { getSupabaseServer } from '$lib/supabase/server';

export const GET: RequestHandler = async ({ cookies }) => {
	try {
		const user = await getCurrentUser(cookies);

		if (!user) {
			throw error(401, 'Authentication required');
		}

		// Get user profile from database
		const profile = await getUserProfile(user.id);

		if (!profile) {
			throw error(404, 'User profile not found');
		}

		// Try to refresh Steam profile data
		try {
			const steamProfile = await getPlayerSummary(user.steamId);

			// Update profile if Steam data changed
			const supabase = getSupabaseServer();
			await supabase
				.from('user_profiles')
				.update({
					username: steamProfile.personaname,
					avatar_url: steamProfile.avatarfull,
					steam_profile_url: steamProfile.profileurl,
					updated_at: new Date().toISOString()
				})
				.eq('user_id', user.id);
		} catch (steamError) {
			console.warn('Failed to refresh Steam profile:', steamError);
			// Continue with cached data
		}

		return json({ profile });
	} catch (err) {
		console.error('Profile API error:', err);

		if (err instanceof Error && err.message === 'Authentication required') {
			throw error(401, err.message);
		}

		throw error(500, 'Failed to fetch profile');
	}
};

export const PUT: RequestHandler = async ({ request, cookies }) => {
	try {
		const user = await getCurrentUser(cookies);

		if (!user) {
			throw error(401, 'Authentication required');
		}

		const updates = await request.json();

		// Only allow updating certain fields for security
		const allowedFields = [
			'total_wagered',
			'total_profit',
			'win_rate',
			'biggest_win',
			'case_battle_wins'
		];
		const filteredUpdates: any = {};

		for (const field of allowedFields) {
			if (updates[field] !== undefined) {
				filteredUpdates[field] = updates[field];
			}
		}

		if (Object.keys(filteredUpdates).length === 0) {
			throw error(400, 'No valid fields to update');
		}

		// Update user profile in Supabase
		const supabase = getSupabaseServer();
		const { data, error: updateError } = await supabase
			.from('user_profiles')
			.update({
				...filteredUpdates,
				updated_at: new Date().toISOString()
			})
			.eq('user_id', user.id)
			.select()
			.single();

		if (updateError) {
			throw error(500, `Failed to update profile: ${updateError.message}`);
		}

		return json({ profile: data, success: true });
	} catch (err) {
		console.error('Profile update error:', err);

		if (err instanceof Error && err.message === 'Authentication required') {
			throw error(401, err.message);
		}

		throw error(500, 'Failed to update profile');
	}
};
