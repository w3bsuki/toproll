import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch }) => {
	// Fetch user profile
	const response = await fetch('/api/profile');
	const { profile } = await response.json();

	return {
		profile
	};
};
