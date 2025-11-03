import { json, error } from '@sveltejs/kit';
import { potService } from '$lib/server/services/potService';
import { requireAuth } from '$lib/services/auth';
import type { RequestHandler } from './$types';

// POST: Settle pot with reveal_seed
export const POST: RequestHandler = async ({ params, request, locals }) => {
	try {
		const { id } = params;
		if (!id) {
			return error(400, 'Pot ID is required');
		}

		// Authenticate user (you might want to check for admin/orchestrator role here)
		const cookieHeader = request.headers.get('cookie') || '';
		const cookies = {
			get: (name: string) => {
				const match = cookieHeader.match(new RegExp(`(^| )${name}=([^;]+)`));
				return match ? match[2] : null;
			}
		};
		const user = await requireAuth(cookies);

		const body = await request.json();
		const { reveal_seed } = body;

		const result = await potService.settlePot(id, reveal_seed);

		return json({
			success: true,
			data: result,
			message: 'Pot settled successfully'
		});
	} catch (err) {
		console.error('Error settling pot:', err);

		if (err instanceof Error) {
			if (err.message.includes('Authentication required')) {
				return error(401, 'Authentication required');
			}
			if (err.message.includes('not found')) {
				return error(404, 'Pot not found');
			}
			if (
				err.message.includes('must be locked') ||
				err.message.includes('Invalid reveal seed') ||
				err.message.includes('No entries found')
			) {
				return error(400, err.message);
			}
		}

		return error(500, 'Failed to settle pot');
	}
};
