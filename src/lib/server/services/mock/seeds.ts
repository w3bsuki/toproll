/**
 * Mock Data Seeds and Deterministic PRNG
 *
 * This file provides deterministic random number generation for mock data
 * to ensure reproducible test scenarios across page reloads.
 */

import { MOCK_SEED } from '$lib/config/index';

/**
 * Seeded Pseudo-Random Number Generator
 * Generates deterministic random numbers based on a seed string
 */
export class SeededPRNG {
	private seed: number;

	constructor(seed: string = MOCK_SEED) {
		this.seed = this.hashString(seed);
	}

	/**
	 * Generate next random number between 0 and 1
	 */
	next(): number {
		this.seed = (this.seed * 9301 + 49297) % 233280;
		return this.seed / 233280;
	}

	/**
	 * Generate random integer between min and max (inclusive)
	 */
	nextInt(min: number, max: number): number {
		return Math.floor(this.next() * (max - min + 1)) + min;
	}

	/**
	 * Generate random float between min and max
	 */
	nextFloat(min: number, max: number): number {
		return this.next() * (max - min) + min;
	}

	/**
	 * Pick random element from array
	 */
	nextChoice<T>(array: T[]): T {
		return array[this.nextInt(0, array.length - 1)];
	}

	/**
	 * Pick random subset of array
	 */
	nextSample<T>(array: T[], count: number): T[] {
		const shuffled = [...array].sort(() => this.next() - 0.5);
		return shuffled.slice(0, Math.min(count, array.length));
	}

	/**
	 * Generate random boolean with given probability
	 */
	nextBool(probability: number = 0.5): boolean {
		return this.next() < probability;
	}

	/**
	 * Hash string to seed value
	 */
	private hashString(str: string): number {
		let hash = 0;
		for (let i = 0; i < str.length; i++) {
			const char = str.charCodeAt(i);
			hash = (hash << 5) - hash + char;
			hash = hash & hash; // Convert to 32-bit integer
		}
		return Math.abs(hash);
	}

	/**
	 * Create new PRNG with different seed
	 */
	fork(seed: string): SeededPRNG {
		return new SeededPRNG(`${this.seed}-${seed}`);
	}
}

// Global PRNG instance
export const globalPRNG = new SeededPRNG();

/**
 * Mock user data seeds
 */
export const MOCK_USERS = [
	{
		id: 'user_1',
		steamId: '76561198000000001',
		username: 'ProGamer2025',
		avatarUrl: 'https://avatars.steamstatic.com/fef49e7fa7e1997310d705b2a6153ff104d1793d_full.jpg',
		balance: 1250.75,
		lastSeen: new Date(Date.now() - 1000 * 60 * 15).toISOString(), // 15 minutes ago
		createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString() // 30 days ago
	},
	{
		id: 'user_2',
		steamId: '76561198000000002',
		username: 'SkinCollector',
		avatarUrl: 'https://avatars.steamstatic.com/8d9fb5c84e532a4b8d1b4b5e5e5e5e5e5e5e5e5e_full.jpg',
		balance: 3420.0,
		lastSeen: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // 5 minutes ago
		createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 60).toISOString() // 60 days ago
	},
	{
		id: 'user_3',
		steamId: '76561198000000003',
		username: 'CaseOpener',
		avatarUrl: 'https://avatars.steamstatic.com/1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t_full.jpg',
		balance: 875.5,
		lastSeen: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
		createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15).toISOString() // 15 days ago
	}
];

/**
 * Mock CS2 skin data
 */
export const MOCK_CS2_SKINS = [
	{
		assetid: 'asset_1',
		classid: 'class_1',
		instanceid: 'instance_1',
		name: 'AK-47 | Redline',
		market_name: 'AK-47 | Redline (Field-Tested)',
		icon_url: '/static/images/skins/ak-47-redline-field-tested.png',
		tradable: true,
		marketable: true,
		market_value: 285.5,
		rarity: 'Restricted',
		type: 'Rifle',
		wear: 'Field-Tested'
	},
	{
		assetid: 'asset_2',
		classid: 'class_2',
		instanceid: 'instance_2',
		name: 'AWP | Dragon Lore',
		market_name: 'AWP | Dragon Lore (Minimal Wear)',
		icon_url: '/static/images/skins/awp-dragon-lore.png',
		tradable: true,
		marketable: true,
		market_value: 12500.0,
		rarity: 'Legendary',
		type: 'Sniper Rifle',
		wear: 'Minimal Wear'
	},
	{
		assetid: 'asset_3',
		classid: 'class_3',
		instanceid: 'instance_3',
		name: 'Karambit | Fade',
		market_name: 'Karambit | Fade (Factory New)',
		icon_url: '/static/images/skins/karambit-fade.png',
		tradable: true,
		marketable: true,
		market_value: 8500.0,
		rarity: 'Contraband',
		type: 'Knife',
		wear: 'Factory New'
	},
	{
		assetid: 'asset_4',
		classid: 'class_4',
		instanceid: 'instance_4',
		name: 'M4A4 | Howl',
		market_name: 'M4A4 | Howl (Minimal Wear)',
		icon_url: '/static/images/skins/m4a4-howl.png',
		tradable: true,
		marketable: true,
		market_value: 6200.0,
		rarity: 'Contraband',
		type: 'Rifle',
		wear: 'Minimal Wear'
	},
	{
		assetid: 'asset_5',
		classid: 'class_5',
		instanceid: 'instance_5',
		name: 'Glock-18 | Fade',
		market_name: 'Glock-18 | Fade (Factory New)',
		icon_url: '/static/images/skins/glock-fade.png',
		tradable: true,
		marketable: true,
		market_value: 650.0,
		rarity: 'Classified',
		type: 'Pistol',
		wear: 'Factory New'
	}
];

/**
 * Mock case data
 */
export const MOCK_CASES = [
	{
		id: 'case_1',
		name: 'Fracture Case',
		description: 'Contains 17 community-designed weapon finishes',
		image_url: '/static/images/cases/fracture-case.png',
		price: 15.99,
		item_count: 17,
		created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString()
	},
	{
		id: 'case_2',
		name: 'Prisma 2 Case',
		description: 'Contains 17 weapon finishes from the Prisma 2 Collection',
		image_url: '/static/images/cases/prisma-2-case.png',
		price: 12.99,
		item_count: 17,
		created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14).toISOString()
	},
	{
		id: 'case_3',
		name: 'Dreams & Nightmares Case',
		description: 'Contains 17 weapon finishes from the Dreams & Nightmares Collection',
		image_url: '/static/images/cases/dreams-nightmares-case.png',
		price: 18.99,
		item_count: 17,
		created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString()
	}
];
