/**
 * Real Providers Index
 *
 * Exports all real providers for the API facade.
 * These providers make actual HTTP requests to the backend API.
 */

import { apiRequest, parseApiResponse, createPostRequest } from './helpers';
import type {
	CS2Item,
	MarketplaceListing,
	BattleDetails,
	UserProfile,
	Pot,
	PotDetails,
	BattleSummary
} from '$lib/types/index';

/**
 * Real authentication provider
 */
export const auth = {
	async getProfile(): Promise<UserProfile | null> {
		try {
			const response = await apiRequest('/api/auth/profile');
			const data = await parseApiResponse<{
				user: {
					id: string;
					email: string;
				};
				profile: UserProfile;
			}>(response);

			// Return a flattened profile object matching the expected interface
			return {
				user_id: data.user.id,
				steam_id: data.profile.steam_id,
				username: data.profile.username || data.user.email?.split('@')[0] || 'User',
				avatar_url: data.profile.avatar_url,
				steam_profile_url: data.profile.steam_profile_url,
				balance: data.profile.balance || 0,
				total_wagered: data.profile.total_wagered || 0,
				total_profit: data.profile.total_profit || 0,
				win_rate: data.profile.win_rate || 0,
				biggest_win: data.profile.biggest_win || 0,
				case_battle_wins: data.profile.case_battle_wins || 0,
				last_seen: data.profile.last_seen || new Date().toISOString(),
				created_at: data.profile.created_at || new Date().toISOString(),
				updated_at: data.profile.updated_at || new Date().toISOString()
			};
		} catch {
			return null;
		}
	},

	async devLogin() {
		// Real provider doesn't support dev login
		throw new Error('Dev login not available in real mode');
	},

	async logout() {
		const response = await apiRequest('/api/auth/steam/logout', createPostRequest({}));
		await parseApiResponse(response);
		return true;
	}
};

/**
 * Real pots provider
 */
export const pots = {
	async list(filters?: {
		status?: string[];
		min_value?: number;
		max_value?: number;
		limit?: number;
		offset?: number;
	}): Promise<Pot[]> {
		const params = new URLSearchParams();
		if (filters?.status) params.set('status', filters.status.join(','));
		if (filters?.min_value) params.set('min_value', filters.min_value.toString());
		if (filters?.max_value) params.set('max_value', filters.max_value.toString());
		if (filters?.limit) params.set('limit', filters.limit.toString());
		if (filters?.offset) params.set('offset', filters.offset.toString());

		const response = await apiRequest(`/api/pots?${params.toString()}`);
		return await parseApiResponse(response);
	},

	async get(id: string): Promise<PotDetails> {
		const response = await apiRequest(`/api/pots/${id}`);
		return await parseApiResponse(response);
	},

	async join(id: string, { ticketCount }: { ticketCount: number }) {
		const response = await apiRequest(
			`/api/pots/${id}/join`,
			createPostRequest({ ticket_count: ticketCount })
		);
		return await parseApiResponse(response);
	},

	async lock(id: string) {
		const response = await apiRequest(`/api/pots/${id}/lock`, createPostRequest({}));
		return await parseApiResponse(response);
	},

	async settle(id: string) {
		const response = await apiRequest(`/api/pots/${id}/settle`, createPostRequest({}));
		return await parseApiResponse(response);
	},

	async create(params: {
		entry_cost: number;
		max_tickets: number;
		max_per_user?: number;
		expires_in_minutes?: number;
	}) {
		const response = await apiRequest('/api/pots', createPostRequest(params));
		return await parseApiResponse(response);
	}
};

/**
 * Real marketplace provider
 */
export const marketplace = {
	async listInventory(): Promise<CS2Item[]> {
		const response = await apiRequest('/api/inventory');
		const data = await parseApiResponse<{
			inventory: CS2Item[];
			user: unknown;
		}>(response);
		return data.inventory;
	},

	async listListings(filters?: {
		search?: string;
		rarity?: string;
		minPrice?: number;
		maxPrice?: number;
		limit?: number;
		offset?: number;
	}): Promise<MarketplaceListing[]> {
		const params = new URLSearchParams();
		if (filters?.search) params.set('search', filters.search);
		if (filters?.rarity) params.set('rarity', filters.rarity);
		if (filters?.minPrice) params.set('minPrice', filters.minPrice.toString());
		if (filters?.maxPrice) params.set('maxPrice', filters.maxPrice.toString());
		if (filters?.limit) params.set('limit', filters.limit.toString());
		if (filters?.offset) params.set('offset', filters.offset.toString());

		const response = await apiRequest(`/api/marketplace?${params.toString()}`);
		const data = await parseApiResponse<{
			listings: MarketplaceListing[];
			pagination: unknown;
			currentUser: unknown;
		}>(response);
		return data.listings;
	},

	async createListing(itemId: string, price: number) {
		const response = await apiRequest(
			'/api/marketplace',
			createPostRequest({ inventory_id: itemId, price })
		);
		return await parseApiResponse(response);
	},

	async purchase(listingId: string): Promise<{ success: boolean }> {
		const response = await apiRequest(
			`/api/marketplace/${listingId}/purchase`,
			createPostRequest({})
		);
		return await parseApiResponse(response);
	},

	async syncInventory(steamId: string): Promise<{ success: boolean; itemsImported: number }> {
		const response = await apiRequest('/api/inventory/sync', createPostRequest({ steamId }));
		return await parseApiResponse(response);
	}
};

/**
 * Real battles provider
 */
export const battles = {
	async list(filters?: {
		status?: string;
		mode?: string;
		limit?: number;
		offset?: number;
	}): Promise<BattleSummary[]> {
		const params = new URLSearchParams();
		if (filters?.status) params.set('status', filters.status);
		if (filters?.mode) params.set('mode', filters.mode);
		if (filters?.limit) params.set('limit', filters.limit.toString());
		if (filters?.offset) params.set('offset', filters.offset.toString());

		const response = await apiRequest(`/api/battles?${params.toString()}`);
		const data = await parseApiResponse<{
			battles: BattleSummary[];
			pagination: unknown;
			currentUser: unknown;
		}>(response);
		return data.battles;
	},

	async get(id: string): Promise<BattleDetails> {
		const response = await apiRequest(`/api/battles/${id}`);
		const data = await parseApiResponse<{
			battle: BattleDetails;
			currentUser: unknown;
		}>(response);
		return data.battle;
	},

	async create(config: {
		case_ids: string[];
		mode: 'standard' | 'crazy';
		max_participants: 2 | 4;
	}) {
		const response = await apiRequest('/api/battles', createPostRequest(config));
		return await parseApiResponse(response);
	},

	async join(id: string) {
		const response = await apiRequest(`/api/battles/${id}/join`, createPostRequest({}));
		return await parseApiResponse(response);
	},

	async simulate(id: string) {
		const response = await apiRequest(`/api/battles/${id}/start`, createPostRequest({}));
		return await parseApiResponse(response);
	}
};

/**
 * Real inventory provider
 */
export const inventory = {
	async listInventory() {
		return marketplace.listInventory();
	},

	async syncInventory(steamId: string) {
		return marketplace.syncInventory(steamId);
	}
};
