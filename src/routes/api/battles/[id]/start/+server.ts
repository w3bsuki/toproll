import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getCurrentUser } from '$lib/services/auth';
import { getOrchestrator } from '$lib/server/orchestrator/battles';
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

		// Check if battle exists and can be started
		const { data: battle, error: battleError } = await supabase
			.from('battles')
			.select('*')
			.eq('id', id)
			.single();

		if (battleError || !battle) {
			throw error(404, 'Battle not found');
		}

		// Check if user is the battle creator or participant
		if (battle.created_by !== user.id) {
			// Check if user is a participant
			const { data: participant, error: participantError } = await supabase
				.from('battle_participants')
				.select('*')
				.eq('battle_id', id)
				.eq('user_id', user.id)
				.maybeSingle();

			if (participantError || !participant) {
				throw error(403, 'Only battle creator or participants can start the battle');
			}
		}

		if (!['waiting', 'locking'].includes(battle.status)) {
			throw error(400, `Battle cannot be started in ${battle.status} status`);
		}

		if (battle.current_participants < 2) {
			throw error(400, 'Battle needs at least 2 participants to start');
		}

		// Check if battle is already full
		if (battle.current_participants < battle.max_participants) {
			console.warn(
				`Starting battle ${id} before it's full: ${battle.current_participants}/${battle.max_participants}`
			);
			// Allow starting but warn - this is for manual start functionality
		}

		// Start battle using orchestrator
		const orchestrator = getOrchestrator();

		// Check if battle is already being tracked by orchestrator
		const existingBattle = orchestrator.getBattle(id);
		if (!existingBattle) {
			// If not tracked, load it into the orchestrator first
			const { data: fullBattle, error: loadError } = await supabase
				.from('battles')
				.select(
					`
					*,
					battle_cases:battle_cases(*),
					participants:battle_participants(*)
				`
				)
				.eq('id', id)
				.single();

			if (loadError || !fullBattle) {
				throw error(500, 'Failed to load battle into orchestrator');
			}

			// We don't need to manually add to orchestrator as startBattle will handle it
		}

		// Start the battle asynchronously
		setImmediate(() => {
			orchestrator.startBattle(id).catch((err) => {
				console.error('Async battle start error:', err);
			});
		});

		// Update battle status to indicate starting
		await supabase.from('battles').update({ status: 'locking' }).eq('id', id);

		return json({
			success: true,
			message: 'Battle started successfully',
			battle: {
				...battle,
				status: 'locking'
			}
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
				err.message.includes('Battle needs at least') ||
				err.message.includes('Only battle creator')
			) {
				throw error(400, err.message);
			}
			if (err.message.includes('Battle not found')) {
				throw error(404, err.message);
			}
		}

		throw error(500, 'Failed to start battle');
	}
};
