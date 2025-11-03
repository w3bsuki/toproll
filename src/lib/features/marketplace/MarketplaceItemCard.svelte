<script lang="ts">
	import { Badge, Button, Card, CardContent } from '$lib/components/ui';
	import { Eye, Heart, ExternalLink, TrendingUp, TrendingDown, Star } from '@lucide/svelte';

	export interface MarketplaceItem {
		id: string;
		name: string;
		wear: string;
		rarity: string;
		price: number;
		image: string;
		category: string;
		weapon: string;
		statTrak: boolean;
		souvenir: boolean;
		float: number;
		pattern?: string;
		priceChange: number;
		volume: number;
		watching: number;
		likes: number;
	}

	export interface MarketplaceItemCardProps {
		item: MarketplaceItem;
		listView?: boolean;
		class?: string;
	}

	let { item, listView = false, class: className = '' }: MarketplaceItemCardProps = $props();

	const formatCurrency = (amount: number) => {
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: 'USD',
			minimumFractionDigits: 2,
			maximumFractionDigits: 2
		}).format(amount);
	};

	const getRarityColor = (rarity: string) => {
		switch (rarity.toLowerCase()) {
			case 'consumer':
				return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
			case 'industrial':
				return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
			case 'mil-spec':
				return 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30';
			case 'restricted':
				return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
			case 'classified':
				return 'bg-pink-500/20 text-pink-300 border-pink-500/30';
			case 'covert':
				return 'bg-red-500/20 text-red-300 border-red-500/30';
			case 'extraordinary':
				return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
			case 'contraband':
				return 'bg-orange-500/20 text-orange-300 border-orange-500/30';
			default:
				return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
		}
	};

	const getFloatColor = (float: number) => {
		if (float <= 0.07) return 'text-green-400';
		if (float <= 0.15) return 'text-blue-400';
		if (float <= 0.38) return 'text-purple-400';
		if (float <= 0.45) return 'text-pink-400';
		return 'text-red-400';
	};

	const isPositive = item.priceChange >= 0;
</script>

{#if listView}
	<!-- List View -->
	<Card
		class={`border-border/60 bg-surface/70 hover:border-border transition-all duration-200 ${className}`}
	>
		<CardContent class="p-4">
			<div class="flex items-center gap-4">
				<!-- Item Image -->
				<div
					class="border-border/60 relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg border"
				>
					<img src={item.image} alt={item.name} class="h-full w-full object-cover" />
					{#if item.statTrak}
						<div class="absolute top-1 left-1">
							<Badge
								class="border-orange-500/30 bg-orange-500/20 text-[10px] font-semibold text-orange-300"
							>
								StatTrak™
							</Badge>
						</div>
					{/if}
				</div>

				<!-- Item Info -->
				<div class="min-w-0 flex-1">
					<div class="flex items-start gap-2">
						<h3 class="text-foreground truncate font-semibold">{item.name}</h3>
						<Badge class={`text-xs font-semibold ${getRarityColor(item.rarity)} border`}>
							{item.rarity}
						</Badge>
					</div>
					<div class="text-muted-foreground mt-1 flex items-center gap-3 text-xs">
						<span>{item.weapon}</span>
						<span>•</span>
						<span>{item.wear}</span>
						{#if item.pattern}
							<span>•</span>
							<span>Pattern: {item.pattern}</span>
						{/if}
						<span>•</span>
						<span class={getFloatColor(item.float)}>Float: {item.float.toFixed(4)}</span>
					</div>
				</div>

				<!-- Price and Stats -->
				<div class="flex items-center gap-6">
					<div class="text-right">
						<p class="text-foreground text-lg font-semibold">{formatCurrency(item.price)}</p>
						<div class="flex items-center gap-1 text-xs">
							{#if isPositive}
								<TrendingUp class="text-success h-3 w-3" />
								<span class="text-success">+{item.priceChange}%</span>
							{:else}
								<TrendingDown class="text-destructive h-3 w-3" />
								<span class="text-destructive">{item.priceChange}%</span>
							{/if}
						</div>
					</div>

					<div class="text-muted-foreground flex items-center gap-3 text-xs">
						<div class="flex items-center gap-1">
							<Eye class="h-3 w-3" />
							<span>{item.watching}</span>
						</div>
						<div class="flex items-center gap-1">
							<Heart class="h-3 w-3" />
							<span>{item.likes}</span>
						</div>
						<div class="flex items-center gap-1">
							<Star class="h-3 w-3" />
							<span>{item.volume}</span>
						</div>
					</div>

					<!-- Actions -->
					<div class="flex items-center gap-2">
						<Button size="sm" variant="outline" class="gap-1">
							<ExternalLink class="h-3 w-3" />
							View
						</Button>
						<Button size="sm" class="gap-1">Buy</Button>
					</div>
				</div>
			</div>
		</CardContent>
	</Card>
{:else}
	<!-- Grid View -->
	<Card
		class={`border-border/60 bg-surface/70 hover:border-border overflow-hidden transition-all duration-200 ${className}`}
	>
		<div class="relative">
			<!-- Item Image -->
			<div class="relative aspect-[4/3] w-full overflow-hidden">
				<img src={item.image} alt={item.name} class="h-full w-full object-cover" />
				<div
					class="from-background/90 via-background/30 absolute inset-0 bg-gradient-to-t to-transparent"
				></div>

				<!-- Badges -->
				<div class="absolute top-3 left-3 flex flex-col gap-2">
					<Badge class={`text-xs font-semibold ${getRarityColor(item.rarity)} border`}>
						{item.rarity}
					</Badge>
					{#if item.statTrak}
						<Badge
							class="border-orange-500/30 bg-orange-500/20 text-xs font-semibold text-orange-300"
						>
							StatTrak™
						</Badge>
					{/if}
				</div>

				<!-- Price Change Badge -->
				<div class="absolute top-3 right-3">
					<Badge
						class={`text-xs font-semibold ${
							isPositive
								? 'border-success/30 bg-success/20 text-success'
								: 'border-destructive/30 bg-destructive/20 text-destructive'
						} border`}
					>
						{#if isPositive}
							<TrendingUp class="mr-1 inline h-3 w-3" />
						{:else}
							<TrendingDown class="mr-1 inline h-3 w-3" />
						{/if}
						{isPositive ? '+' : ''}{item.priceChange}%
					</Badge>
				</div>
			</div>

			<!-- Content -->
			<CardContent class="p-4">
				<div class="space-y-3">
					<!-- Title -->
					<div>
						<h3 class="text-foreground truncate font-semibold">{item.name}</h3>
						<p class="text-muted-foreground text-xs">{item.weapon} • {item.wear}</p>
						{#if item.pattern}
							<p class="text-muted-foreground text-xs">Pattern: {item.pattern}</p>
						{/if}
						<p class={`text-xs ${getFloatColor(item.float)}`}>Float: {item.float.toFixed(4)}</p>
					</div>

					<!-- Price -->
					<div class="flex items-center justify-between">
						<div>
							<p class="text-foreground text-xl font-bold">{formatCurrency(item.price)}</p>
							<p class="text-muted-foreground text-xs">24h volume: {item.volume}</p>
						</div>
					</div>

					<!-- Stats -->
					<div class="text-muted-foreground flex items-center justify-between text-xs">
						<div class="flex items-center gap-2">
							<div class="flex items-center gap-1">
								<Eye class="h-3 w-3" />
								<span>{item.watching}</span>
							</div>
							<div class="flex items-center gap-1">
								<Heart class="h-3 w-3" />
								<span>{item.likes}</span>
							</div>
						</div>
					</div>

					<!-- Actions -->
					<div class="flex gap-2 pt-2">
						<Button variant="outline" size="sm" class="flex-1 gap-1">
							<ExternalLink class="h-3 w-3" />
							View
						</Button>
						<Button size="sm" class="flex-1">Buy</Button>
					</div>
				</div>
			</CardContent>
		</div>
	</Card>
{/if}
