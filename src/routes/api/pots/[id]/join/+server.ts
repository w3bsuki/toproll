import { json, error } from '@sveltejs/kit';
import { potService } from '$lib/server/services/potService';
import { requireAuth } from '$lib/services/auth';
import type { RequestHandler } from './$types';

// POST: Join a pot with ticket_count
export const POST: RequestHandler = async ({ params, request, cookies }) => {
	try {
		const { id } = params;
		if (!id) {
			return error(400, 'Pot ID is required');
		}

		// Authenticate user
		const user = await requireAuth(cookies);

		const body = await request.json();
		const { ticket_count } = body;

		// Validate input
		if (!ticket_count || ticket_count <= 0) {
			return error(400, 'Valid ticket_count is required');
		}

		// Get user agent and IP for audit
		const userAgent = request.headers.get('user-agent') || undefined;
		const clientIP =
			request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';

		const entry = await potService.joinPot(
			{
				pot_id: id,
				ticket_count
			},
			user.id,
			userAgent,
			clientIP
		);

		return json({
			success: true,
			data: entry,
			message: `Successfully purchased ${ticket_count} ticket(s)`
		});
	} catch (err) {
		console.error('Error joining pot:', err);

		if (err instanceof Error) {
			if (err.message.includes('Authentication required')) {
				return error(401, 'Authentication required');
			}
			if (err.message.includes('not found')) {
				return error(404, 'Pot not found');
			}
			if (
				err.message.includes('not open') ||
				err.message.includes('expired') ||
				err.message.includes('Insufficient balance') ||
				err.message.includes('Not enough tickets') ||
				err.message.includes('maximum tickets per user')
			) {
				return error(400, err.message);
			}
		}

		return error(500, 'Failed to join pot');
	}
};
