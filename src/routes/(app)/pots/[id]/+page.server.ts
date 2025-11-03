import type { PageServerLoad } from './$types';
import { getSupabaseServer } from '$lib/supabase/server';

// ✅ Server-side data loading for specific pot
export const load: PageServerLoad = async ({ params }) => {
	const supabase = getSupabaseServer();

	try {
		// Preload pot details on server
		const { data: pot, error } = await supabase
			.from('pots')
			.select('*, pot_entries(*)')
			.eq('id', params.id)
			.single();

		if (error) {
			console.error('Error loading pot:', error);
			return {
				pot: null,
				error: error.message
			};
		}

		return {
			pot,
			error: null
		};
	} catch (err) {
		console.error('Server error loading pot:', err);
		return {
			pot: null,
			error: 'Failed to load pot'
		};
	}
};
