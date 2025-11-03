import { json, error } from '@sveltejs/kit';
import { potService } from '$lib/server/services/potService';
import type { RequestHandler } from './$types';

// GET: Get pot details with entries
export const GET: RequestHandler = async ({ params, cookies }) => {
	try {
		const { id } = params;
		if (!id) {
			return error(400, 'Pot ID is required');
		}

		// Get current user if authenticated
		let userId: string | null = null;
		try {
			const { getCurrentUser } = await import('$lib/services/auth');
			const user = await getCurrentUser(cookies);
			userId = user ? user.id : null;
		} catch {
			// User not authenticated, continue without user-specific data
		}

		const potDetails = await potService.getPotDetails(id, userId ?? undefined);

		return json({ success: true, data: potDetails });
	} catch (err) {
		console.error('Error fetching pot details:', err);
		if (err instanceof Error && err.message.includes('not found')) {
			return error(404, 'Pot not found');
		}
		return error(500, 'Failed to fetch pot details');
	}
};
