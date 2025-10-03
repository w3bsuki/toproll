import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getCurrentUser } from '$lib/services/auth';
import { getOrchestrator } from '$lib/server/orchestrator/battles';
import { getSupabaseServer } from '$lib/supabase/server';
import type { CreateBattleRequest, Battle } from '$lib/types';

// POST /api/battles -> create battle
export const POST: RequestHandler = async ({ request, cookies }) => {
	try {
		const user = await getCurrentUser(cookies);

		if (!user) {
			throw error(401, 'Authentication required');
		}

		const body: CreateBattleRequest = await request.json();

		// Validate request body
		if (!body.case_ids || !Array.isArray(body.case_ids) || body.case_ids.length === 0) {
			throw error(400, 'case_ids must be a non-empty array');
		}

		if (!body.mode || !['standard', 'crazy'].includes(body.mode)) {
			throw error(400, 'mode must be either "standard" or "crazy"');
		}

		if (!body.max_participants || ![2, 4].includes(body.max_participants)) {
			throw error(400, 'max_participants must be either 2 or 4');
		}

		const supabase = getSupabaseServer();

		// Validate that all cases exist
		const { data: cases, error: casesError } = await supabase
			.from('cases')
			.select('id, name, price')
			.in('id', body.case_ids);

		if (casesError || !cases || cases.length !== body.case_ids.length) {
			throw error(400, 'Invalid case IDs provided');
		}

		// Create battle using orchestrator
		const orchestrator = getOrchestrator();
		const { battle, error: battleError } = await orchestrator.createBattle(
			body.case_ids,
			body.mode,
			body.max_participants,
			user.id
		);

		if (battleError || !battle) {
			throw error(500, battleError || 'Failed to create battle');
		}

		// Get full battle details with relations
		const { data: fullBattle, error: fetchError } = await supabase
			.from('battles')
			.select(
				`
				*,
				case:cases(*),
				battle_cases:battle_cases(*, cases(*))
			`
			)
			.eq('id', battle.id)
			.single();

		if (fetchError) {
			console.error('Failed to fetch full battle details:', fetchError);
			// Return basic battle info if details fetch fails
			return json({ battle, success: true });
		}

		return json({ battle: fullBattle, success: true });
	} catch (err) {
		console.error('Create battle error:', err);

		if (err instanceof Error) {
			// Handle validation errors
			if (err.message.includes('Authentication required')) {
				throw error(401, err.message);
			}
			if (
				err.message.includes('Invalid case IDs') ||
				err.message.includes('mode must be') ||
				err.message.includes('max_participants must be')
			) {
				throw error(400, err.message);
			}
		}

		throw error(500, 'Failed to create battle');
	}
};

// GET /api/battles?status=waiting|active&limit=20&offset=0 -> lobby feed
export const GET: RequestHandler = async ({ url, cookies }) => {
	try {
		const status = url.searchParams.get('status');
		const limit = parseInt(url.searchParams.get('limit') || '20');
		const offset = parseInt(url.searchParams.get('offset') || '0');

		// Validate status parameter
		if (
			status &&
			!['waiting', 'locking', 'in_progress', 'settling', 'completed', 'cancelled'].includes(status)
		) {
			throw error(400, 'Invalid status parameter');
		}

		// Validate pagination parameters
		if (limit < 1 || limit > 100) {
			throw error(400, 'Limit must be between 1 and 100');
		}

		if (offset < 0) {
			throw error(400, 'Offset must be non-negative');
		}

		const supabase = getSupabaseServer();

		// Build query
		let query = supabase
			.from('battles')
			.select(
				`
				*,
				case:cases(*),
				battle_cases:battle_cases(*, cases(*)),
				participants:battle_participants(*, user:user_profiles(id, username, avatar_url))
			`
			)
			.order('created_at', { ascending: false })
			.range(offset, offset + limit - 1);

		// Filter by status if provided
		if (status) {
			query = query.eq('status', status);
		} else {
			// By default, only show waiting and locking battles for the lobby
			query = query.in('status', ['waiting', 'locking']);
		}

		const { data: battles, error: fetchError, count } = await query;

		if (fetchError) {
			console.error('Failed to fetch battles:', fetchError);
			throw error(500, 'Failed to fetch battles');
		}

		// Get current user if authenticated (for user-specific data)
		const currentUser = await getCurrentUser(cookies);

		return json({
			battles: battles || [],
			pagination: {
				limit,
				offset,
				total: count || 0,
				hasMore: (count || 0) > offset + limit
			},
			currentUser: currentUser
				? {
						id: currentUser.id,
						steamId: currentUser.steamId
					}
				: null
		});
	} catch (err) {
		console.error('Battles list error:', err);

		if (err instanceof Error) {
			if (
				err.message.includes('Invalid status') ||
				err.message.includes('Limit must be') ||
				err.message.includes('Offset must be')
			) {
				throw error(400, err.message);
			}
		}

		throw error(500, 'Failed to fetch battles');
	}
};
