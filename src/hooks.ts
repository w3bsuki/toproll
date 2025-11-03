import { deLocalizeUrl } from '$lib/paraglide/runtime';

export const reroute = (request) => deLocalizeUrl(request.url).pathname;

// Optional transport export to avoid build-time warnings; customize if you need custom serializers
export const transport: import('@sveltejs/kit').Transport = {};
