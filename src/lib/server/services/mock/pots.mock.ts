/**
 * Community Pots Mock Provider
 *
 * Provides mock community pots functionality for development and testing.
 * Simulates pot creation, joining, locking, and settlement with realistic data.
 */

import { withMockLatency, logApiCall } from '$lib/api/client';
import { globalPRNG, MOCK_USERS } from './seeds';
import type { Pot, PotEntry, PotDetails, CreatePotRequest } from '$lib/types/index';

// In-memory storage for mock pots
let mockPots: Pot[] = [];
let mockPotEntries: PotEntry[] = [];

// Initialize mock pots data
function initializeMockPots(): void {
	if (mockPots.length > 0) return; // Already initialized

	// Create sample pots in different states
	mockPots = [
		{
			id: 'pot_1',
			name: 'Weekend Warrior Pot',
			description: 'Join this pot for a chance to win amazing CS2 skins!',
			status: 'open',
			entry_cost: 10.0,
			max_tickets: 100,
			max_per_user: 10,
			total_tickets: 45,
			total_value: 450.0,
			fill_percent: 45,
			created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
			updated_at: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
			expires_at: new Date(Date.now() + 1000 * 60 * 60 * 4).toISOString()
		},
		{
			id: 'pot_2',
			name: 'High Roller Special',
			description: 'For the serious players - bigger entry, bigger prizes!',
			status: 'locked',
			entry_cost: 50.0,
			max_tickets: 50,
			max_per_user: 5,
			total_tickets: 50,
			total_value: 2500.0,
			fill_percent: 100,
			commit_hash: 'abc123def456',
			created_at: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
			updated_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
			expires_at: new Date(Date.now() + 1000 * 60 * 60 * 2).toISOString()
		},
		{
			id: 'pot_3',
			name: 'Quick Draw Pot',
			description: 'Fast-paced pot with quick turnover!',
			status: 'settled',
			entry_cost: 5.0,
			max_tickets: 200,
			max_per_user: 20,
			total_tickets: 200,
			total_value: 1000.0,
			fill_percent: 100,
			winner_user_id: MOCK_USERS[1].id,
			winner_ticket_index: 127,
			commit_hash: 'xyz789abc456',
			reveal_seed: 'seed123456789',
			created_at: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
			updated_at: new Date(Date.now() - 1000 * 60 * 60 * 1).toISOString(),
			settled_at: new Date(Date.now() - 1000 * 60 * 60 * 1).toISOString()
		},
		{
			id: 'pot_4',
			name: "Beginner's Luck",
			description: 'Perfect for newcomers - low entry cost!',
			status: 'open',
			entry_cost: 2.5,
			max_tickets: 500,
			max_per_user: 50,
			total_tickets: 125,
			total_value: 312.5,
			fill_percent: 25,
			created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
			updated_at: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
			expires_at: new Date(Date.now() + 1000 * 60 * 60 * 8).toISOString()
		}
	];

	// Create sample pot entries
	mockPotEntries = [
		{
			id: 'entry_1',
			pot_id: 'pot_1',
			user_id: MOCK_USERS[0].id,
			ticket_count: 5,
			ticket_start_index: 0,
			ticket_end_index: 4,
			credits_spent: 50.0,
			created_at: new Date(Date.now() - 1000 * 60 * 60 * 1).toISOString(),
				user: {
					id: MOCK_USERS[0].id,
				user_id: MOCK_USERS[0].id,
				steam_id: MOCK_USERS[0].steamId,
				username: MOCK_USERS[0].username,
				avatar_url: MOCK_USERS[0].avatarUrl,
				steam_profile_url: `https://steamcommunity.com/profiles/${MOCK_USERS[0].steamId}`,
				balance: MOCK_USERS[0].balance,
				total_wagered: 0,
				total_profit: 0,
				win_rate: 0,
				biggest_win: 0,
				case_battle_wins: 0,
				created_at: MOCK_USERS[0].createdAt,
				updated_at: new Date().toISOString(),
				last_seen: MOCK_USERS[0].lastSeen
			}
		},
		{
			id: 'entry_2',
			pot_id: 'pot_1',
			user_id: MOCK_USERS[1].id,
			ticket_count: 10,
			ticket_start_index: 5,
			ticket_end_index: 14,
			credits_spent: 100.0,
			created_at: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
			user: {
				user_id: MOCK_USERS[1].id,
				steam_id: MOCK_USERS[1].steamId,
				username: MOCK_USERS[1].username,
				avatar_url: MOCK_USERS[1].avatarUrl,
				steam_profile_url: `https://steamcommunity.com/profiles/${MOCK_USERS[1].steamId}`,
				balance: MOCK_USERS[1].balance,
				total_wagered: 0,
				total_profit: 0,
				win_rate: 0,
				biggest_win: 0,
				case_battle_wins: 0,
				created_at: MOCK_USERS[1].createdAt,
				updated_at: new Date().toISOString(),
				last_seen: MOCK_USERS[1].lastSeen
			}
		},
		{
			id: 'entry_3',
			pot_id: 'pot_2',
			user_id: MOCK_USERS[0].id,
			ticket_count: 5,
			ticket_start_index: 0,
			ticket_end_index: 4,
			credits_spent: 250.0,
			created_at: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
			user: {
				user_id: MOCK_USERS[0].id,
				steam_id: MOCK_USERS[0].steamId,
				username: MOCK_USERS[0].username,
				avatar_url: MOCK_USERS[0].avatarUrl,
				steam_profile_url: `https://steamcommunity.com/profiles/${MOCK_USERS[0].steamId}`,
				balance: MOCK_USERS[0].balance,
				total_wagered: 0,
				total_profit: 0,
				win_rate: 0,
				biggest_win: 0,
				case_battle_wins: 0,
				created_at: MOCK_USERS[0].createdAt,
				updated_at: new Date().toISOString(),
				last_seen: MOCK_USERS[0].lastSeen
			}
		},
		{
			id: 'entry_4',
			pot_id: 'pot_2',
			user_id: MOCK_USERS[1].id,
			ticket_count: 5,
			ticket_start_index: 5,
			ticket_end_index: 9,
			credits_spent: 250.0,
			created_at: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
			user: {
				user_id: MOCK_USERS[1].id,
				steam_id: MOCK_USERS[1].steamId,
				username: MOCK_USERS[1].username,
				avatar_url: MOCK_USERS[1].avatarUrl,
				steam_profile_url: `https://steamcommunity.com/profiles/${MOCK_USERS[1].steamId}`,
				balance: MOCK_USERS[1].balance,
				total_wagered: 0,
				total_profit: 0,
				win_rate: 0,
				biggest_win: 0,
				case_battle_wins: 0,
				created_at: MOCK_USERS[1].createdAt,
				updated_at: new Date().toISOString(),
				last_seen: MOCK_USERS[1].lastSeen
			}
		},
		{
			id: 'entry_5',
			pot_id: 'pot_3',
			user_id: MOCK_USERS[1].id,
			ticket_count: 20,
			ticket_start_index: 120,
			ticket_end_index: 139,
			credits_spent: 100.0,
			created_at: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
			user: {
				user_id: MOCK_USERS[1].id,
				steam_id: MOCK_USERS[1].steamId,
				username: MOCK_USERS[1].username,
				avatar_url: MOCK_USERS[1].avatarUrl,
				steam_profile_url: `https://steamcommunity.com/profiles/${MOCK_USERS[1].steamId}`,
				balance: MOCK_USERS[1].balance,
				total_wagered: 0,
				total_profit: 0,
				win_rate: 0,
				biggest_win: 0,
				case_battle_wins: 0,
				created_at: MOCK_USERS[1].createdAt,
				updated_at: new Date().toISOString(),
				last_seen: MOCK_USERS[1].lastSeen
			}
		}
	];
}

/**
 * Mock community pots provider
 */
export const pots = {
	/**
	 * List pots with optional filters
	 */
	async list(filters?: {
		status?: string[];
		min_value?: number;
		max_value?: number;
		limit?: number;
		offset?: number;
	}): Promise<Pot[]> {
		return withMockLatency(async () => {
			logApiCall('GET', '/pots', filters);

			initializeMockPots();

			let filteredPots = [...mockPots];

			// Apply status filter
			if (filters?.status && filters.status.length > 0) {
				filteredPots = filteredPots.filter((pot) => filters.status!.includes(pot.status));
			}

			// Apply value filters
			if (filters?.min_value !== undefined) {
				filteredPots = filteredPots.filter((pot) => pot.total_value >= filters.min_value!);
			}

			if (filters?.max_value !== undefined) {
				filteredPots = filteredPots.filter((pot) => pot.total_value <= filters.max_value!);
			}

			// Apply pagination
			if (filters?.offset !== undefined) {
				filteredPots = filteredPots.slice(filters.offset);
			}

			if (filters?.limit !== undefined) {
				filteredPots = filteredPots.slice(0, filters.limit);
			}

			// Sort by created_at (newest first)
			filteredPots.sort(
				(a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
			);

			return filteredPots;
		});
	},

	/**
	 * Get detailed pot information with entries
	 */
	async get(id: string): Promise<PotDetails> {
		return withMockLatency(async () => {
			logApiCall('GET', `/pots/${id}`);

			initializeMockPots();

			const pot = mockPots.find((p) => p.id === id);
			if (!pot) {
				throw new Error('Pot not found');
			}

			const entries = mockPotEntries.filter((entry) => entry.pot_id === id);

			// Find winner entry if settled
			let winnerEntry: PotEntry | undefined;
			if (pot.status === 'settled' && pot.winner_user_id) {
				winnerEntry = entries.find((entry) => entry.user_id === pot.winner_user_id);
			}

			return {
				pot,
				entries,
				user_entries: entries.filter((e) => e.user_id === MOCK_USERS[0].id),
				winner_entry: winnerEntry
			};
		});
	},

	/**
	 * Join a pot (user action)
	 */
	async join(id: string, { ticketCount }: { ticketCount: number }): Promise<PotDetails> {
		return withMockLatency(async () => {
			logApiCall('POST', `/pots/${id}/join`, { ticketCount });

			initializeMockPots();

			const pot = mockPots.find((p) => p.id === id);
			if (!pot) {
				throw new Error('Pot not found');
			}

			if (pot.status !== 'open') {
				throw new Error('Pot is not open for entries');
			}

			if (pot.total_tickets + ticketCount > pot.max_tickets) {
				throw new Error('Not enough tickets available');
			}

			// Create new entry (using first mock user for demo)
			const newEntry: PotEntry = {
				id: `entry_${Date.now()}`,
				pot_id: id,
				user_id: MOCK_USERS[0].id,
				ticket_count: ticketCount,
				ticket_start_index: pot.total_tickets,
				ticket_end_index: pot.total_tickets + ticketCount - 1,
				credits_spent: ticketCount * pot.entry_cost,
				created_at: new Date().toISOString(),
				user: {
					id: MOCK_USERS[0].id,
					user_id: MOCK_USERS[0].id,
					steam_id: MOCK_USERS[0].steamId,
					username: MOCK_USERS[0].username,
					avatar_url: MOCK_USERS[0].avatarUrl,
					steam_profile_url: `https://steamcommunity.com/profiles/${MOCK_USERS[0].steamId}`,
					balance: MOCK_USERS[0].balance,
					total_wagered: 0,
					total_profit: 0,
					created_at: MOCK_USERS[0].createdAt,
					updated_at: new Date().toISOString(),
					last_seen: MOCK_USERS[0].lastSeen
				}
			};

			// Update pot
			pot.total_tickets += ticketCount;
			pot.total_value += ticketCount * pot.entry_cost;
			pot.fill_percent = (pot.total_tickets / pot.max_tickets) * 100;
			pot.updated_at = new Date().toISOString();

			// Check if pot should be locked
			if (pot.total_tickets >= pot.max_tickets) {
				pot.status = 'locked';
				pot.commit_hash = `mock_hash_${Date.now()}`;
			}

			// Add entry
			mockPotEntries.push(newEntry);

			const entries = mockPotEntries.filter((entry) => entry.pot_id === id);

			return {
				pot,
				entries,
				user_entries: entries.filter((e) => e.user_id === MOCK_USERS[0].id)
			};
		});
	},

	/**
	 * Lock a pot (generate commit hash for provably fair)
	 */
	async lock(id: string): Promise<Pot> {
		return withMockLatency(async () => {
			logApiCall('POST', `/pots/${id}/lock`);

			initializeMockPots();

			const pot = mockPots.find((p) => p.id === id);
			if (!pot) {
				throw new Error('Pot not found');
			}

			if (pot.status !== 'open') {
				throw new Error('Pot cannot be locked');
			}

			pot.status = 'locked';
			pot.commit_hash = `mock_commit_${Date.now()}_${globalPRNG.next()}`;
			pot.updated_at = new Date().toISOString();

			return pot;
		});
	},

	/**
	 * Settle a pot (reveal winner)
	 */
	async settle(id: string): Promise<PotDetails> {
		return withMockLatency(async () => {
			logApiCall('POST', `/pots/${id}/settle`);

			initializeMockPots();

			const pot = mockPots.find((p) => p.id === id);
			if (!pot) {
				throw new Error('Pot not found');
			}

			if (pot.status !== 'locked') {
				throw new Error('Pot must be locked before settlement');
			}

			const entries = mockPotEntries.filter((entry) => entry.pot_id === id);
			if (entries.length === 0) {
				throw new Error('No entries found for pot');
			}

			// Select winner using deterministic PRNG
			const winnerIndex = globalPRNG.nextInt(0, pot.total_tickets - 1);
			let winnerEntry: PotEntry | undefined;

			for (const entry of entries) {
				if (winnerIndex >= entry.ticket_start_index && winnerIndex <= entry.ticket_end_index) {
					winnerEntry = entry;
					break;
				}
			}

			if (!winnerEntry) {
				throw new Error('Failed to determine winner');
			}

			// Update pot
			pot.status = 'settled';
			pot.winner_user_id = winnerEntry.user_id;
			pot.winner_ticket_index = winnerIndex;
			pot.reveal_seed = `mock_seed_${Date.now()}_${globalPRNG.next()}`;
			pot.settled_at = new Date().toISOString();
			pot.updated_at = new Date().toISOString();

			return {
				pot,
				entries,
				user_entries: entries.filter((e) => e.user_id === winnerEntry.user_id),
				winner_entry: winnerEntry
			};
		});
	},

	/**
	 * Create a new pot
	 */
	async create(params: CreatePotRequest): Promise<Pot> {
		return withMockLatency(async () => {
			logApiCall('POST', '/pots', params);

			initializeMockPots();

			const newPot: Pot = {
				id: `pot_${Date.now()}_${globalPRNG.next()}`,
				name: `Custom Pot ${mockPots.length + 1}`,
				description: 'User created community pot',
				status: 'open',
				entry_cost: params.entry_cost,
				max_tickets: params.max_tickets,
				max_per_user: params.max_per_user || 10,
				total_tickets: 0,
				total_value: 0,
				fill_percent: 0,
				created_at: new Date().toISOString(),
				updated_at: new Date().toISOString()
			};

			if (params.expires_in_minutes) {
				newPot.expires_at = new Date(
					Date.now() + params.expires_in_minutes * 60 * 1000
				).toISOString();
			}

			mockPots.push(newPot);

			return newPot;
		});
	}
};
