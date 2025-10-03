import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getCurrentUser } from '$lib/services/auth';
import { getOrchestrator } from '$lib/server/orchestrator/battles';
import { getSupabaseServer } from '$lib/supabase/server';
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

		const supabase = getSupabaseServer();

		// Check if battle exists and is joinable
		const { data: battle, error: battleError } = await supabase
			.from('battles')
			.select('*')
			.eq('id', id)
			.single();

		if (battleError || !battle) {
			throw error(404, 'Battle not found');
		}

		if (!['waiting'].includes(battle.status)) {
			throw error(400, 'Battle is not accepting new participants');
		}

		if (battle.current_participants >= battle.max_participants) {
			throw error(400, 'Battle is full');
		}

		// Check if user is already a participant
		const { data: existingParticipant, error: existingError } = await supabase
			.from('battle_participants')
			.select('*')
			.eq('battle_id', id)
			.eq('user_id', user.id)
			.maybeSingle();

		if (existingError) {
			console.error('Error checking existing participant:', existingError);
		}

		if (existingParticipant) {
			throw error(400, 'You are already a participant in this battle');
		}

		// Validate user has sufficient balance
		const { data: userProfile, error: profileError } = await supabase
			.from('user_profiles')
			.select('total_wagered, total_profit')
			.eq('user_id', user.id)
			.single();

		if (profileError) {
			console.error('Error fetching user profile:', profileError);
		}

		// For now, we'll assume user has sufficient balance
		// In production, you'd check against user's actual wallet balance

		// Join battle using orchestrator
		const orchestrator = getOrchestrator();
		const { participant, error: joinError } = await orchestrator.joinBattle(
			id,
			user.id,
			client_seed
		);

		if (joinError || !participant) {
			throw error(500, joinError || 'Failed to join battle');
		}

		// Get updated battle details
		const { data: updatedBattle, error: updatedError } = await supabase
			.from('battles')
			.select(`
				*,
				case:cases(*),
				battle_cases:battle_cases(*, cases(*)),
				participants:battle_participants(
					*,
					user:user_profiles(id, username, avatar_url, steam_profile_url)
				)
			`)
			.eq('id', id)
			.single();

		if (updatedError) {
			console.error('Failed to fetch updated battle:', updatedError);
		}

		return json({
			success: true,
			message: 'Joined battle successfully',
			participant,
			battle: updatedBattle || battle
		});

	} catch (err) {
		console.error('Join battle error:', err);

		if (err instanceof Error) {
			if (err.message.includes('Authentication required')) {
				throw error(401, err.message);
			}
			if (err.message.includes('Battle ID is required') ||
				err.message.includes('Client seed must be') ||
				err.message.includes('Battle is not accepting') ||
				err.message.includes('Battle is full') ||
				err.message.includes('already a participant')) {
				throw error(400, err.message);
			}
			if (err.message.includes('Battle not found')) {
				throw error(404, err.message);
			}
		}

		throw error(500, 'Failed to join battle');
	}
};

