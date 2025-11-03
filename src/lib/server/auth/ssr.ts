/* eslint-disable @typescript-eslint/no-explicit-any */
import { createServerClient } from '@supabase/ssr';
import type { RequestEvent, Cookies } from '@sveltejs/kit';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';

// Wrap cookie adapter to satisfy @supabase/ssr
function cookieAdapter(cookies: Cookies) {
  return {
    get(name: string) {
      return cookies.get(name);
    },
    set(name: string, value: string, options?: Record<string, unknown>) {
      cookies.set(name, value, { ...(options as any), path: '/' });
    },
    remove(name: string, options?: Record<string, unknown>) {
      cookies.delete(name, { ...(options as any), path: '/' });
    }
  };
}

export function getSupabaseSSR(event: RequestEvent) {
  return createServerClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
    // Cast to any to support the deprecated cookie API (get/set/remove)
    cookies: cookieAdapter(event.cookies) as any
  });
}
