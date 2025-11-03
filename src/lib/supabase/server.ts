import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_SERVICE_ROLE_KEY } from '$env/static/private';
import { PUBLIC_SUPABASE_URL } from '$env/static/public';
import { dev } from '$app/environment';

let supabase: SupabaseClient | null = null;

function createServiceClient(): SupabaseClient {
	if (!PUBLIC_SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
		if (dev) {
			console.warn(
				'⚠️ Supabase server environment variables not configured. Using mock client for development.'
			);
			return createClient('https://mock.supabase.co', 'mock-service-role-key');
		}
		throw new Error('Supabase server environment variables not configured');
	}

	return createClient(PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
		auth: {
			autoRefreshToken: false,
			persistSession: false
		}
	});
}

export function getSupabaseServer(): SupabaseClient {
	if (!supabase) {
		supabase = createServiceClient();
	}

	return supabase;
}
