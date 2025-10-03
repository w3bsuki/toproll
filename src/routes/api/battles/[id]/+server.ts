import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getCurrentUser } from '$lib/services/auth';
import { getOrchestrator } from '$lib/server/orchestrator/battles';
import { getSupabaseServer } from '$lib/supabase/server';
import type { Battle } from '$lib/types';

// GET /api/battles/[id] -> battle details
export const GET: RequestHandler = async ({ params, cookies }) => {
	try {
		const { id } = params;

		if (!id) {
			throw error(400, 'Battle ID is required');
		}

		const supabase = getSupabaseServer();

		// Get battle with full details
		const { data: battle, error: fetchError } = await supabase
			.from('battles')
			.select(
				`
				*,
				case:cases(*),
				battle_cases:battle_cases(*, cases(*)),
				participants:battle_participants(
					*,
					user:user_profiles(id, username, avatar_url, steam_profile_url)
				),
				rounds:battle_rounds(*),
				results:battle_results(
					*,
					participant:battle_participants(*, user:user_profiles(id, username, avatar_url))
				)
			`
			)
			.eq('id', id)
			.single();

		if (fetchError) {
			if (fetchError.code === 'PGRST116') {
				throw error(404, 'Battle not found');
			}
			console.error('Failed to fetch battle:', fetchError);
			throw error(500, 'Failed to fetch battle');
		}

		if (!battle) {
			throw error(404, 'Battle not found');
		}

		// Get current user if authenticated
		const currentUser = await getCurrentUser(cookies);

		// Check if current user is a participant
		let userParticipant = null;
		if (currentUser && battle.participants) {
			userParticipant = battle.participants.find((p) => p.user_id === currentUser.id);
		}

		// Get additional battle data if in progress or completed
		let pullsData = [];
		if (['in_progress', 'settling', 'completed'].includes(battle.status)) {
			const { data: pulls } = await supabase
				.from('battle_pulls')
				.select(
					`
					*,
					participant:battle_participants(*, user:user_profiles(id, username, avatar_url)),
					item:case_items(*),
					round:battle_rounds(*)
				`
				)
				.in('round_id', battle.rounds?.map((r) => r.id) || []);

			pullsData = pulls || [];
		}

		// Get orchestrator state for active battles
		let orchestratorState = null;
		if (['waiting', 'locking', 'in_progress'].includes(battle.status)) {
			const orchestrator = getOrchestrator();
			orchestratorState = orchestrator.getBattle(id);
		}

		return json({
			battle: {
				...battle,
				pulls: pullsData,
				orchestratorState
			},
			currentUser: currentUser
				? {
						id: currentUser.id,
						steamId: currentUser.steamId,
						isParticipant: !!userParticipant,
						participant: userParticipant
					}
				: null
		});
	} catch (err) {
		console.error('Battle details error:', err);

		if (err instanceof Error) {
			if (err.message.includes('Battle ID is required')) {
				throw error(400, err.message);
			}
			if (err.message.includes('Battle not found')) {
				throw error(404, err.message);
			}
		}

		throw error(500, 'Failed to fetch battle details');
	}
};

// POST /api/battles/[id] -> additional battle operations (could be used for leaving battle, etc.)
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

		const body = await request.json();
		const { action } = body;

		// Handle different actions
		switch (action) {
			case 'leave':
				return await handleLeaveBattle(id, user.id);
			case 'cancel':
				return await handleCancelBattle(id, user.id);
			default:
				throw error(400, 'Invalid action');
		}
	} catch (err) {
		console.error('Battle action error:', err);

		if (err instanceof Error) {
			if (err.message.includes('Authentication required')) {
				throw error(401, err.message);
			}
			if (err.message.includes('Battle ID is required') || err.message.includes('Invalid action')) {
				throw error(400, err.message);
			}
			if (err.message.includes('Battle not found') || err.message.includes('Cannot leave')) {
				throw error(404, err.message);
			}
		}

		throw error(500, 'Failed to perform battle action');
	}
};

async function handleLeaveBattle(battleId: string, userId: string) {
	const supabase = getSupabaseServer();

	// Check if battle exists and user is participant
	const { data: battle, error: battleError } = await supabase
		.from('battles')
		.select('*')
		.eq('id', battleId)
		.single();

	if (battleError || !battle) {
		throw error(404, 'Battle not found');
	}

	if (!['waiting'].includes(battle.status)) {
		throw error(400, 'Cannot leave battle that is not in waiting status');
	}

	const { data: participant, error: participantError } = await supabase
		.from('battle_participants')
		.select('*')
		.eq('battle_id', battleId)
		.eq('user_id', userId)
		.single();

	if (participantError || !participant) {
		throw error(404, 'You are not a participant in this battle');
	}

	// Remove participant
	await supabase.from('battle_participants').delete().eq('id', participant.id);

	// Update battle participant count
	await supabase
		.from('battles')
		.update({
			current_participants: battle.current_participants - 1,
			status: 'waiting'
		})
		.eq('id', battleId);

	return json({ success: true, message: 'Left battle successfully' });
}

async function handleCancelBattle(battleId: string, userId: string) {
	const supabase = getSupabaseServer();

	// Check if battle exists and user is creator
	const { data: battle, error: battleError } = await supabase
		.from('battles')
		.select('*')
		.eq('id', battleId)
		.single();

	if (battleError || !battle) {
		throw error(404, 'Battle not found');
	}

	if (battle.created_by !== userId) {
		throw error(403, 'Only battle creator can cancel');
	}

	if (!['waiting'].includes(battle.status)) {
		throw error(400, 'Cannot cancel battle that is not in waiting status');
	}

	// Cancel battle
	await supabase.from('battles').update({ status: 'cancelled' }).eq('id', battleId);

	return json({ success: true, message: 'Battle cancelled successfully' });
}
