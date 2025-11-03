import { getSupabaseServer } from '$lib/supabase/server';
import type { CS2Item, MarketplaceListing } from '$lib/types/index';

export interface SteamInventoryItem {
	assetid: string;
	classid: string;
	instanceid: string;
	amount: number;
	contextid: number;
	appid: number;
	name: string;
	market_name: string;
	market_hash_name: string;
	market_fee_app: number;
	market_fee_key: number;
	market_fee_market: number;
	market_fee: number;
	price: string;
	quantity: number;
	tradable: boolean;
	marketable: boolean;
	commodity: number;
	currency: string;
	description: string;
	icon_url: string;
	icon_url_large: string;
	type: string;
	tags: string[];
	tags_string: string;
	fraudwarnings: string;
	descriptions: {
		appid: number;
		type: string;
		value: string;
		color: string;
		app_name: string;
		app_icon: string;
	}[];
	owner_descriptions: {
		appid: number;
		type: string;
		value: string;
		color: string;
		app_name: string;
		app_icon: string;
	}[];
	actions: {
		name: string;
		link: string;
		bgcolor: string;
	}[];
	name_color: string;
	nameid: string;
	type_color: string;
	exterior: string;
	background_color: string;
}

export interface SteamInventoryResponse {
	success: boolean;
	error?: string;
	inventory?: {
		appid: number;
		steamid: string;
		total_inventory_count: number;
		total_unique_count: number;
		items: SteamInventoryItem[];
	};
}

export interface MarketPriceResponse {
	success: boolean;
	lowest_price?: number;
	volume?: number;
	market_hash_name?: string;
}

/**
 * Fetches a user's Steam inventory
 */
export async function getSteamInventory(
	steamId: string,
	appId: number = 730
): Promise<SteamInventoryResponse> {
	const apiKey = process.env.STEAM_WEB_API_KEY;
	if (!apiKey) {
		throw new Error('Steam Web API key not configured');
	}

	const url = `https://api.steampowered.com/ISteamEconomy/GetInventoryItems/v0001/?key=${apiKey}&steamid=${steamId}&appid=${appId}&count=5000&l=english`;

	try {
		const response = await fetch(url);
		if (!response.ok) {
			throw new Error(`Steam API request failed: ${response.statusText}`);
		}

		const data = await response.json();
		return data;
	} catch (error) {
		console.error('Error fetching Steam inventory:', error);
		return {
			success: false,
			error: error instanceof Error ? error.message : 'Unknown error'
		};
	}
}

/**
 * Fetches market price information for an item
 */
export async function getItemMarketPrice(
	hashName: string,
	appId: number = 730
): Promise<MarketPriceResponse> {
	const apiKey = process.env.STEAM_WEB_API_KEY;
	if (!apiKey) {
		throw new Error('Steam Web API key not configured');
	}

	const url = `https://api.steampowered.com/ISteamEconomy/GetMarketPrices/v0001/?key=${apiKey}&appid=${appId}&market_hash_name=${hashName}`;

	try {
		const response = await fetch(url);
		if (!response.ok) {
			throw new Error(`Steam API request failed: ${response.statusText}`);
		}

		const data = await response.json();
		return data;
	} catch (error) {
		console.error('Error fetching market price:', error);
		return {
			success: false
		};
	}
}

/**
 * Syncs a user's Steam inventory with our database
 */
export async function syncUserInventory(
	userId: string,
	steamId: string
): Promise<{ success: boolean; itemsImported: number; error?: string }> {
	const supabase = getSupabaseServer();

	try {
		// Get user's Steam inventory
		const inventoryData = await getSteamInventory(steamId);

		if (!inventoryData.success || !inventoryData.inventory) {
			return {
				success: false,
				itemsImported: 0,
				error: inventoryData.error || 'Failed to fetch inventory'
			};
		}

		const items = inventoryData.inventory.items;
		let itemsImported = 0;

		// Process each item in the inventory
		for (const item of items) {
			if (item.tradable && item.marketable) {
				// Get market price if available
				const priceData = await getItemMarketPrice(item.market_hash_name);
				const marketValue = priceData.lowest_price ? priceData.lowest_price : 0;

				// Map Steam item to our CS2Item format
				const cs2Item: CS2Item = {
					assetid: item.assetid,
					classid: item.classid,
					instanceid: item.instanceid,
					name: item.name,
					market_name: item.market_name,
					icon_url: item.icon_url,
					tradable: item.tradable,
					marketable: item.marketable,
					market_value: marketValue,
					rarity: determineRarityFromTags(item.tags),
					type: item.type,
					wear: item.exterior
				};

				// Upsert to user inventory
				const { error } = await supabase.from('user_inventory').upsert(
					{
						user_id: userId,
						asset_id: cs2Item.assetid,
						classid: cs2Item.classid,
						instanceid: cs2Item.instanceid,
						name: cs2Item.name,
						market_name: cs2Item.market_name,
						icon_url: cs2Item.icon_url,
						tradable: cs2Item.tradable,
						marketable: cs2Item.marketable,
						market_value: cs2Item.market_value,
						rarity: cs2Item.rarity,
						type: cs2Item.type,
						wear_condition: cs2Item.wear,
						description: item.description,
						updated_at: new Date().toISOString()
					},
					{
						onConflict: 'user_id,asset_id'
					}
				);

				if (error) {
					console.error('Error upserting inventory item:', error);
				} else {
					itemsImported++;
				}
			}
		}

		return {
			success: true,
			itemsImported
		};
	} catch (error) {
		console.error('Error syncing user inventory:', error);
		return {
			success: false,
			itemsImported: 0,
			error: error instanceof Error ? error.message : 'Unknown error'
		};
	}
}

/**
 * Determines rarity from Steam tags
 */
function determineRarityFromTags(tags: string[]): string {
	const tagString = tags.join(' ').toLowerCase();

	if (tagString.includes('contraband')) return 'Contraband';
	if (tagString.includes('legendary')) return 'Legendary';
	if (tagString.includes('epic')) return 'Epic';
	if (tagString.includes('rare')) return 'Rare';
	if (tagString.includes('uncommon')) return 'Uncommon';

	return 'Common';
}

/**
 * Gets a user's inventory from our database
 */
export async function getUserInventory(userId: string): Promise<CS2Item[]> {
	const supabase = getSupabaseServer();

	try {
		const { data, error } = await supabase
			.from('user_inventory')
			.select('*')
			.eq('user_id', userId)
			.order('market_value', { ascending: false });

		if (error) {
			throw new Error(`Failed to fetch inventory: ${error.message}`);
		}

		return data || [];
	} catch (error) {
		console.error('Error fetching user inventory:', error);
		return [];
	}
}

/**
 * Gets marketplace listings
 */
export async function getMarketplaceListings(
	limit: number = 20,
	offset: number = 0,
	minPrice?: number,
	maxPrice?: number,
	rarity?: string,
	search?: string
): Promise<MarketplaceListing[]> {
	const supabase = getSupabaseServer();

	try {
		let query = supabase
			.from('marketplace_listings')
			.select(
				`
				*,
				inventory:user_inventory(*),
				seller:user_profiles(id, username, avatar_url)
			`
			)
			.eq('status', 'active')
			.order('created_at', { ascending: false });

		// Apply filters
		if (minPrice) query = query.gte('price', minPrice);
		if (maxPrice) query = query.lte('price', maxPrice);
		if (rarity) query = query.ilike('inventory.rarity', `%${rarity}%`);
		if (search) query = query.ilike('inventory.name', `%${search}%`);

		// Apply pagination
		query = query.range(offset, offset + limit - 1);

		const { data, error } = await query;

		if (error) {
			throw new Error(`Failed to fetch marketplace listings: ${error.message}`);
		}

		return data || [];
	} catch (error) {
		console.error('Error fetching marketplace listings:', error);
		return [];
	}
}

/**
 * Creates a marketplace listing
 */
export async function createMarketplaceListing(
	userId: string,
	inventoryId: string,
	price: number,
	expiresInDays: number = 7
): Promise<{ success: boolean; error?: string; listingId?: string }> {
	const supabase = getSupabaseServer();

	try {
		// Check if user owns the inventory item
		const { data: itemData, error: itemError } = await supabase.rpc('user_owns_inventory_item', {
			p_user_id: userId,
			p_inventory_id: inventoryId
		});

		if (itemError || !itemData) {
			return {
				success: false,
				error: 'You do not own this item'
			};
		}

		// Create the listing
		const expiresAt = new Date();
		expiresAt.setDate(expiresAt.getDate() + expiresInDays);

		const { data, error } = await supabase
			.from('marketplace_listings')
			.insert({
				user_id: userId,
				inventory_id: inventoryId,
				price,
				expires_at: expiresAt.toISOString()
			})
			.select()
			.single();

		if (error) {
			throw new Error(`Failed to create listing: ${error.message}`);
		}

		return {
			success: true,
			listingId: data.id
		};
	} catch (error) {
		console.error('Error creating marketplace listing:', error);
		return {
			success: false,
			error: error instanceof Error ? error.message : 'Unknown error'
		};
	}
}

/**
 * Purchases an item from the marketplace
 */
export async function purchaseMarketplaceListing(
	userId: string,
	listingId: string
): Promise<{ success: boolean; error?: string }> {
	const supabase = getSupabaseServer();

	try {
		// Get listing details
		const { data: listing, error: listingError } = await supabase
			.from('marketplace_listings')
			.select(
				`
				*,
				inventory:user_inventory(*),
				seller:user_profiles(id, balance)
			`
			)
			.eq('id', listingId)
			.eq('status', 'active')
			.single();

		if (listingError || !listing) {
			return {
				success: false,
				error: 'Listing not found or no longer available'
			};
		}

		// Get buyer's balance
		const { data: buyer, error: buyerError } = await supabase
			.from('user_profiles')
			.select('balance')
			.eq('user_id', userId)
			.single();

		if (buyerError || !buyer) {
			return {
				success: false,
				error: 'User profile not found'
			};
		}

		// Check if buyer has sufficient balance
		if (buyer.balance < listing.price) {
			return {
				success: false,
				error: 'Insufficient balance'
			};
		}

		// Check if buyer is not the seller
		if (listing.user_id === userId) {
			return {
				success: false,
				error: 'Cannot purchase your own listing'
			};
		}

		// This would ideally be a database transaction, but for simplicity we'll do sequential operations

		// Deduct from buyer balance
		const { error: deductError } = await supabase
			.from('user_profiles')
			.update({ balance: buyer.balance - listing.price })
			.eq('user_id', userId);

		if (deductError) {
			return {
				success: false,
				error: 'Failed to process payment'
			};
		}

		// Add to seller balance
		const { error: addError } = await supabase
			.from('user_profiles')
			.update({ balance: listing.seller.balance + listing.price })
			.eq('user_id', listing.user_id);

		if (addError) {
			// Rollback buyer balance if seller update fails
			await supabase.from('user_profiles').update({ balance: buyer.balance }).eq('user_id', userId);

			return {
				success: false,
				error: 'Failed to process payment'
			};
		}

		// Transfer inventory ownership
		const { error: transferError } = await supabase
			.from('user_inventory')
			.update({ user_id: userId })
			.eq('id', listing.inventory_id);

		if (transferError) {
			// Rollback balance changes if transfer fails
			await supabase
				.from('user_profiles')
				.update({ balance: buyer.balance + listing.price })
				.eq('user_id', userId);

			await supabase
				.from('user_profiles')
				.update({ balance: listing.seller.balance - listing.price })
				.eq('user_id', listing.user_id);

			return {
				success: false,
				error: 'Failed to transfer item'
			};
		}

		// Mark listing as sold
		const { error: updateError } = await supabase
			.from('marketplace_listings')
			.update({
				status: 'sold',
				buyer_id: userId,
				sold_at: new Date().toISOString()
			})
			.eq('id', listingId);

		if (updateError) {
			console.error('Failed to update listing status:', updateError);
		}

		return {
			success: true
		};
	} catch (error) {
		console.error('Error purchasing marketplace item:', error);
		return {
			success: false,
			error: error instanceof Error ? error.message : 'Unknown error'
		};
	}
}
