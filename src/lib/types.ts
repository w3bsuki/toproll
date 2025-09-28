export interface UserProfile {
	user_id: string;
	steam_id: string;
	username: string;
	avatar_url?: string;
	steam_profile_url?: string;
	total_wagered?: number;
	total_profit?: number;
	win_rate?: number;
	biggest_win?: number;
	case_battle_wins?: number;
	created_at?: string;
	updated_at?: string;
}

export interface CS2Item {
	assetid: string;
	classid: string;
	instanceid: string;
	name: string;
	market_name: string;
	icon_url: string;
	tradable: boolean;
	marketable: boolean;
	market_value: number;
	rarity: string;
	type: string;
	wear?: string;
}

export interface Case {
	id: string;
	name: string;
	description?: string;
	image_url?: string;
	price: number;
	item_count: number;
	created_at: string;
	updated_at: string;
}

export interface CaseItem {
	id: string;
	case_id: string;
	name: string;
	market_name: string;
	image_url: string;
	rarity: 'Common' | 'Uncommon' | 'Rare' | 'Epic' | 'Legendary' | 'Contraband';
	probability: number;
	market_value: number;
	created_at: string;
	// Optional additional metadata from CS2 API
	weapon_type?: string;
	category?: string;
	collection?: string;
	wear_condition?: 'Factory New' | 'Minimal Wear' | 'Field-Tested' | 'Well-Worn' | 'Battle-Scarred';
	description?: string;
	exterior?: string;
}

export interface CaseOpening {
	id: string;
	user_id: string;
	case_id: string;
	opened_item_id: string;
	cost: number;
	profit: number;
	created_at: string;
	case?: Case;
	item?: CaseItem;
}

export interface Battle {
	id: string;
	case_id: string;
	status: 'waiting' | 'active' | 'completed' | 'cancelled';
	max_participants: number;
	current_participants: number;
	total_pot: number;
	winner_id?: string;
	created_at: string;
	completed_at?: string;
	created_by: string;
	case?: Case;
	participants?: BattleParticipant[];
	results?: BattleResult[];
}

export interface BattleParticipant {
	id: string;
	battle_id: string;
	user_id: string;
	position: number;
	joined_at: string;
	user?: {
		id: string;
		username: string;
		avatar_url?: string;
	};
}

export interface BattleResult {
	id: string;
	battle_id: string;
	participant_id: string;
	item_id: string;
	created_at: string;
	participant?: BattleParticipant;
	item?: CaseItem;
}

export type CaseRarity = 'Common' | 'Uncommon' | 'Rare' | 'Epic' | 'Legendary' | 'Contraband';

export type CS2WeaponType =
	| 'AK-47'
	| 'M4A4'
	| 'M4A1-S'
	| 'AWP'
	| 'Desert Eagle'
	| 'Glock-18'
	| 'USP-S'
	| 'Galil AR'
	| 'FAMAS'
	| 'SSG 08'
	| 'SG 553'
	| 'AUG'
	| 'G3SG1'
	| 'SCAR-20'
	| 'P90'
	| 'MP9'
	| 'MAC-10'
	| 'UMP-45'
	| 'PP-Bizon'
	| 'MP5-SD'
	| 'MP7'
	| 'Nova'
	| 'XM1014'
	| 'Sawed-Off'
	| 'MAG-7'
	| 'M249'
	| 'Negev'
	| 'Five-SeveN'
	| 'Tec-9'
	| 'CZ75-Auto'
	| 'P250'
	| 'Dual Berettas'
	| 'R8 Revolver'
	| 'Karambit'
	| 'M9 Bayonet'
	| 'Bayonet'
	| 'Butterfly Knife'
	| 'Flip Knife'
	| 'Gut Knife'
	| 'Huntsman Knife'
	| 'Falchion Knife'
	| 'Bowie Knife'
	| 'Shadow Daggers'
	| 'Navaja Knife'
	| 'Stiletto Knife'
	| 'Talon Knife'
	| 'Ursus Knife'
	| 'Nomad Knife'
	| 'Paracord Knife'
	| 'Survival Knife'
	| 'Skeleton Knife'
	| 'Hand Wraps'
	| 'Specialist Gloves'
	| 'Driver Gloves'
	| 'Moto Gloves'
	| 'Hydra Gloves'
	| 'Bloodhound Gloves'
	| 'Sport Gloves'
	| 'Broken Fang Gloves';

export type CS2WearCondition =
	| 'Factory New'
	| 'Minimal Wear'
	| 'Field-Tested'
	| 'Well-Worn'
	| 'Battle-Scarred';

export type CS2Category =
	| 'Rifles'
	| 'Pistols'
	| 'SMGs'
	| 'Shotguns'
	| 'Sniper Rifles'
	| 'Machine Guns'
	| 'Knives'
	| 'Gloves';

export const RARITY_COLORS: Record<CaseRarity, string> = {
	Common: 'bg-gray-100 text-gray-800 border-gray-200',
	Uncommon: 'bg-green-100 text-green-800 border-green-200',
	Rare: 'bg-blue-100 text-blue-800 border-blue-200',
	Epic: 'bg-purple-100 text-purple-800 border-purple-200',
	Legendary: 'bg-orange-100 text-orange-800 border-orange-200',
	Contraband: 'bg-red-100 text-red-800 border-red-200'
};

export const RARITY_PROBABILITIES: Record<CaseRarity, number> = {
	Common: 60.0,
	Uncommon: 25.0,
	Rare: 10.0,
	Epic: 3.5,
	Legendary: 1.4,
	Contraband: 0.1
};

// Utility functions for CS2 skins
export const CS2Utils = {
	/**
	 * Check if a weapon is a knife
	 */
	isKnife(weaponType: string): boolean {
		const knifeTypes = [
			'Karambit',
			'M9 Bayonet',
			'Bayonet',
			'Butterfly Knife',
			'Flip Knife',
			'Gut Knife',
			'Huntsman Knife',
			'Falchion Knife',
			'Bowie Knife',
			'Shadow Daggers',
			'Navaja Knife',
			'Stiletto Knife',
			'Talon Knife',
			'Ursus Knife',
			'Nomad Knife',
			'Paracord Knife',
			'Survival Knife',
			'Skeleton Knife'
		];
		return knifeTypes.some((knife) => weaponType.includes(knife));
	},

	/**
	 * Check if a weapon is gloves
	 */
	isGloves(weaponType: string): boolean {
		return weaponType.includes('Gloves') || weaponType.includes('Hand Wraps');
	},

	/**
	 * Get category from weapon type
	 */
	getCategory(weaponType: string): CS2Category {
		if (this.isKnife(weaponType)) return 'Knives';
		if (this.isGloves(weaponType)) return 'Gloves';

		const rifles = ['AK-47', 'M4A4', 'M4A1-S', 'Galil AR', 'FAMAS', 'SG 553', 'AUG'];
		const snipers = ['AWP', 'SSG 08', 'G3SG1', 'SCAR-20'];
		const pistols = [
			'Desert Eagle',
			'Glock-18',
			'USP-S',
			'Five-SeveN',
			'Tec-9',
			'CZ75-Auto',
			'P250',
			'Dual Berettas',
			'R8 Revolver'
		];
		const smgs = ['P90', 'MP9', 'MAC-10', 'UMP-45', 'PP-Bizon', 'MP5-SD', 'MP7'];
		const shotguns = ['Nova', 'XM1014', 'Sawed-Off', 'MAG-7'];
		const mgs = ['M249', 'Negev'];

		if (rifles.includes(weaponType)) return 'Rifles';
		if (snipers.includes(weaponType)) return 'Sniper Rifles';
		if (pistols.includes(weaponType)) return 'Pistols';
		if (smgs.includes(weaponType)) return 'SMGs';
		if (shotguns.includes(weaponType)) return 'Shotguns';
		if (mgs.includes(weaponType)) return 'Machine Guns';

		return 'Rifles'; // Default fallback
	},

	/**
	 * Generate safe filename from skin name
	 */
	generateFilename(skinName: string): string {
		return (
			skinName
				.toLowerCase()
				.replace(/[★™]/g, '')
				.replace(/[^a-z0-9-]/g, '-')
				.replace(/-+/g, '-')
				.replace(/^-|-$/g, '') + '.png'
		);
	}
};
