import { createHash, randomBytes } from 'node:crypto';
import { getSupabaseServer } from '$lib/supabase/server';
import { updateUserBalance, getUserBalance } from './auth';
import type { Pot, PotEntry, PotDetails, CreatePotRequest, JoinPotRequest } from '$lib/types/index';

/**
 * Community Pots Service
 * Handles all pot-related operations including creation, joining, and settlement
 */
export class PotService {
	private supabase = getSupabaseServer();

	/**
	 * Create a new community pot
	 */
	async createPot(params: CreatePotRequest): Promise<Pot> {
		const { entry_cost, max_tickets, max_per_user = 10, expires_in_minutes } = params;

		// Validate input
		if (entry_cost <= 0) throw new Error('Entry cost must be positive');
		if (max_tickets <= 0) throw new Error('Max tickets must be positive');
		if (max_per_user <= 0) throw new Error('Max per user must be positive');

		// Calculate expires_at if provided
		let expires_at: Date | undefined;
		if (expires_in_minutes && expires_in_minutes > 0) {
			expires_at = new Date(Date.now() + expires_in_minutes * 60 * 1000);
		}

		const { data: pot, error } = await this.supabase
			.from('pots')
			.insert({
				entry_cost,
				max_tickets,
				max_per_user,
				expires_at: expires_at?.toISOString()
			})
			.select()
			.single();

		if (error) throw new Error(`Failed to create pot: ${error.message}`);

		// Add audit entry
		await this.addAuditLog(pot.id, 'pot_created', null, 'New pot created', {
			entry_cost,
			max_tickets,
			max_per_user,
			expires_at: expires_at?.toISOString()
		});

		// Emit realtime event
		await this.emitPotEvent(pot.id, 'pot_created', pot);

		return this.mapPotFromDb(pot);
	}

	/**
	 * List pots with optional filters
	 */
	async listPots(filters?: {
		status?: string[];
		min_value?: number;
		max_value?: number;
		limit?: number;
		offset?: number;
	}): Promise<Pot[]> {
		let query = this.supabase.from('pots').select('*').order('created_at', { ascending: false });

		// Apply filters
		if (filters?.status && filters.status.length > 0) {
			query = query.in('status', filters.status);
		}

		if (filters?.min_value) {
			query = query.gte('total_value', filters.min_value);
		}

		if (filters?.max_value) {
			query = query.lte('total_value', filters.max_value);
		}

		if (filters?.limit) {
			query = query.limit(filters.limit);
		}

		if (filters?.offset) {
			query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1);
		}

		const { data: pots, error } = await query;

		if (error) throw new Error(`Failed to fetch pots: ${error.message}`);

		return pots.map((pot) => this.mapPotFromDb(pot));
	}

	/**
	 * Get detailed pot information with entries
	 */
	async getPotDetails(potId: string, userId?: string): Promise<PotDetails> {
		// Get pot
		const { data: pot, error: potError } = await this.supabase
			.from('pots')
			.select('*')
			.eq('id', potId)
			.single();

		if (potError || !pot) throw new Error('Pot not found');

		// Get all entries for this pot with user data
		const { data: entries, error: entriesError } = await this.supabase
			.from('pot_entries')
			.select(
				`
				*,
				user:user_profiles(
					user_id,
					username,
					avatar_url
				)
			`
			)
			.eq('pot_id', potId)
			.order('created_at', { ascending: true });

		if (entriesError) throw new Error(`Failed to fetch entries: ${entriesError.message}`);

		// Get user-specific entries if userId provided
		let userEntries: PotEntry[] = [];
		if (userId) {
			userEntries = entries.filter((entry) => entry.user_id === userId);
		}

		// Find winner entry if settled
		let winnerEntry: PotEntry | undefined;
		if (pot.status === 'settled' && pot.winner_user_id) {
			winnerEntry = entries.find((entry) => entry.user_id === pot.winner_user_id);
		}

		return {
			pot: this.mapPotFromDb(pot),
			entries: entries.map((entry) => this.mapPotEntryFromDb(entry)),
			user_entries: userEntries.map((entry) => this.mapPotEntryFromDb(entry)),
			winner_entry: winnerEntry ? this.mapPotEntryFromDb(winnerEntry) : undefined
		};
	}

	/**
	 * Join a pot (user action)
	 */
	async joinPot(
		params: JoinPotRequest,
		userId: string,
		userAgent?: string,
		ip?: string
	): Promise<PotEntry> {
		const { pot_id, ticket_count } = params;

		// Validate input
		if (ticket_count <= 0) throw new Error('Ticket count must be positive');

		// Start a transaction-like operation
		return await this.supabase
			.rpc('join_pot_transaction', {
				p_pot_id: pot_id,
				p_user_id: userId,
				p_ticket_count: ticket_count,
				p_user_agent: userAgent,
				p_ip_address: ip
			})
			.then(async (result) => {
				if (result.error) {
					throw new Error(result.error.message);
				}

				// The function returns the created entry
				const entry = result.data as PotEntry;

				// Emit realtime event
				await this.emitPotEvent(pot_id, 'entry_added', {
					entry,
					new_total_tickets: entry.ticket_end_index + 1
				});

				return this.mapPotEntryFromDb(entry);
			});
	}

	/**
	 * Lock a pot (generate commit hash for provably fair)
	 */
	async lockPot(potId: string): Promise<{ commit_hash: string }> {
		// Generate server seed and hash
		const serverSeed = randomBytes(32).toString('hex');
		const commitHash = createHash('sha256').update(serverSeed).digest('hex');

		const { error } = await this.supabase
			.from('pots')
			.update({
				status: 'locked',
				commit_hash: commitHash
			})
			.eq('id', potId)
			.eq('status', 'open');

		if (error) throw new Error(`Failed to lock pot: ${error.message}`);

		// Add audit entry
		await this.addAuditLog(potId, 'pot_locked', null, 'Pot locked for settlement', {
			commit_hash: commitHash
		});

		// Emit realtime event
		await this.emitPotEvent(potId, 'pot_locked', { commit_hash: commitHash });

		return { commit_hash: commitHash };
	}

	/**
	 * Settle a pot (reveal winner)
	 */
	async settlePot(
		potId: string,
		revealSeed?: string
	): Promise<{
		winner_user_id: string;
		winner_ticket_index: number;
		winner_entry: PotEntry;
	}> {
		// Get pot details
		const { data: pot, error: potError } = await this.supabase
			.from('pots')
			.select('*')
			.eq('id', potId)
			.single();

		if (potError || !pot) throw new Error('Pot not found');

		if (pot.status !== 'locked') throw new Error('Pot must be locked before settlement');

		// Use provided seed or generate random one
		const finalSeed = revealSeed || randomBytes(32).toString('hex');

		// Get all entries to determine winner
		const { data: entries, error: entriesError } = await this.supabase
			.from('pot_entries')
			.select('*')
			.eq('pot_id', potId)
			.order('ticket_start_index', { ascending: true });

		if (entriesError) throw new Error(`Failed to fetch entries: ${entriesError.message}`);

		if (!entries || entries.length === 0) throw new Error('No entries found for pot');

		// Calculate winner using provably fair algorithm
		const { winnerIndex, winningEntry } = this.calculateWinner(pot, entries, finalSeed);

		// Update pot with winner
		const { error: updateError } = await this.supabase
			.from('pots')
			.update({
				status: 'settled',
				winner_user_id: winningEntry.user_id,
				winner_ticket_index: winnerIndex,
				reveal_seed: finalSeed,
				settled_at: new Date().toISOString()
			})
			.eq('id', potId);

		if (updateError) throw new Error(`Failed to settle pot: ${updateError.message}`);

		// Transfer credits to winner
		const transferResult = await updateUserBalance(winningEntry.user_id, pot.total_value, 'add');
		if (!transferResult.success) {
			console.error('Failed to transfer winnings to winner:', transferResult.error);
		}

		// Add audit entry
		await this.addAuditLog(potId, 'pot_settled', winningEntry.user_id, 'Pot settled with winner', {
			winner_user_id: winningEntry.user_id,
			winner_ticket_index: winnerIndex,
			reveal_seed: finalSeed,
			total_winnings: pot.total_value,
			transfer_success: transferResult.success
		});

		// Emit realtime event
		await this.emitPotEvent(potId, 'pot_settled', {
			winner_user_id: winningEntry.user_id,
			winner_ticket_index: winnerIndex,
			winner_entry: winningEntry,
			reveal_seed: finalSeed,
			total_winnings: pot.total_value
		});

		return {
			winner_user_id: winningEntry.user_id,
			winner_ticket_index: winnerIndex,
			winner_entry: this.mapPotEntryFromDb(winningEntry)
		};
	}

	/**
	 * Cancel a pot and refund all participants
	 */
	async cancelPot(potId: string, reason: string): Promise<void> {
		// Get pot and entries
		const { data: pot, error: potError } = await this.supabase
			.from('pots')
			.select('*')
			.eq('id', potId)
			.single();

		if (potError || !pot) throw new Error('Pot not found');

		if (pot.status === 'settled') throw new Error('Cannot settle a settled pot');

		// Get all entries for refunding
		const { data: entries, error: entriesError } = await this.supabase
			.from('pot_entries')
			.select('*')
			.eq('pot_id', potId);

		if (entriesError) throw new Error(`Failed to fetch entries: ${entriesError.message}`);

		// Refund all participants
		const refundPromises = entries.map(async (entry) => {
			const result = await updateUserBalance(entry.user_id, entry.credits_spent, 'add');
			return {
				user_id: entry.user_id,
				amount: entry.credits_spent,
				success: result.success
			};
		});

		const refundResults = await Promise.all(refundPromises);

		// Update pot status
		const { error: updateError } = await this.supabase
			.from('pots')
			.update({
				status: 'cancelled',
				settled_at: new Date().toISOString()
			})
			.eq('id', potId);

		if (updateError) throw new Error(`Failed to cancel pot: ${updateError.message}`);

		// Add audit entry
		await this.addAuditLog(potId, 'pot_cancelled', null, reason, {
			refunds: refundResults,
			total_refunded: entries.reduce((sum, entry) => sum + entry.credits_spent, 0)
		});

		// Emit realtime event
		await this.emitPotEvent(potId, 'pot_cancelled', {
			reason,
			refund_results: refundResults
		});
	}

	/**
	 * Get pot statistics
	 */
	async getPotStats(userId?: string): Promise<any> {
		const { data, error } = await this.supabase.rpc('get_pot_stats', {
			p_user_id: userId || null
		});

		if (error) throw new Error(`Failed to fetch pot stats: ${error.message}`);

		return data;
	}

	// Private helper methods

	private calculateWinner(
		pot: any,
		entries: any[],
		revealSeed: string
	): { winnerIndex: number; winningEntry: any } {
		// Verify commit hash matches reveal seed
		if (pot.commit_hash) {
			const expectedHash = createHash('sha256').update(revealSeed).digest('hex');
			if (expectedHash !== pot.commit_hash) {
				throw new Error('Invalid reveal seed - commit hash mismatch');
			}
		}

		// Create combined seed from server seed and pot data
		const combinedSeed = revealSeed + pot.id + pot.total_tickets.toString();
		const hash = createHash('sha256').update(combinedSeed).digest('hex');

		// Convert hash to number between 0 and total_tickets-1
		const hashNumber = parseInt(hash.substring(0, 8), 16);
		const winnerIndex = hashNumber % pot.total_tickets;

		// Find which entry contains the winning ticket
		let winningEntry: any = null;
		for (const entry of entries) {
			if (winnerIndex >= entry.ticket_start_index && winnerIndex <= entry.ticket_end_index) {
				winningEntry = entry;
				break;
			}
		}

		if (!winningEntry) {
			throw new Error('Failed to determine winner');
		}

		return { winnerIndex, winningEntry };
	}

	private async addAuditLog(
		potId: string,
		action: string,
		actorId: string | null,
		reason: string,
		metadata: any
	): Promise<void> {
		await this.supabase.from('pots_audit').insert({
			pot_id: potId,
			action,
			actor_id: actorId,
			reason,
			metadata
		});
	}

	private async emitPotEvent(potId: string, eventType: string, data: any): Promise<void> {
		// This would emit a realtime event via Supabase Realtime
		// Implementation depends on how you want to handle realtime events
		console.log(`Pot event: ${eventType} for pot ${potId}`, data);
	}

	private mapPotFromDb(dbPot: any): Pot {
		return {
			...dbPot,
			fill_percent: dbPot.max_tickets > 0 ? (dbPot.total_tickets / dbPot.max_tickets) * 100 : 0
		};
	}

	private mapPotEntryFromDb(dbEntry: any): PotEntry {
		return {
			...dbEntry,
			user: dbEntry.user || undefined
		};
	}
}

// Singleton instance
export const potService = new PotService();
