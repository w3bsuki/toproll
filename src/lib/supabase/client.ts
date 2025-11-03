import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { env } from '$env/dynamic/public';
import { dev } from '$app/environment';

let supabase: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient {
	if (!supabase) {
		if (!env.PUBLIC_SUPABASE_URL || !env.PUBLIC_SUPABASE_ANON_KEY) {
			if (dev) {
				// In development, create a mock client to prevent build failures
				// This allows the app to run without real Supabase credentials
				console.warn(
					'⚠️ Supabase environment variables not configured. Using mock client for development.'
				);
				supabase = createClient('https://mock.supabase.co', 'mock-anon-key', {
					realtime: { params: { eventsPerSecond: 5 } }
				});
			} else {
				console.error('❌ Supabase environment variables not configured!');
				console.error('PUBLIC_SUPABASE_URL:', env.PUBLIC_SUPABASE_URL);
				console.error('PUBLIC_SUPABASE_ANON_KEY:', env.PUBLIC_SUPABASE_ANON_KEY ? 'SET' : 'NOT SET');
				throw new Error('Supabase environment variables not configured');
			}
		} else {
			console.log('✅ Initializing Supabase client with URL:', env.PUBLIC_SUPABASE_URL);
			supabase = createClient(env.PUBLIC_SUPABASE_URL!, env.PUBLIC_SUPABASE_ANON_KEY!, {
				realtime: { params: { eventsPerSecond: 5 } },
				auth: {
					persistSession: true,
					autoRefreshToken: true,
					detectSessionInUrl: false,
					storage: typeof window !== 'undefined' ? window.localStorage : undefined,
					storageKey: 'sb-pqbomlvoborxfxdglkrt-auth-token',
					flowType: 'pkce'
				}
			});
		}
	}
	return supabase;
}
