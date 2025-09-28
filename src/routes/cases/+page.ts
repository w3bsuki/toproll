import type { PageLoad } from './$types';
import { getSupabaseClient } from '$lib/supabase/client';

export const load: PageLoad = async ({ url }) => {
	const supabase = getSupabaseClient();

	try {
		// Fetch all cases with their items
		const { data: cases, error: casesError } = await supabase
			.from('cases')
			.select(`
				*,
				case_items (*)
			`)
			.order('created_at', { ascending: false });

		if (casesError) {
			console.error('Error fetching cases:', casesError);
			return {
				cases: [],
				error: casesError.message
			};
		}

		return {
			cases: cases || [],
			error: null
		};
	} catch (error) {
		console.error('Error in cases page load:', error);
		return {
			cases: [],
			error: 'Failed to load cases'
		};
	}
};