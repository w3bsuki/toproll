import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getCurrentUser } from '$lib/services/auth';
import { lockBattle } from '$lib/server/services/battleService';
import { getSupabaseServer } from '$lib/supabase/server';

// POST /api/battles/[id]/start
export const POST: RequestHandler = async ({ params, cookies }) => {
	try {
		const { id } = params;
		const user = await getCurrentUser(cookies);

		if (!user) {
			throw error(401, 'Authentication required');
		}

		if (!id) {
			throw error(400, 'Battle ID is required');
		}

		const supabase = getSupabaseServer();

		// Check if battle exists and user is the creator
		const { data: battle, error: battleError } = await supabase
			.from('battles')
			.select('*')
			.eq('id', id)
			.single();

		if (battleError || !battle) {
			throw error(404, 'Battle not found');
		}

		// Check if user is the creator or an admin
		if (battle.created_by !== user.id) {
			throw error(403, 'Only battle creator can start the battle');
		}

		// Check if battle is in a valid state to start
		if (!['waiting', 'locking'].includes(battle.status)) {
			throw error(400, `Battle cannot be started in current status: ${battle.status}`);
		}

		// Check if battle has enough participants
		if (battle.current_participants < 2) {
			throw error(400, 'Battle needs at least 2 participants to start');
		}

		// Lock the battle (this will trigger the first round)
		await lockBattle(id);

		return json({
			success: true,
			message: 'Battle started successfully'
		});
	} catch (err) {
		console.error('Start battle error:', err);

		if (err instanceof Error) {
			if (err.message.includes('Authentication required')) {
				throw error(401, err.message);
			}
			if (
				err.message.includes('Battle ID is required') ||
				err.message.includes('Battle cannot be started') ||
				err.message.includes('Battle needs at least')
			) {
				throw error(400, err.message);
			}
			if (err.message.includes('Battle not found')) {
				throw error(404, err.message);
			}
			if (err.message.includes('Only battle creator')) {
				throw error(403, err.message);
			}
		}

		throw error(500, 'Failed to start battle');
	}
};
