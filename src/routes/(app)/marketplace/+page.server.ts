import type { PageServerLoad } from './$types';
import { getSupabaseServer } from '$lib/supabase/server';

// ✅ Server-side data loading for marketplace
export const load: PageServerLoad = async () => {
	const supabase = getSupabaseServer();

	try {
		// Preload marketplace listings on server
		const { data: listings, error } = await supabase
			.from('marketplace_listings')
			.select('*')
			.eq('status', 'active')
			.order('created_at', { ascending: false })
			.limit(30);

		if (error) {
			console.error('Error loading marketplace:', error);
			return {
				listings: [],
				error: error.message
			};
		}

		return {
			listings: listings || [],
			error: null
		};
	} catch (err) {
		console.error('Server error loading marketplace:', err);
		return {
			listings: [],
			error: 'Failed to load marketplace'
		};
	}
};
