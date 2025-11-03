/* eslint-disable @typescript-eslint/no-explicit-any */
import { createServerClient } from '@supabase/ssr';
import type { RequestEvent, Cookies } from '@sveltejs/kit';
import { env } from '$env/dynamic/public';

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
  return createServerClient(
    env.PUBLIC_SUPABASE_URL!,
    env.PUBLIC_SUPABASE_ANON_KEY!,
    {
      // Cast to any to support the deprecated cookie API (get/set/remove)
      cookies: cookieAdapter(event.cookies) as any
    }
  );
}

/**
 * Create SSR client from just cookies (for use in auth guards and server load functions)
 */
export function getSupabaseSSRFromCookies(cookies: Cookies) {
  return createServerClient(
    env.PUBLIC_SUPABASE_URL!,
    env.PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: cookieAdapter(cookies) as any
    }
  );
}
