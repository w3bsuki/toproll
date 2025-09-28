import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_SERVICE_ROLE_KEY } from '$env/static/private';
import { PUBLIC_SUPABASE_URL } from '$env/static/public';

if (!SUPABASE_SERVICE_ROLE_KEY || !PUBLIC_SUPABASE_URL) {
	throw new Error('Supabase server env not configured');
}

let supabase: SupabaseClient | null = null;

export function getSupabaseServer(): SupabaseClient {
	if (!supabase) {
		supabase = createClient(PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
			auth: {
				autoRefreshToken: false,
				persistSession: false
			}
		});
	}
	return supabase;
}
