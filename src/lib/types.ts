export interface UserProfile {
	user_id: string;
	steam_id: string;
	username: string;
        avatar_url?: string;
        steam_profile_url?: string;
        country?: string | null;
	total_wagered?: number;
	total_profit?: number;
	win_rate?: number;
	biggest_win?: number;
	case_battle_wins?: number;
	created_at?: string;
	updated_at?: string;
	session_token_hash?: string | null;
	session_expires_at?: string | null;
	last_login_at?: string | null;
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
	status: 'waiting' | 'locking' | 'in_progress' | 'settling' | 'completed' | 'cancelled';
	mode: 'standard' | 'crazy'; // standard = highest wins, crazy = lowest wins
	max_participants: number;
	current_participants: number;
	total_pot: number;
	entry_fee: number;
	rounds_count: number;
	current_round: number;
	winner_id?: string;
	created_at: string;
	completed_at?: string;
	created_by: string;
	case?: Case;
	participants?: BattleParticipant[];
	results?: BattleResult[];
	cases?: BattleCase[];
	rounds?: BattleRound[];
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
	total_value: number;
	is_winner: boolean;
	tie_break_wins?: boolean;
	created_at: string;
	participant?: BattleParticipant;
	item?: CaseItem;
}

export interface BattleCase {
	id: string;
	battle_id: string;
	case_id: string;
	order_index: number;
	created_at: string;
	case?: Case;
}

export interface BattleRound {
  id: string;
  battle_id: string;
  round_index: number;
  case_id: string;
  server_seed_hash: string;
  revealed_server_seed?: string;
  created_at: string;
}

export interface BattlePull {
  id: string;
  round_id: string;
  participant_id: string;
  item_id: string;
  client_seed: string;
  nonce: number;
  hash: string;
  mapped_roll: number;
  created_at: string;
  item?: CaseItem;
  participant?: BattleParticipant;
}

// Provably Fair types
export interface ServerSeed {
  seed: string;
  seed_hash: string;
  created_at: string;
  revealed_at?: string;
  is_active: boolean;
}

export interface ProvablyFairRoll {
  server_seed: string;
  client_seed: string;
  nonce: number;
  hash: string;
  roll: number;
  item_id: string;
}

// Battle creation types
export interface CreateBattleRequest {
  case_ids: string[];
  mode: 'standard' | 'crazy';
  max_participants: 2 | 4; // 1v1 or 2v2 for MVP
}

export interface JoinBattleRequest {
  battle_id: string;
  client_seed?: string; // optional, will generate if not provided
}

// WebSocket event types
export interface BattleEvent {
  type: 'participant_joined' | 'participant_left' | 'battle_locked' | 'round_start' | 'round_pull' | 'round_result' | 'battle_settled';
  battle_id: string;
  data: any;
  timestamp: string;
}

export interface RoundStartEvent {
  type: 'round_start';
  round_index: number;
  case_id: string;
}

export interface RoundPullEvent {
  type: 'round_pull';
  participant_id: string;
  item: CaseItem;
  hash: string;
  nonce: number;
  client_seed: string;
}

export interface RoundResultEvent {
  type: 'round_result';
  round_index: number;
  pulls: RoundPullEvent[];
  subtotals: { [participant_id: string]: number };
}

export interface BattleSettledEvent {
  type: 'battle_settled';
  winner_id?: string;
  winners?: string[]; // for team battles
  totals: { [participant_id: string]: number };
  tie_break?: {
    participant_id: string;
    won: boolean;
  };
}

// Game configuration
export interface BattleConfig {
  max_battle_pot: number;
  max_daily_loss: number;
  max_daily_wager: number;
  case_markup_percentage: number;
  mode_rake_percentage: number;
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
	Common: 'bg-surface-muted text-surface-muted-foreground border-border/70',
	Uncommon: 'bg-secondary/20 text-secondary-foreground border-secondary/60',
	Rare: 'bg-primary/15 text-primary border-primary/50',
	Epic: 'bg-accent/20 text-accent-foreground border-accent/50',
	Legendary: 'bg-warning/20 text-warning-foreground border-warning/55',
	Contraband: 'bg-destructive/20 text-destructive-foreground border-destructive/60'
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
