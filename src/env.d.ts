/// <reference types="@sveltejs/kit" />

// Environment variables type definitions
interface ImportMetaEnv {
	// Public environment variables (accessible in client)
	readonly PUBLIC_SUPABASE_URL: string;
	readonly PUBLIC_SUPABASE_ANON_KEY: string;

	// Private environment variables (server-only)
	readonly SUPABASE_SERVICE_ROLE_KEY: string;
	readonly STEAM_API_KEY: string;
	readonly BASE_URL: string;
	readonly SESSION_SECRET: string;
	readonly STEAM_OPENID_REALM: string;
	readonly STEAM_OPENID_RETURN_TO: string;
	readonly REDIS_URL?: string;
	readonly SENTRY_DSN?: string;
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}
