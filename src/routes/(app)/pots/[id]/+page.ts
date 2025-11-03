import type { PageLoad } from './$types';

// ✅ Enable preloading and code splitting
export const load: PageLoad = async ({ params }) => {
	return {
		potId: params.id
	};
};

export const prerender = false;
export const ssr = true;
