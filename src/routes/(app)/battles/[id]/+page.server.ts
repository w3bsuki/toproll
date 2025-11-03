import type { PageServerLoad } from './$types';
import { getSupabaseServer } from '$lib/supabase/server';

// ✅ Server-side data loading for battle details
export const load: PageServerLoad = async ({ params }) => {
	const supabase = getSupabaseServer();

	try {
		// Preload battle details on server
		const { data: battle, error } = await supabase
			.from('case_battles')
			.select('*, battle_participants(*)')
			.eq('id', params.id)
			.single();

		if (error) {
			console.error('Error loading battle:', error);
			return {
				battle: null,
				error: error.message
			};
		}

		return {
			battle,
			error: null
		};
	} catch (err) {
		console.error('Server error loading battle:', err);
		return {
			battle: null,
			error: 'Failed to load battle'
		};
	}
};
