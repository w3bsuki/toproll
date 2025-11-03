import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getCurrentUser } from '$lib/server/services/auth';
import { getSupabaseServer } from '$lib/server/auth/server';

// GET /api/battles/feed?status=waiting|active&limit=20&offset=0 -> dedicated lobby feed
export const GET: RequestHandler = async ({ url, cookies }) => {
	try {
		const status = url.searchParams.get('status');
		const mode = url.searchParams.get('mode'); // 'standard' | 'crazy'
		const limit = parseInt(url.searchParams.get('limit') || '20');
		const offset = parseInt(url.searchParams.get('offset') || '0');
		const sortBy = url.searchParams.get('sortBy') || 'created_at'; // created_at | total_pot | entry_fee
		const sortOrder = url.searchParams.get('sortOrder') || 'desc'; // asc | desc

		// Validate status parameter
		if (
			status &&
			!['waiting', 'locking', 'in_progress', 'settling', 'completed', 'cancelled'].includes(status)
		) {
			throw error(400, 'Invalid status parameter');
		}

		// Validate mode parameter
		if (mode && !['standard', 'crazy'].includes(mode)) {
			throw error(400, 'Invalid mode parameter');
		}

		// Validate sort parameters
		const validSortFields = ['created_at', 'total_pot', 'entry_fee', 'current_participants'];
		if (!validSortFields.includes(sortBy)) {
			throw error(400, 'Invalid sortBy parameter');
		}

		if (!['asc', 'desc'].includes(sortOrder)) {
			throw error(400, 'Invalid sortOrder parameter');
		}

		// Validate pagination parameters
		if (limit < 1 || limit > 50) {
			throw error(400, 'Limit must be between 1 and 50');
		}

		if (offset < 0) {
			throw error(400, 'Offset must be non-negative');
		}

		const supabase = getSupabaseServer();

		// Build query for lobby feed - optimized for the lobby view
		let query = supabase
			.from('battles')
			.select(
				`
				id,
				status,
				mode,
				max_participants,
				current_participants,
				total_pot,
				entry_fee,
				rounds_count,
				created_at,
				case:cases(id, name, image_url, price),
				battle_cases:battle_cases(*, cases(*)),
				participants:battle_participants(
					id,
					user_id,
					position,
					joined_at,
					user:user_profiles(id, username, avatar_url)
				),
				creator:user_profiles!battles_created_by_fkey(id, username, avatar_url)
			`
			)
			.order(sortBy, { ascending: sortOrder === 'asc' })
			.range(offset, offset + limit - 1);

		// Filter by status if provided, otherwise show lobby-appropriate battles
		if (status) {
			query = query.eq('status', status);
		} else {
			// By default, show battles that are relevant to the lobby
			query = query.in('status', ['waiting', 'locking']);
		}

		// Filter by mode if provided
		if (mode) {
			query = query.eq('mode', mode);
		}

		const { data: battles, error: fetchError, count } = await query;

		if (fetchError) {
			console.error('Failed to fetch lobby feed:', fetchError);
			throw error(500, 'Failed to fetch lobby feed');
		}

		// Get current user if authenticated (for user-specific data like participation status)
		const currentUser = await getCurrentUser(cookies);

		// Enrich battles with additional data for the lobby
		const enrichedBattles = (battles || []).map((battle) => {
			// Calculate slots remaining
			const slotsRemaining = battle.max_participants - battle.current_participants;

			// Determine if current user can join
			let canJoin = false;
			let isParticipant = false;

			if (currentUser && battle.status === 'waiting') {
				isParticipant = battle.participants?.some((p) => p.user_id === currentUser.id) || false;
				canJoin = !isParticipant && slotsRemaining > 0;
			}

			// Calculate joinability time (e.g., battles created in last 10 minutes are highlighted)
			const createdTime = new Date(battle.created_at).getTime();
			const now = Date.now();
			const minutesAgo = (now - createdTime) / (1000 * 60);
			const isRecentlyCreated = minutesAgo <= 10;

			// Get case information
			const battleCase = !Array.isArray(battle.case)
				? battle.case
				: Array.isArray(battle.battle_cases) && battle.battle_cases.length > 0
					? battle.battle_cases[0]?.case
					: null;
			const caseName = battleCase?.name || 'Unknown Case';
			const caseImage = battleCase?.image_url;

			return {
				...battle,
				slotsRemaining,
				canJoin: canJoin || false,
				isParticipant: isParticipant || false,
				isRecentlyCreated,
				caseName,
				caseImage,
				// Simplified participants for lobby view
				participants: battle.participants?.slice(0, 4) || [], // Show max 4 participants in lobby
				// Remove heavy data for lobby feed
				battle_cases: undefined,
				creator:
					!Array.isArray(battle.creator) && battle.creator
						? {
								id: (battle.creator as any).id,
								username: (battle.creator as any).username,
								avatar_url: (battle.creator as any).avatar_url
							}
						: null
			};
		});

		// Get lobby statistics
		const { data: stats } = await supabase
			.from('battles')
			.select('status, mode')
			.in('status', ['waiting', 'locking', 'in_progress']);

		const lobbyStats = {
			totalWaiting: stats?.filter((b) => b.status === 'waiting').length || 0,
			totalActive: stats?.filter((b) => ['locking', 'in_progress'].includes(b.status)).length || 0,
			standardGames: stats?.filter((b) => b.mode === 'standard').length || 0,
			crazyGames: stats?.filter((b) => b.mode === 'crazy').length || 0
		};

		return json({
			battles: enrichedBattles,
			pagination: {
				limit,
				offset,
				total: count || 0,
				hasMore: (count || 0) > offset + limit
			},
			stats: lobbyStats,
			filters: {
				status: status || 'waiting,locking',
				mode,
				sortBy,
				sortOrder
			},
			currentUser: currentUser
				? {
						id: currentUser.id,
						steamId: currentUser.steamId
					}
				: null
		});
	} catch (err) {
		console.error('Lobby feed error:', err);

		if (err instanceof Error) {
			if (
				err.message.includes('Invalid status') ||
				err.message.includes('Invalid mode') ||
				err.message.includes('Invalid sortBy') ||
				err.message.includes('Invalid sortOrder') ||
				err.message.includes('Limit must be') ||
				err.message.includes('Offset must be')
			) {
				throw error(400, err.message);
			}
		}

		throw error(500, 'Failed to fetch lobby feed');
	}
};
