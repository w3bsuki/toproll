/**
 * Balance Transfer Service
 *
 * Provides atomic balance operations for credits/coins in the system.
 * All operations are designed to be safe and prevent race conditions.
 */

import { getSupabaseServer } from '$lib/supabase/server';

interface BalanceTransaction {
	id: string;
	user_id: string;
	type: 'credit' | 'debit' | 'transfer_in' | 'transfer_out';
	amount: number;
	description: string;
	related_user_id?: string;
	related_entity_type?: string;
	related_entity_id?: string;
	created_at: string;
}

/**
 * Transfer balance from one user to another atomically
 */
export async function transferBalance(
	fromUserId: string,
	toUserId: string,
	amount: number
): Promise<{ success: boolean; error?: string; newFromBalance?: number; newToBalance?: number }> {
	if (amount <= 0) {
		return { success: false, error: 'Amount must be positive' };
	}

	if (fromUserId === toUserId) {
		return { success: false, error: 'Cannot transfer to same user' };
	}

	const supabase = getSupabaseServer();

	try {
		// Use a database function for atomic transfer
		const { data, error } = await supabase.rpc('transfer_balance', {
			p_from_user_id: fromUserId,
			p_to_user_id: toUserId,
			p_amount: amount
		});

		if (error) {
			console.error('Transfer balance error:', error);
			return { success: false, error: error.message };
		}

		return {
			success: true,
			newFromBalance: data?.new_from_balance,
			newToBalance: data?.new_to_balance
		};
	} catch (err) {
		console.error('Unexpected transfer error:', err);
		return { success: false, error: 'Transfer failed' };
	}
}

/**
 * Deduct balance from a user account
 */
export async function deductBalance(
	userId: string,
	amount: number
): Promise<{ success: boolean; error?: string; newBalance?: number }> {
	if (amount <= 0) {
		return { success: false, error: 'Amount must be positive' };
	}

	const supabase = getSupabaseServer();

	try {
		// Use a database function for atomic deduction
		const { data, error } = await supabase.rpc('deduct_balance', {
			p_user_id: userId,
			p_amount: amount
		});

		if (error) {
			console.error('Deduct balance error:', error);
			return { success: false, error: error.message };
		}

		return {
			success: true,
			newBalance: data?.new_balance
		};
	} catch (err) {
		console.error('Unexpected deduct error:', err);
		return { success: false, error: 'Deduction failed' };
	}
}

/**
 * Add balance to a user account
 */
export async function addBalance(
	userId: string,
	amount: number
): Promise<{ success: boolean; error?: string; newBalance?: number }> {
	if (amount <= 0) {
		return { success: false, error: 'Amount must be positive' };
	}

	const supabase = getSupabaseServer();

	try {
		// Use a database function for atomic addition
		const { data, error } = await supabase.rpc('add_balance', {
			p_user_id: userId,
			p_amount: amount
		});

		if (error) {
			console.error('Add balance error:', error);
			return { success: false, error: error.message };
		}

		return {
			success: true,
			newBalance: data?.new_balance
		};
	} catch (err) {
		console.error('Unexpected add error:', err);
		return { success: false, error: 'Addition failed' };
	}
}

/**
 * Get user's current balance
 */
export async function getBalance(userId: string): Promise<number> {
	const supabase = getSupabaseServer();

	try {
		const { data, error } = await supabase
			.from('user_profiles')
			.select('balance')
			.eq('user_id', userId)
			.single();

		if (error) {
			console.error('Get balance error:', error);
			return 0;
		}

		return Number(data?.balance) || 0;
	} catch (err) {
		console.error('Unexpected get balance error:', err);
		return 0;
	}
}

/**
 * Check if user has sufficient balance
 */
export async function hasSufficientBalance(
	userId: string,
	requiredAmount: number
): Promise<boolean> {
	const balance = await getBalance(userId);
	return balance >= requiredAmount;
}

/**
 * Create balance transaction record
 */
export async function createBalanceTransaction(
	userId: string,
	type: 'credit' | 'debit' | 'transfer_in' | 'transfer_out',
	amount: number,
	description: string,
	relatedUserId?: string,
	relatedEntityType?: string,
	relatedEntityId?: string
): Promise<{ success: boolean; error?: string; transactionId?: string }> {
	const supabase = getSupabaseServer();

	try {
		const { data, error } = await supabase
			.from('balance_transactions')
			.insert({
				user_id: userId,
				type,
				amount,
				description,
				related_user_id: relatedUserId,
				related_entity_type: relatedEntityType,
				related_entity_id: relatedEntityId
			})
			.select('id')
			.single();

		if (error) {
			console.error('Create transaction error:', error);
			return { success: false, error: error.message };
		}

		return {
			success: true,
			transactionId: data.id
		};
	} catch (err) {
		console.error('Unexpected create transaction error:', err);
		return { success: false, error: 'Transaction creation failed' };
	}
}

/**
 * Get user's balance transaction history
 */
export async function getBalanceHistory(
	userId: string,
	limit: number = 50,
	offset: number = 0
): Promise<{ transactions: BalanceTransaction[]; error?: string }> {
	const supabase = getSupabaseServer();

	try {
		const { data, error } = await supabase
			.from('balance_transactions')
			.select('*')
			.eq('user_id', userId)
			.order('created_at', { ascending: false })
			.range(offset, offset + limit - 1);

		if (error) {
			console.error('Get balance history error:', error);
			return { transactions: [], error: error.message };
		}

		return { transactions: data || [] };
	} catch (err) {
		console.error('Unexpected get balance history error:', err);
		return { transactions: [], error: 'Failed to fetch history' };
	}
}
