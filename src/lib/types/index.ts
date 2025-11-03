/**
 * Centralized Type Definitions
 *
 * Domain models that map closely to the Supabase schema and shared DTOs.
 * These help keep imports consistent across the app.
 */

// Battle summary/details (centralized, not from mocks)
export interface BattleDetails {
	battle: Battle;
	participants: BattleParticipant[];
	results?: BattleResult[];
}

export interface BattleSummary {
	id: UUID;
	case_id: UUID;
	status: BattleStatus;
	mode: BattleMode;
	max_participants: number;
	current_participants: number;
	total_pot: number;
	entry_fee: number;
	rounds_count: number;
	current_round: number;
	winner_id?: UUID | null;
	created_at: Timestamp;
	completed_at?: Timestamp | null;
	created_by: UUID;
	case?: Case | null;
	participants: BattleParticipant[];
}

export type {
	BattleCreationResult,
	BattleJoinResult
} from '../server/services/battleService';

export type { BattleState } from '../server/orchestrator/battles';
export type { BattleConnectionState } from '../realtime';
export type { PotConnectionState } from '../features/pots/pot-realtime';
export type { AuthUser } from '../server/services/auth';
export type { SteamUser } from '../server/services/steamAuth';

// Common primitives
export type UUID = string;
export type Timestamp = string;

// User profiles
export interface UserProfilePreview {
	id?: UUID;
	user_id?: UUID;
	steam_id?: string;
	username: string;
	avatar_url?: string | null;
	balance?: number;
	total_wagered?: number;
	total_profit?: number;
	win_rate?: number;
	biggest_win?: number;
	case_battle_wins?: number;
	steam_profile_url?: string | null;
	country?: string | null;
	created_at?: Timestamp;
	updated_at?: Timestamp;
	last_seen?: Timestamp | null;
}

export interface UserProfile extends UserProfilePreview {
	user_id: UUID;
	steam_id: string;
	balance: number;
	total_wagered: number;
	total_profit: number;
	win_rate: number;
	biggest_win: number;
	case_battle_wins: number;
	steam_profile_url?: string | null;
	country?: string | null;
	last_seen?: Timestamp | null;
	last_login_at?: Timestamp | null;
	session_token_hash?: string | null;
	session_expires_at?: Timestamp | null;
	created_at: Timestamp;
	updated_at: Timestamp;
}

// Cases & items
export type CaseRarity =
	| 'Common'
	| 'Uncommon'
	| 'Rare'
	| 'Epic'
	| 'Legendary'
	| 'Contraband'
	| 'Classified'
	| 'Covert'
	| string;

export interface Case {
	id: UUID;
	name: string;
	description?: string | null;
	image_url?: string | null;
	price: number;
	item_count: number;
	created_at: Timestamp;
	updated_at: Timestamp;
	items?: CaseItem[];
}

export interface CaseItem {
	id: UUID;
	case_id: UUID;
	name: string;
	market_name: string;
	image_url: string;
	rarity: CaseRarity;
	probability: number;
	market_value: number;
	created_at: Timestamp;
	updated_at?: Timestamp;
	type?: string | null;
	exterior?: string | null;
	wear?: string | null;
	description?: string | null;
}

export interface CaseOpening {
	id: UUID;
	user_id: UUID;
	case_id: UUID;
	opened_item_id: UUID;
	cost: number;
	profit: number;
	created_at: Timestamp;
	case?: Case;
	item?: CaseItem;
}

// Marketplace & inventory
export interface CS2Item {
	id?: UUID;
	user_id?: UUID;
	assetid: string;
	classid: string;
	instanceid: string;
	name: string;
	market_name: string;
	icon_url?: string | null;
	tradable: boolean;
	marketable: boolean;
	market_value: number;
	rarity: string;
	type?: string | null;
	wear?: string | null;
	exterior?: string | null;
	description?: string | null;
	acquired_at?: Timestamp;
	updated_at?: Timestamp;
}

export type MarketplaceListingStatus = 'active' | 'sold' | 'cancelled' | 'expired';

export interface MarketplaceListing {
	id: UUID;
	user_id: UUID;
	inventory_id: UUID;
	price: number;
	status: MarketplaceListingStatus;
	expires_at: Timestamp;
	created_at: Timestamp;
	updated_at: Timestamp;
	sold_at?: Timestamp | null;
	buyer_id?: UUID | null;
	inventory?: (CS2Item & {
		id?: UUID;
		user_id?: UUID;
		created_at?: Timestamp;
		updated_at?: Timestamp;
	}) | null;
	seller?: UserProfilePreview | null;
}

// Pots
export type PotStatus = 'open' | 'locked' | 'settling' | 'settled' | 'cancelled';

export interface Pot {
	id: UUID;
	name: string;
	description?: string | null;
	status: PotStatus;
	entry_cost: number;
	max_tickets: number;
	max_per_user: number;
	total_tickets: number;
	total_value: number;
	commit_hash?: string | null;
	reveal_seed?: string | null;
	winner_user_id?: UUID | null;
	winner_ticket_index?: number | null;
	fill_percent?: number | null;
	created_at: Timestamp;
	updated_at: Timestamp;
	expires_at?: Timestamp | null;
	settled_at?: Timestamp | null;
}

export interface PotEntry {
	id: UUID;
	pot_id: UUID;
	user_id: UUID;
	ticket_count: number;
	ticket_start_index: number;
	ticket_end_index: number;
	credits_spent: number;
	ip_hash?: string | null;
	device_hash?: string | null;
	created_at: Timestamp;
	user?: UserProfilePreview | null;
}

export interface PotDetails {
	pot: Pot;
	entries: PotEntry[];
	user_entries: PotEntry[];
	winner_entry?: PotEntry | null;
}

// Pots realtime events
export type PotEvent =
	| { type: 'pot_created'; pot_id: UUID; timestamp: Timestamp; data?: Record<string, unknown> }
	| { type: 'pot_updated'; pot_id: UUID; timestamp: Timestamp; data: Pot }
	| { type: 'entry_added'; pot_id: UUID; timestamp: Timestamp; data: { entry: PotEntry; new_total_value?: number } }
	| { type: 'pot_locked'; pot_id: UUID; timestamp: Timestamp; data: { commit_hash?: string } }
	| { type: 'pot_settling'; pot_id: UUID; timestamp: Timestamp; data?: Record<string, unknown> }
	| { type: 'pot_settled'; pot_id: UUID; timestamp: Timestamp; data: { winner_user_id: UUID; winner_ticket_index: number; winner_entry: PotEntry; reveal_seed?: string } }
	| { type: 'pot_cancelled'; pot_id: UUID; timestamp: Timestamp; data: { reason?: string } };

export interface CreatePotRequest {
	name?: string;
	description?: string;
	entry_cost: number;
	max_tickets: number;
	max_per_user?: number;
	expires_in_minutes?: number;
}

export interface JoinPotRequest {
	pot_id: UUID;
	ticket_count: number;
}

// Battles
export type BattleStatus =
	| 'waiting'
	| 'locking'
	| 'in_progress'
	| 'settling'
	| 'completed'
	| 'cancelled';

export type BattleMode = 'standard' | 'crazy';

export interface BattleCase {
	id: UUID;
	battle_id: UUID;
	case_id: UUID;
	order_index: number;
	created_at: Timestamp;
	case?: Case | null;
	cases?: Case | null;
}

export interface BattleParticipant {
	id: UUID;
	battle_id: UUID;
	user_id: UUID;
	position: number;
	joined_at: Timestamp;
	client_seed?: string | null;
	team?: string | null;
	user?: UserProfilePreview | null;
}

export interface BattleRound {
	id: UUID;
	battle_id: UUID;
	round_index: number;
	case_id: UUID;
	server_seed_hash: string;
	revealed_server_seed?: string | null;
	created_at: Timestamp;
	case?: Case | null;
	pulls?: BattlePull[];
}

export interface BattlePull {
	id: UUID;
	round_id: UUID;
	participant_id: UUID;
	item_id: UUID;
	client_seed: string;
	nonce: number;
	hash: string;
	mapped_roll: number;
	created_at: Timestamp;
	item?: CaseItem | null;
	participant?: BattleParticipant | null;
}

export interface BattleResult {
	id: UUID;
	battle_id: UUID;
	participant_id: UUID;
	item_id: UUID;
	total_value: number;
	is_winner: boolean;
	created_at: Timestamp;
	participant?: BattleParticipant | null;
	item?: CaseItem | null;
}

export interface Battle {
	id: UUID;
	case_id: UUID;
	status: BattleStatus;
	mode: BattleMode;
	max_participants: number;
	current_participants: number;
	total_pot: number;
	entry_fee: number;
	rounds_count: number;
	current_round: number;
	winner_id?: UUID | null;
	winner_participant_id?: UUID | null;
	commit_hash?: string | null;
	server_seed?: string | null;
	created_at: Timestamp;
	completed_at?: Timestamp | null;
	updated_at?: Timestamp | null;
	created_by: UUID;
	case?: Case | null;
	cases?: Case[];
	battle_cases?: BattleCase[];
	participants?: BattleParticipant[];
	rounds?: BattleRound[];
	results?: BattleResult[];
}

export interface CreateBattleRequest {
	case_ids: UUID[];
	mode: BattleMode;
	max_participants: 2 | 4;
	client_seed?: string;
}

export interface JoinBattleRequest {
	client_seed?: string;
}

// Battle configuration
export interface BattleConfig {
	max_battle_pot: number;
	max_daily_loss: number;
	max_daily_wager: number;
	case_markup_percentage: number;
	mode_rake_percentage: number;
}

// Realtime battle event payloads
export interface ParticipantJoinedData {
	participant_id: UUID;
	user_id: UUID;
	username: string;
	position: number;
	joined_at: Timestamp;
}

export interface BattleLockedData {
	participant_ids: UUID[];
	locked_at: Timestamp;
}

export interface RoundStartData {
	round_index: number;
	case_id: UUID;
	started_at: Timestamp;
}

export interface RoundPullData {
	participant_id: UUID;
	item: CaseItem;
	hash: string;
	nonce: number;
	client_seed: string;
	pulled_at: Timestamp;
}

export interface RoundResultData {
	round_index: number;
	pulls: RoundPullData[];
	subtotals: Record<UUID, number>;
	completed_at: Timestamp;
}

export interface BattleSettledData {
	winner_id?: UUID | null;
	winners?: UUID[];
	totals: Record<UUID, number>;
	tie_break?: { participant_id: UUID; won: boolean };
	settled_at: Timestamp;
}

export interface BattleCancelledData {
	reason: string;
	cancelled_at: Timestamp;
}

export type BattleEvent =
	| {
		 type: 'participant_joined';
		 battle_id: UUID;
		 timestamp: Timestamp;
		 data: ParticipantJoinedData;
	 }
	| {
		 type: 'battle_locked';
		 battle_id: UUID;
		 timestamp: Timestamp;
		 data: BattleLockedData;
	 }
	| {
		 type: 'round_start';
		 battle_id: UUID;
		 timestamp: Timestamp;
		 data: RoundStartData;
	 }
	| {
		 type: 'round_pull';
		 battle_id: UUID;
		 timestamp: Timestamp;
		 data: RoundPullData;
	 }
	| {
		 type: 'round_result';
		 battle_id: UUID;
		 timestamp: Timestamp;
		 data: RoundResultData;
	 }
	| {
		 type: 'battle_settled';
		 battle_id: UUID;
		 timestamp: Timestamp;
		 data: BattleSettledData;
	 }
	| {
		 type: 'battle_cancelled';
		 battle_id: UUID;
		 timestamp: Timestamp;
		 data: BattleCancelledData;
	 };

// Provably fair primitives
export interface ServerSeed {
	id?: UUID;
	seed: string;
	seed_hash: string;
	created_at: Timestamp;
	revealed_at?: Timestamp | null;
	is_active: boolean;
	battle_id?: UUID | null;
}

export interface ProvablyFairRoll {
	server_seed: string;
	client_seed: string;
	nonce: number;
	hash: string;
	roll: number;
	item_id: UUID;
	item?: CaseItem | null;
}
