import { env } from '$env/dynamic/private';
import type { CS2Item } from '$lib/types/index';

export interface SteamPlayerSummary {
	steamid: string;
	personaname: string;
	profileurl: string;
	avatar: string;
	avatarmedium: string;
	avatarfull: string;
	avatarhash: string;
	lastlogoff?: number;
	personastate: number;
	realname?: string;
	primaryclanid?: string;
	timecreated?: number;
	personastateflags?: number;
	loccountrycode?: string;
	locstatecode?: string;
	loccityid?: number;
}

export interface SteamInventoryItem {
	id: string;
	classid: string;
	instanceid: string;
	amount: string;
	pos: number;
}

export interface SteamInventoryResponse {
	success: boolean;
	rgInventory: Record<string, SteamInventoryItem>;
	rgCurrency: any[];
	rgDescriptions: Record<string, any>;
}

/**
 * Fetches player summary from Steam API
 */
export async function getPlayerSummary(steamId: string): Promise<SteamPlayerSummary> {
	if (!env.STEAM_API_KEY) {
		throw new Error('Steam API key not configured');
	}

	const url = `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${env.STEAM_API_KEY}&steamids=${steamId}`;

	const response = await fetch(url);

	if (!response.ok) {
		throw new Error(`Steam API error: ${response.status} ${response.statusText}`);
	}

	const data = await response.json();

	if (!data.response?.players?.[0]) {
		throw new Error('Player not found or profile is private');
	}

	return data.response.players[0] as SteamPlayerSummary;
}

/**
 * Fetches CS2 inventory from Steam API
 */
export async function getCS2Inventory(steamId: string): Promise<CS2Item[]> {
	if (!env.STEAM_API_KEY) {
		throw new Error('Steam API key not configured');
	}

	const url = `https://api.steampowered.com/IEconItems_730/GetPlayerItems/v0001/?key=${env.STEAM_API_KEY}&steamid=${steamId}`;

	const response = await fetch(url);

	if (!response.ok) {
		throw new Error(`Steam API error: ${response.status} ${response.statusText}`);
	}

	const data = await response.json();

	if (!data.result?.success) {
		throw new Error('Failed to fetch inventory');
	}

	// Check if inventory is private
	if (data.result.status === 15) {
		throw new Error('Inventory is private');
	}

	// Parse inventory items
	const items: CS2Item[] = [];

	if (data.result.items) {
		for (const item of data.result.items) {
			items.push({
				assetid: item.id.toString(),
				classid: item.classid.toString(),
				instanceid: item.instanceid?.toString() || '0',
				name: item.market_name || 'Unknown Item',
				market_name: item.market_name || 'Unknown Item',
				icon_url: item.icon_url || '',
				tradable: item.tradable !== false,
				marketable: item.marketable !== false,
				market_value: 0, // Would need additional API call to get market prices
				rarity: getRarityFromTags(item.tags),
				type: getTypeFromTags(item.tags),
				wear: getWearFromTags(item.tags)
			});
		}
	}

	return items;
}

/**
 * Helper function to determine rarity from item tags
 */
function getRarityFromTags(tags: any[]): string {
	const rarityTag = tags?.find((tag) => tag.category === 'Rarity');
	return rarityTag?.localized_tag_name || 'Unknown';
}

/**
 * Helper function to determine item type from tags
 */
function getTypeFromTags(tags: any[]): string {
	const typeTag = tags?.find((tag) => tag.category === 'Type');
	return typeTag?.localized_tag_name || 'Unknown';
}

/**
 * Helper function to determine wear condition from tags
 */
function getWearFromTags(tags: any[]): string | undefined {
	const wearTag = tags?.find((tag) => tag.category === 'Exterior');
	return wearTag?.localized_tag_name;
}

/**
 * Validates if a Steam inventory is public
 */
export async function isInventoryPublic(steamId: string): Promise<boolean> {
	try {
		await getCS2Inventory(steamId);
		return true;
	} catch (error) {
		if (error instanceof Error && error.message === 'Inventory is private') {
			return false;
		}
		throw error;
	}
}
