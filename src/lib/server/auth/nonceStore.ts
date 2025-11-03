/**
 * Database-backed nonce store for Steam OpenID CSRF protection
 * 
 * Uses Supabase to persist nonces across serverless function invocations
 */

import { getSupabaseServer } from '$lib/supabase/server';

export interface NonceData {
	timestamp: number;
	returnUrl?: string;
}

const NONCE_TTL_MINUTES = 5;

export async function setNonce(nonce: string, data: NonceData): Promise<void> {
	const supabase = getSupabaseServer();
	const expiresAt = new Date(Date.now() + NONCE_TTL_MINUTES * 60 * 1000);

	const { error } = await supabase.from('auth_nonces').insert({
		nonce,
		return_url: data.returnUrl,
		expires_at: expiresAt.toISOString()
	});

	if (error) {
		console.error('Failed to store nonce:', error);
		throw new Error('Failed to store authentication nonce');
	}

	// Cleanup expired nonces periodically (fire and forget)
	cleanupExpiredNonces().catch(console.error);
}

export async function getNonce(nonce: string): Promise<NonceData | undefined> {
	const supabase = getSupabaseServer();

	const { data, error } = await supabase
		.from('auth_nonces')
		.select('return_url, created_at')
		.eq('nonce', nonce)
		.gte('expires_at', new Date().toISOString())
		.maybeSingle();

	if (error) {
		console.error('Failed to retrieve nonce:', error);
		return undefined;
	}

	if (!data) {
		return undefined;
	}

	return {
		timestamp: new Date(data.created_at).getTime(),
		returnUrl: data.return_url || undefined
	};
}

export async function deleteNonce(nonce: string): Promise<void> {
	const supabase = getSupabaseServer();

	const { error } = await supabase.from('auth_nonces').delete().eq('nonce', nonce);

	if (error) {
		console.error('Failed to delete nonce:', error);
	}
}

async function cleanupExpiredNonces(): Promise<void> {
	const supabase = getSupabaseServer();

	const { error } = await supabase.rpc('cleanup_expired_nonces');

	if (error) {
		console.error('Failed to cleanup expired nonces:', error);
	}
}
