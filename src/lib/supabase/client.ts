import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { env as publicEnv } from '$env/dynamic/public';
import { dev } from '$app/environment';

let supabase: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient {
        if (!supabase) {
                const supabaseUrl = publicEnv.PUBLIC_SUPABASE_URL;
                const supabaseAnonKey = publicEnv.PUBLIC_SUPABASE_ANON_KEY;

                if (!supabaseUrl || !supabaseAnonKey) {
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
                                throw new Error('Supabase environment variables not configured');
                        }
                } else {
                        supabase = createClient(supabaseUrl, supabaseAnonKey, {
                                realtime: { params: { eventsPerSecond: 5 } }
                        });
                }
	}
	return supabase;
}
