<script lang="ts">
	import { Badge, Button, Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui';
	import { Input } from '$lib/components/ui/input';
	import { X, DollarSign, TrendingUp, TrendingDown } from '@lucide/svelte';

	export interface MarketplaceFiltersProps {
		class?: string;
	}

	let { class: className = '' }: MarketplaceFiltersProps = $props();

	let minPrice = $state('');
	let maxPrice = $state('');
	let minFloat = $state('');
	let maxFloat = $state('');
	let statTrakOnly = $state(false);
	let souvenirOnly = $state(false);
	let priceTrend = $state<'all' | 'gainers' | 'losers'>('all');

	const handleClearFilters = () => {
		minPrice = '';
		maxPrice = '';
		minFloat = '';
		maxFloat = '';
		statTrakOnly = false;
		souvenirOnly = false;
		priceTrend = 'all';
	};

	const hasActiveFilters = $derived(
		minPrice ||
			maxPrice ||
			minFloat ||
			maxFloat ||
			statTrakOnly ||
			souvenirOnly ||
			priceTrend !== 'all'
	);
</script>

<Card class={`border-border/60 bg-surface/70 ${className}`}>
	<CardHeader class="pb-4">
		<div class="flex items-center justify-between">
			<CardTitle class="text-lg">Advanced Filters</CardTitle>
			{#if hasActiveFilters}
				<Button variant="ghost" size="sm" onclick={handleClearFilters} class="gap-1 text-xs">
					<X class="h-3 w-3" />
					Clear All
				</Button>
			{/if}
		</div>
	</CardHeader>
	<CardContent class="space-y-6">
		<!-- Price Range -->
		<div class="space-y-3">
			<h4 class="text-foreground flex items-center gap-2 font-medium">
				<DollarSign class="h-4 w-4" />
				Price Range
			</h4>
			<div class="grid grid-cols-2 gap-3">
				<div>
					<label for="min-price" class="text-muted-foreground text-xs">Min Price</label>
					<Input
						id="min-price"
						type="number"
						placeholder="0.00"
						bind:value={minPrice}
						class="mt-1"
					/>
				</div>
				<div>
					<label for="max-price" class="text-muted-foreground text-xs">Max Price</label>
					<Input
						id="max-price"
						type="number"
						placeholder="10000.00"
						bind:value={maxPrice}
						class="mt-1"
					/>
				</div>
			</div>
		</div>

		<!-- Float Range -->
		<div class="space-y-3">
			<h4 class="text-foreground font-medium">Float Condition</h4>
			<div class="grid grid-cols-2 gap-3">
				<div>
					<label for="min-float" class="text-muted-foreground text-xs">Min Float</label>
					<Input
						id="min-float"
						type="number"
						placeholder="0.0000"
						step="0.0001"
						min="0"
						max="1"
						bind:value={minFloat}
						class="mt-1"
					/>
				</div>
				<div>
					<label for="max-float" class="text-muted-foreground text-xs">Max Float</label>
					<Input
						id="max-float"
						type="number"
						placeholder="1.0000"
						step="0.0001"
						min="0"
						max="1"
						bind:value={maxFloat}
						class="mt-1"
					/>
				</div>
			</div>
			<div class="mt-2 flex flex-wrap gap-2">
				<Badge variant="outline" class="hover:bg-surface-muted cursor-pointer">
					Factory New (0.00-0.07)
				</Badge>
				<Badge variant="outline" class="hover:bg-surface-muted cursor-pointer">
					Minimal Wear (0.07-0.15)
				</Badge>
				<Badge variant="outline" class="hover:bg-surface-muted cursor-pointer">
					Field-Tested (0.15-0.38)
				</Badge>
				<Badge variant="outline" class="hover:bg-surface-muted cursor-pointer">
					Well-Worn (0.38-0.45)
				</Badge>
				<Badge variant="outline" class="hover:bg-surface-muted cursor-pointer">
					Battle-Scarred (0.45-1.00)
				</Badge>
			</div>
		</div>

		<!-- Special Items -->
		<div class="space-y-3">
			<h4 class="text-foreground font-medium">Special Items</h4>
			<div class="space-y-2">
				<label class="flex cursor-pointer items-center gap-3">
					<input
						type="checkbox"
						bind:checked={statTrakOnly}
						class="border-border/60 bg-surface-muted rounded"
					/>
					<span class="text-sm">StatTrak™ Items Only</span>
				</label>
				<label class="flex cursor-pointer items-center gap-3">
					<input
						type="checkbox"
						bind:checked={souvenirOnly}
						class="border-border/60 bg-surface-muted rounded"
					/>
					<span class="text-sm">Souvenir Items Only</span>
				</label>
			</div>
		</div>

		<!-- Price Trend -->
		<div class="space-y-3">
			<h4 class="text-foreground font-medium">Price Trend (24h)</h4>
			<div class="flex flex-wrap gap-2">
				<Button
					variant={priceTrend === 'all' ? 'default' : 'outline'}
					size="sm"
					onclick={() => (priceTrend = 'all')}
					class="gap-1"
				>
					All Items
				</Button>
				<Button
					variant={priceTrend === 'gainers' ? 'default' : 'outline'}
					size="sm"
					onclick={() => (priceTrend = 'gainers')}
					class="text-success gap-1"
				>
					<TrendingUp class="h-3 w-3" />
					Gainers
				</Button>
				<Button
					variant={priceTrend === 'losers' ? 'default' : 'outline'}
					size="sm"
					onclick={() => (priceTrend = 'losers')}
					class="text-destructive gap-1"
				>
					<TrendingDown class="h-3 w-3" />
					Losers
				</Button>
			</div>
		</div>

		<!-- Apply Filters Button -->
		<div class="border-border/40 border-t pt-4">
			<Button class="w-full">Apply Filters</Button>
		</div>
	</CardContent>
</Card>
