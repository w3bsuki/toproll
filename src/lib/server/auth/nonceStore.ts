/**
 * Shared nonce store for Steam OpenID CSRF protection
 * 
 * This is a simple in-memory store for development. In production,
 * you should use a persistent store like Redis or a database.
 */

export interface NonceData {
	timestamp: number;
	returnUrl?: string;
}

const nonces = new Map<string, NonceData>();
const NONCE_TTL = 5 * 60 * 1000; // 5 minutes

export function setNonce(nonce: string, data: NonceData): void {
	cleanupExpiredNonces();
	nonces.set(nonce, data);
}

export function getNonce(nonce: string): NonceData | undefined {
	cleanupExpiredNonces();
	return nonces.get(nonce);
}

export function deleteNonce(nonce: string): void {
	nonces.delete(nonce);
}

export function cleanupExpiredNonces(): void {
	const now = Date.now();
	for (const [key, value] of nonces.entries()) {
		if (now - value.timestamp > NONCE_TTL) {
			nonces.delete(key);
		}
	}
}
