// Global type declarations for Paraglide modules
// These provide TypeScript types for the generated Paraglide files while excluding the actual JS files from checking

declare module '$lib/paraglide/runtime.js' {
	export const setLocale: (newLocale: string, options?: { reload?: boolean }) => void;
	export const deLocalizeUrl: (url: string) => { pathname: string };
	export const currentLocale: string;
}

declare module '$lib/paraglide/messages.js' {
	export const m: Record<string, string>;
	export * from '$lib/paraglide/messages/_index.js';
}

declare module '$lib/paraglide/messages/_index.js' {
	const messages: Record<string, string>;
	export default messages;
	export * from './en.js';
}

declare module '$lib/paraglide/messages/en.js' {
	const messages: Record<string, string>;
	export default messages;
}

declare module '$lib/paraglide/server.js' {
	export const paraglideMiddleware: any;
}

declare module '$lib/paraglide/registry.js' {
	// Registry exports if needed
}
