import { json, error } from '@sveltejs/kit';
import { potService } from '$lib/server/services/potService';
import { getCurrentUser } from '$lib/server/services/auth';
import type { RequestHandler } from './$types';

// GET: Get pot statistics (global or user-specific)
export const GET: RequestHandler = async ({ cookies }) => {
	try {
		const user = await getCurrentUser(cookies);

		const stats = await potService.getPotStats(user?.id);

		return json({ success: true, data: stats });
	} catch (err) {
		console.error('Error fetching pot stats:', err);
		return error(500, 'Failed to fetch pot statistics');
	}
};
