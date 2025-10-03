import { createClient } from '@supabase/supabase-js';

interface MarketValueSnapshot {
	item_id: string;
	market_value: number;
	updated_at: string;
}

interface PriceClampingResult {
	fair_value: number;
	raw_value: number;
	was_clamped: boolean;
	clamping_method: 'median_mad' | 'none';
}

interface PriceHistory {
	item_id: string;
	values: number[];
	timestamps: string[];
}

/**
 * Pricing Service with rolling median/MAD clamping
 *
 * This service provides fair market values for CS2 items with volatility protection.
 * It implements rolling median + Median Absolute Deviation (MAD) clamping to
 * prevent extreme price swings from affecting battle outcomes.
 */
class PricingService {
	private supabase = createClient(
		process.env.SUPABASE_URL!,
		process.env.SUPABASE_SERVICE_ROLE_KEY!
	);

	// In-memory cache for price history (Redis would be better for production)
	private priceHistoryCache = new Map<string, PriceHistory>();

	// Configuration for price clamping
	private readonly PRICE_HISTORY_WINDOW = 24; // hours
	private readonly MAD_THRESHOLD = 3.0; // Standard deviations for outlier detection
	private readonly MAX_PRICE_DEVIATION = 0.5; // 50% max deviation from median
	private readonly MIN_HISTORY_POINTS = 5; // Minimum points for MAD calculation

	/**
	 * Get fair market value for an item with clamping
	 *
	 * @param itemId The ID of the case item
	 * @returns Promise<PriceClampingResult> Fair value with clamping metadata
	 */
	async getFairValue(itemId: string): Promise<PriceClampingResult> {
		try {
			// Get current market value from database
			const { data: item, error } = await this.supabase
				.from('case_items')
				.select('market_value, updated_at')
				.eq('id', itemId)
				.single();

			if (error || !item) {
				console.error(`Failed to fetch market value for item ${itemId}:`, error);
				return {
					fair_value: 0,
					raw_value: 0,
					was_clamped: false,
					clamping_method: 'none'
				};
			}

			const rawValue = Number(item.market_value);

			// Get price history for clamping
			const priceHistory = await this.getPriceHistory(itemId);

			// Apply rolling median/MAD clamping if we have enough data
			if (priceHistory.values.length >= this.MIN_HISTORY_POINTS) {
				const clampedValue = this.applyMedianMADClamping(rawValue, priceHistory);
				return clampedValue;
			}

			// If insufficient history, return raw value
			return {
				fair_value: rawValue,
				raw_value: rawValue,
				was_clamped: false,
				clamping_method: 'none'
			};
		} catch (error) {
			console.error(`Error in getFairValue for item ${itemId}:`, error);
			return {
				fair_value: 0,
				raw_value: 0,
				was_clamped: false,
				clamping_method: 'none'
			};
		}
	}

	/**
	 * Get price history for an item over the configured window
	 */
	private async getPriceHistory(itemId: string): Promise<PriceHistory> {
		// Check cache first
		const cached = this.priceHistoryCache.get(itemId);
		if (cached && this.isCacheValid(cached)) {
			return cached;
		}

		try {
			// Get historical price data from the last 24 hours
			const cutoffTime = new Date(Date.now() - this.PRICE_HISTORY_WINDOW * 60 * 60 * 1000);

			const { data, error } = await this.supabase
				.from('case_items')
				.select('market_value, updated_at')
				.eq('id', itemId)
				.gte('updated_at', cutoffTime.toISOString())
				.order('updated_at', { ascending: true });

			if (error || !data || data.length === 0) {
				return { item_id: itemId, values: [], timestamps: [] };
			}

			const history: PriceHistory = {
				item_id: itemId,
				values: data.map((d) => Number(d.market_value)),
				timestamps: data.map((d) => d.updated_at)
			};

			// Update cache
			this.priceHistoryCache.set(itemId, history);

			return history;
		} catch (error) {
			console.error(`Error fetching price history for item ${itemId}:`, error);
			return { item_id: itemId, values: [], timestamps: [] };
		}
	}

	/**
	 * Apply rolling median + MAD clamping to detect and handle outliers
	 */
	private applyMedianMADClamping(rawValue: number, history: PriceHistory): PriceClampingResult {
		const values = history.values;
		const median = this.calculateMedian(values);
		const mad = this.calculateMAD(values, median);

		// Calculate acceptable range using MAD (robust outlier detection)
		const madThreshold = mad * this.MAD_THRESHOLD;
		const lowerBound = median - madThreshold;
		const upperBound = median + madThreshold;

		// Also apply maximum deviation limit
		const maxDeviation = median * this.MAX_PRICE_DEVIATION;
		const finalLowerBound = Math.max(lowerBound, median - maxDeviation);
		const finalUpperBound = Math.min(upperBound, median + maxDeviation);

		let fairValue = rawValue;
		let wasClamped = false;

		// Clamp value if it's outside acceptable range
		if (rawValue < finalLowerBound) {
			fairValue = finalLowerBound;
			wasClamped = true;
		} else if (rawValue > finalUpperBound) {
			fairValue = finalUpperBound;
			wasClamped = true;
		}

		// Log significant clamping events for monitoring
		if (wasClamped && Math.abs(rawValue - fairValue) / median > 0.1) {
			console.warn(`Price clamping applied for item:`, {
				item_id: history.item_id,
				raw_value: rawValue,
				fair_value: fairValue,
				median: median,
				mad: mad,
				deviation_percent: (((rawValue - fairValue) / median) * 100).toFixed(2)
			});
		}

		return {
			fair_value: fairValue,
			raw_value: rawValue,
			was_clamped: wasClamped,
			clamping_method: 'median_mad'
		};
	}

	/**
	 * Calculate median of an array of numbers
	 */
	private calculateMedian(values: number[]): number {
		const sorted = [...values].sort((a, b) => a - b);
		const mid = Math.floor(sorted.length / 2);

		if (sorted.length % 2 === 0) {
			return (sorted[mid - 1] + sorted[mid]) / 2;
		} else {
			return sorted[mid];
		}
	}

	/**
	 * Calculate Median Absolute Deviation (MAD)
	 */
	private calculateMAD(values: number[], median: number): number {
		const deviations = values.map((value) => Math.abs(value - median));
		return this.calculateMedian(deviations);
	}

	/**
	 * Check if cached data is still valid
	 */
	private isCacheValid(history: PriceHistory): boolean {
		if (history.timestamps.length === 0) return false;

		const latestTimestamp = new Date(history.timestamps[history.timestamps.length - 1]);
		const cacheAge = Date.now() - latestTimestamp.getTime();
		const maxCacheAge = 60 * 60 * 1000; // 1 hour

		return cacheAge < maxCacheAge;
	}

	/**
	 * Get batch fair values for multiple items
	 */
	async getBatchFairValues(itemIds: string[]): Promise<Map<string, PriceClampingResult>> {
		const results = new Map<string, PriceClampingResult>();

		// Process items in parallel for better performance
		const promises = itemIds.map(async (itemId) => {
			const result = await this.getFairValue(itemId);
			return { itemId, result };
		});

		const settledResults = await Promise.allSettled(promises);

		settledResults.forEach((promiseResult, index) => {
			const itemId = itemIds[index];

			if (promiseResult.status === 'fulfilled') {
				results.set(itemId, promiseResult.value.result);
			} else {
				console.error(`Failed to get fair value for item ${itemId}:`, promiseResult.reason);
				results.set(itemId, {
					fair_value: 0,
					raw_value: 0,
					was_clamped: false,
					clamping_method: 'none'
				});
			}
		});

		return results;
	}

	/**
	 * Force refresh price history for an item
	 */
	async refreshPriceHistory(itemId: string): Promise<void> {
		this.priceHistoryCache.delete(itemId);
		await this.getPriceHistory(itemId);
	}

	/**
	 * Get pricing statistics for monitoring
	 */
	async getPricingStats(): Promise<{
		total_items: number;
		clamped_items: number;
		avg_deviation: number;
	}> {
		// This would typically query a summary table or aggregate data
		// For now, return basic stats
		return {
			total_items: this.priceHistoryCache.size,
			clamped_items: 0, // Would need to track this properly
			avg_deviation: 0
		};
	}
}

// Export singleton instance
const pricingService = new PricingService();

// Export individual functions for backward compatibility
export async function getFairValue(itemId: string): Promise<number> {
	const result = await pricingService.getFairValue(itemId);
	return result.fair_value;
}

export async function getFairValueWithMetadata(itemId: string): Promise<PriceClampingResult> {
	return await pricingService.getFairValue(itemId);
}

export async function getBatchFairValues(
	itemIds: string[]
): Promise<Map<string, PriceClampingResult>> {
	return await pricingService.getBatchFairValues(itemIds);
}

export { pricingService };
export type { PriceClampingResult, PriceHistory, MarketValueSnapshot };
