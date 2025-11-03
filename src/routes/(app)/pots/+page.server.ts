import type { PageServerLoad } from './$types';
import { getSupabaseServer } from '$lib/supabase/server';

// ✅ Server-side data loading for pots
export const load: PageServerLoad = async () => {
	const supabase = getSupabaseServer();

	try {
		// Preload community pots on server
		const { data: pots, error } = await supabase
			.from('pots')
			.select('*')
			.eq('status', 'active')
			.order('created_at', { ascending: false });

		if (error) {
			console.error('Error loading pots:', error);
			return {
				pots: [],
				error: error.message
			};
		}

		return {
			pots: pots || [],
			error: null
		};
	} catch (err) {
		console.error('Server error loading pots:', err);
		return {
			pots: [],
			error: 'Failed to load pots'
		};
	}
};
