import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getCurrentUser } from '$lib/services/auth';
import { joinBattle } from '$lib/server/services/battleService';
import type { JoinBattleRequest } from '$lib/types';

// POST /api/battles/[id]/join
export const POST: RequestHandler = async ({ params, request, cookies }) => {
	try {
		const { id } = params;
		const user = await getCurrentUser(cookies);

		if (!user) {
			throw error(401, 'Authentication required');
		}

		if (!id) {
			throw error(400, 'Battle ID is required');
		}

		const body: JoinBattleRequest = await request.json();
		const { client_seed } = body;

		// Validate client seed if provided
		if (client_seed && (typeof client_seed !== 'string' || client_seed.length < 8)) {
			throw error(400, 'Client seed must be at least 8 characters long');
		}

		// Join battle using our service
		const { battle, participant } = await joinBattle(user.id, id, client_seed);

		return json({
			success: true,
			message: 'Joined battle successfully',
			battle,
			participant
		});
	} catch (err) {
		console.error('Join battle error:', err);

		if (err instanceof Error) {
			if (err.message.includes('Authentication required')) {
				throw error(401, err.message);
			}
			if (
				err.message.includes('Battle ID is required') ||
				err.message.includes('Client seed must be') ||
				err.message.includes('Battle is not accepting') ||
				err.message.includes('Battle is full') ||
				err.message.includes('already a participant') ||
				err.message.includes('Insufficient balance')
			) {
				throw error(400, err.message);
			}
			if (err.message.includes('Battle not found')) {
				throw error(404, err.message);
			}
		}

		throw error(500, 'Failed to join battle');
	}
};
