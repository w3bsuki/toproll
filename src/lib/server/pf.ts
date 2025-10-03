import crypto from 'crypto';

export interface PFCommit {
	serverSeed: string;
	serverSeedHash: string;
}

export function commitServerSeed(serverSeed?: string): PFCommit {
	const seed = serverSeed ?? crypto.randomBytes(32).toString('hex');
	const serverSeedHash = crypto.createHash('sha256').update(seed).digest('hex');
	return { serverSeed: seed, serverSeedHash };
}

export function hmac(serverSeed: string, message: string): string {
	return crypto.createHmac('sha256', serverSeed).update(message).digest('hex');
}

// Convert the first 8 bytes of the hex hash to a float in [0,1)
export function hashToUnitInterval(hexHash: string): number {
	const first8 = hexHash.slice(0, 16); // 8 bytes = 16 hex chars
	const value = BigInt('0x' + first8);
	const denom = BigInt('0x1' + '0'.repeat(16)); // 2^(8*8) as hex (~1<<64)
	// Use Number for simplicity (sufficient precision for mapping buckets)
	return Number(value) / Number(denom);
}

export interface ProbabilityItem {
	id: string;
	probability: number; // percentage, sums to 100
}

export function mapRollToItem(roll01: number, items: ProbabilityItem[]): string {
	let acc = 0;
	for (const it of items) {
		acc += it.probability / 100.0;
		if (roll01 < acc) return it.id;
	}
	// floating point edge case: return last item
	return items[items.length - 1]?.id;
}

// Additional battle-specific PF functions
export interface RollResult {
	item_id: string;
	hash: string;
	roll: number; // 0-1 normalized
	nonce: number;
	clientSeed: string;
}

export function generateClientSeed(): string {
	return crypto.randomBytes(32).toString('hex');
}

export function shouldRotateSeed(lastRotation: Date, rotationHours: number = 24): boolean {
	const now = new Date();
	const hoursSinceRotation = (now.getTime() - lastRotation.getTime()) / (1000 * 60 * 60);
	return hoursSinceRotation >= rotationHours;
}

export function generateRoll(
	serverSeed: string,
	clientSeed: string,
	nonce: number,
	globalRoundId: string,
	items: ProbabilityItem[]
): RollResult {
	const message = `${clientSeed}:${globalRoundId}:${nonce}`;
	const hash = hmac(serverSeed, message);
	const roll = hashToUnitInterval(hash);
	const item_id = mapRollToItem(roll, items);

	return {
		item_id,
		hash,
		roll,
		nonce,
		clientSeed
	};
}

export function verifyRoll(
	serverSeed: string,
	clientSeed: string,
	nonce: number,
	globalRoundId: string,
	expectedHash: string,
	expectedItemId: string,
	items: ProbabilityItem[]
): boolean {
	const message = `${clientSeed}:${globalRoundId}:${nonce}`;
	const computedHash = hmac(serverSeed, message);

	if (computedHash !== expectedHash) {
		return false;
	}

	const roll = hashToUnitInterval(computedHash);
	const computedItemId = mapRollToItem(roll, items);

	return computedItemId === expectedItemId;
}
