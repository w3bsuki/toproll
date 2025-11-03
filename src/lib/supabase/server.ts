import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { env as privateEnv } from '$env/dynamic/private';
import { env } from '$env/dynamic/public';
import { dev } from '$app/environment';

let supabase: SupabaseClient | null = null;

function createServiceClient(): SupabaseClient {
	if (!env.PUBLIC_SUPABASE_URL || !privateEnv.SUPABASE_SERVICE_ROLE_KEY) {
		if (dev) {
			console.warn(
				'⚠️ Supabase server environment variables not configured. Using mock client for development.'
			);
			return createClient('https://mock.supabase.co', 'mock-service-role-key');
		}
		throw new Error('Supabase server environment variables not configured');
	}

	return createClient(env.PUBLIC_SUPABASE_URL!, privateEnv.SUPABASE_SERVICE_ROLE_KEY!, {
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
