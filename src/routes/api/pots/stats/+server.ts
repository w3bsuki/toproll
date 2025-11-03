import { json, error } from '@sveltejs/kit';
import { potService } from '$lib/server/services/potService';
import { getCurrentUser } from '$lib/server/services/auth';
import type { RequestHandler } from './$types';

// GET: Get pot statistics (global or user-specific)
export const GET: RequestHandler = async ({ request, locals }) => {
	try {
		const cookieHeader = request.headers.get('cookie') || '';
		const cookies = {
			get: (name: string) => {
				const match = cookieHeader.match(new RegExp(`(^| )${name}=([^;]+)`));
				return match ? match[2] : null;
			}
		};
		const user = await getCurrentUser(cookies);

		const stats = await potService.getPotStats(user?.id);

		return json({ success: true, data: stats });
	} catch (err) {
		console.error('Error fetching pot stats:', err);
		return error(500, 'Failed to fetch pot statistics');
	}
};
