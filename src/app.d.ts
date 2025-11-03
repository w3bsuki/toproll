// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		interface Locals {
			supabase: import('@supabase/supabase-js').SupabaseClient;
			getSession: () => Promise<import('@supabase/supabase-js').Session | null>;
			user?: {
				id: string;
				steamId: string;
				username: string;
				avatar?: string;
			};
			requestId?: string;
			logger?: import('$lib/observability/logger').Logger;
		}

		interface PageData {
			isAuthenticated?: boolean;
			user?: {
				id: string;
				steamId: string;
				username: string;
				avatar?: string;
				balance: number;
				totalWagered: number;
				totalProfit: number;
				winRate: number;
				biggestWin: number;
				caseBattleWins: number;
			} | null;
		}
	}
}

export {};

declare module '$env/static/private' {
	export const SUPABASE_SERVICE_ROLE_KEY: string;
	export const STEAM_API_KEY: string;
	export const BASE_URL: string;
	export const SESSION_SECRET: string;
	export const STEAM_OPENID_REALM: string;
	export const STEAM_OPENID_RETURN_TO: string;
	export const REDIS_URL: string;
	export const SENTRY_DSN: string;
}

declare module '$env/static/public' {
	export const PUBLIC_SUPABASE_URL: string;
	export const PUBLIC_SUPABASE_ANON_KEY: string;
}

declare module '$lib/paraglide/server' {
	import type { Request } from '@sveltejs/kit';
	export function paraglideMiddleware(
		request: Request,
		handler: (context: { request: Request; locale: string }) => Request | Promise<Request>
	): Promise<Request>;
}

declare module '$lib/paraglide/runtime' {
	export function deLocalizeUrl(url: URL): URL;
	export function setLocale(locale: string): void;
}

declare module '$lib/paraglide/messages.js' {
	export const m: Record<string, (args?: Record<string, unknown>) => string>;
}
