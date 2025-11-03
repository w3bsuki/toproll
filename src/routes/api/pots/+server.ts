import { json, error } from '@sveltejs/kit';
import { potService } from '$lib/server/services/potService';
import { requireAuth } from '$lib/server/services/auth';
import type { RequestHandler } from './$types';

// GET: List all pots with optional filters
export const GET: RequestHandler = async ({ url, locals }) => {
	try {
		// Parse query parameters
		const status = url.searchParams.get('status')?.split(',').filter(Boolean);
		const minValue = url.searchParams.get('min_value')
			? Number(url.searchParams.get('min_value'))
			: undefined;
		const maxValue = url.searchParams.get('max_value')
			? Number(url.searchParams.get('max_value'))
			: undefined;
		const limit = url.searchParams.get('limit') ? Number(url.searchParams.get('limit')) : undefined;
		const offset = url.searchParams.get('offset')
			? Number(url.searchParams.get('offset'))
			: undefined;

		const pots = await potService.listPots({
			status,
			min_value: minValue,
			max_value: maxValue,
			limit,
			offset
		});

		return json({ success: true, data: pots });
	} catch (err) {
		console.error('Error fetching pots:', err);
		return error(500, 'Failed to fetch pots');
	}
};

// POST: Create new pot (admin only for now)
export const POST: RequestHandler = async ({ request, locals }) => {
	try {
		// Check if user is authenticated (you might want admin check here)
		const cookieHeader = request.headers.get('cookie') || '';
		const cookies = {
			get: (name: string) => {
				const match = cookieHeader.match(new RegExp(`(^| )${name}=([^;]+)`));
				return match ? match[2] : null;
			}
		};
		const user = await requireAuth(cookies);

		const body = await request.json();
		const { entry_cost, max_tickets, max_per_user, expires_in_minutes } = body;

		// Validate input
		if (!entry_cost || !max_tickets) {
			return error(400, 'Missing required fields: entry_cost, max_tickets');
		}

		if (entry_cost <= 0 || max_tickets <= 0) {
			return error(400, 'Entry cost and max tickets must be positive');
		}

		const pot = await potService.createPot({
			entry_cost,
			max_tickets,
			max_per_user,
			expires_in_minutes
		});

		return json({ success: true, data: pot });
	} catch (err) {
		console.error('Error creating pot:', err);
		if (err instanceof Error && err.message.includes('Authentication required')) {
			return error(401, 'Authentication required');
		}
		return error(500, err instanceof Error ? err.message : 'Failed to create pot');
	}
};
