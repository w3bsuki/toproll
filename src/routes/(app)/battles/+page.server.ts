import type { PageServerLoad } from './$types';
import { getSupabaseServer } from '$lib/supabase/server';

// ✅ Server-side data loading for battles list
export const load: PageServerLoad = async () => {
	const supabase = getSupabaseServer();

	try {
		// Preload battles list on server
		const { data: battles, error } = await supabase
			.from('case_battles')
			.select('*')
			.order('created_at', { ascending: false })
			.limit(20);

		if (error) {
			console.error('Error loading battles:', error);
			return {
				battles: [],
				error: error.message
			};
		}

		return {
			battles: battles || [],
			error: null
		};
	} catch (err) {
		console.error('Server error loading battles:', err);
		return {
			battles: [],
			error: 'Failed to load battles'
		};
	}
};
