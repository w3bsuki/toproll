import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { env } from '$env/dynamic/private';
import { env as publicEnv } from '$env/dynamic/public';

let supabase: SupabaseClient | null = null;

export function getSupabaseServer(): SupabaseClient {
        if (!supabase) {
                const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY;
                const supabaseUrl = publicEnv.PUBLIC_SUPABASE_URL;

                if (!supabaseUrl || !serviceRoleKey) {
                        console.warn('⚠️ Supabase server env not configured. Using mock server client.');
                        supabase = createClient('https://mock.supabase.co', 'mock-service-role', {
                                auth: {
                                        autoRefreshToken: false,
                                        persistSession: false
                                }
                        });
                } else {
                        supabase = createClient(supabaseUrl, serviceRoleKey, {
                                auth: {
                                        autoRefreshToken: false,
                                        persistSession: false
                                }
                        });
                }
        }
        return supabase;
}
