import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { PUBLIC_SUPABASE_ANON_KEY, PUBLIC_SUPABASE_URL } from '$env/static/public';

let supabase: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient {
	if (!supabase) {
		if (!PUBLIC_SUPABASE_URL || !PUBLIC_SUPABASE_ANON_KEY) {
			throw new Error('Supabase env not configured');
		}
		supabase = createClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
			realtime: { params: { eventsPerSecond: 5 } }
		});
	}
	return supabase;
}
