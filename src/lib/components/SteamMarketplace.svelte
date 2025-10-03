<script lang="ts">
	import { Badge, Button, Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui';
	import { ExternalLink, TrendingUp, TrendingDown, Eye, ShoppingCart, Filter, Search, Grid, List } from '@lucide/svelte';

	export interface MarketItem {
		id: string;
		name: string;
		iconUrl: string;
		marketPrice: number;
		volume: number;
		priceChange: number;
		priceChangePercent: number;
		rarity: string;
		type: string;
		wear?: string;
		tradable: boolean;
		marketable: boolean;
		popularity: number;
		marketHashName: string;
	}

	export interface SteamMarketplaceProps {
		items: MarketItem[];
		loading?: boolean;
		error?: string;
		searchTerm?: string;
		selectedRarity?: string;
		selectedType?: string;
		sortBy?: 'price' | 'volume' | 'change' | 'popularity';
		sortOrder?: 'asc' | 'desc';
		viewMode?: 'grid' | 'list';
		onSearch?: (term: string) => void;
		onFilterRarity?: (rarity: string) => void;
		onFilterType?: (type: string) => void;
		onSort?: (sortBy: string, order: string) => void;
		onViewItem?: (item: MarketItem) => void;
		onBuyItem?: (item: MarketItem) => void;
		class?: string;
	}

	let {
		items,
		loading = false,
		error,
		searchTerm = '',
		selectedRarity = '',
		selectedType = '',
		sortBy = 'popularity',
		sortOrder = 'desc',
		viewMode = 'grid',
		onSearch,
		onFilterRarity,
		onFilterType,
		onSort,
		onViewItem,
		onBuyItem,
		class: className = ''
	}: SteamMarketplaceProps = $props();

	const rarities = ['All', 'Consumer', 'Industrial', 'Mil-Spec', 'Restricted', 'Classified', 'Covert', 'Contraband'];
	const types = ['All', 'Knife', 'Glove', 'Rifle', 'Pistol', 'SMG', 'Sniper', 'Shotgun', 'Machinegun', 'Sticker', 'Case'];

        const filteredItems = $derived.by<MarketItem[]>(() => {
                let filtered = [...items];

		if (searchTerm) {
			filtered = filtered.filter(item =>
				item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
				item.marketHashName.toLowerCase().includes(searchTerm.toLowerCase())
			);
		}

		if (selectedRarity && selectedRarity !== 'All') {
			filtered = filtered.filter(item => item.rarity === selectedRarity);
		}

		if (selectedType && selectedType !== 'All') {
			filtered = filtered.filter(item => item.type.toLowerCase().includes(selectedType.toLowerCase()));
		}

		// Sort items
		filtered.sort((a, b) => {
			let comparison = 0;

			switch (sortBy) {
				case 'price':
					comparison = a.marketPrice - b.marketPrice;
					break;
				case 'volume':
					comparison = a.volume - b.volume;
					break;
				case 'change':
					comparison = a.priceChangePercent - b.priceChangePercent;
					break;
				case 'popularity':
					comparison = a.popularity - b.popularity;
					break;
			}

			return sortOrder === 'asc' ? comparison : -comparison;
		});

                return filtered;
        });

        function handleSearchInput(event: Event) {
                const target = event.target as HTMLInputElement | null;
                if (!target) return;
                onSearch?.(target.value);
        }

        function handleRarityChange(event: Event) {
                const target = event.target as HTMLSelectElement | null;
                if (!target) return;
                onFilterRarity?.(target.value);
        }

        function handleTypeChange(event: Event) {
                const target = event.target as HTMLSelectElement | null;
                if (!target) return;
                onFilterType?.(target.value);
        }

        function handleSortChange(event: Event) {
                const target = event.target as HTMLSelectElement | null;
                if (!target) return;
                onSort?.(target.value, sortOrder);
        }

	const formatCurrency = (amount: number) => {
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: 'USD',
			minimumFractionDigits: 2
		}).format(amount);
	};

	const getRarityColor = (rarity: string) => {
		switch (rarity.toLowerCase()) {
			case 'consumer grade':
				return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
			case 'industrial grade':
				return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
			case 'mil-spec grade':
				return 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30';
			case 'restricted':
				return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
			case 'classified':
				return 'bg-pink-500/20 text-pink-300 border-pink-500/30';
			case 'covert':
				return 'bg-red-500/20 text-red-300 border-red-500/30';
			case 'contraband':
				return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
			default:
				return 'bg-surface/50 text-muted-foreground border-border/40';
		}
	};

	const getItemImage = (iconUrl: string) => {
		return `https://community.akamai.steamstatic.com/economy/image/${iconUrl}`;
	};
</script>

<Card class={className}>
	<CardHeader>
		<div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
			<CardTitle class="text-2xl">Steam Marketplace</CardTitle>

			<div class="flex flex-col sm:flex-row gap-3">
				<div class="relative">
					<Search class="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
					<input
						type="text"
						placeholder="Search items..."
						bind:value={searchTerm}
						class="pl-9 pr-3 py-2 bg-surface/50 border border-border/40 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                                                oninput={handleSearchInput}
					/>
				</div>

				<div class="flex gap-2">
					<Button
						variant={viewMode === 'grid' ? 'default' : 'outline'}
						size="sm"
						class="p-2"
						onclick={() => viewMode = 'grid'}
					>
						<Grid class="h-4 w-4" />
					</Button>
					<Button
						variant={viewMode === 'list' ? 'default' : 'outline'}
						size="sm"
						class="p-2"
						onclick={() => viewMode = 'list'}
					>
						<List class="h-4 w-4" />
					</Button>
				</div>
			</div>
		</div>

		<!-- Filters -->
		<div class="flex flex-wrap gap-3">
			<select
				class="bg-surface/50 border border-border/40 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
				value={selectedRarity}
                                onchange={handleRarityChange}
			>
				{#each rarities as rarity}
					<option value={rarity}>{rarity}</option>
				{/each}
			</select>

			<select
				class="bg-surface/50 border border-border/40 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
				value={selectedType}
                                onchange={handleTypeChange}
			>
				{#each types as type}
					<option value={type}>{type}</option>
				{/each}
			</select>

			<select
				class="bg-surface/50 border border-border/40 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
				value={sortBy}
                                onchange={handleSortChange}
			>
				<option value="popularity">Popularity</option>
				<option value="price">Price</option>
				<option value="volume">Volume</option>
				<option value="change">Price Change</option>
			</select>

			<Button
				variant="outline"
				size="sm"
				class="gap-2"
				onclick={() => onSort?.(sortBy, sortOrder === 'asc' ? 'desc' : 'asc')}
			>
				{sortOrder === 'asc' ? '↑' : '↓'}
				{sortOrder === 'asc' ? 'Low to High' : 'High to Low'}
			</Button>
		</div>
	</CardHeader>

	<CardContent>
		{#if loading}
			<div class="flex items-center justify-center py-12">
				<div class="flex flex-col items-center gap-3">
					<div class="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full"></div>
					<p class="text-muted-foreground">Loading marketplace data...</p>
				</div>
			</div>
		{:else if error}
			<div class="flex flex-col items-center gap-4 py-12 text-center">
				<div class="text-destructive text-lg font-semibold">Error Loading Marketplace</div>
				<p class="text-muted-foreground max-w-md">{error}</p>
				<Button variant="outline">Retry</Button>
			</div>
		{:else if filteredItems.length === 0}
			<div class="flex flex-col items-center gap-4 py-12 text-center">
				<div class="text-muted-foreground text-lg font-semibold">No Items Found</div>
				<p class="text-muted-foreground">Try adjusting your filters or search terms.</p>
			</div>
		{:else}
			{#if viewMode === 'grid'}
				<div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
					{#each filteredItems as item (item.id)}
						<div class="bg-surface/50 rounded-2xl border-2 border-border/40 overflow-hidden">
							<div class="relative">
								<img
									src={getItemImage(item.iconUrl)}
									alt={item.name}
									class="w-full aspect-square object-cover"
								/>

								{#if !item.tradable || !item.marketable}
									<div class="absolute top-2 right-2">
										<Badge class="bg-destructive/80 text-destructive-foreground text-xs">
											{!item.tradable ? 'Not Tradable' : 'Not Marketable'}
										</Badge>
									</div>
								{/if}

								<div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
									<div class="text-center">
										<p class="text-white text-xs font-semibold truncate">
											{item.name}
										</p>
									</div>
								</div>
							</div>

							<div class="p-3 space-y-2">
								<div class="flex items-center justify-between">
									<span class="text-lg font-bold text-white">
										{formatCurrency(item.marketPrice)}
									</span>
									{#if item.priceChange !== 0}
										<div class="flex items-center gap-1 text-xs">
											{#if item.priceChange > 0}
												<TrendingUp class="h-3 w-3 text-green-400" />
											{:else}
												<TrendingDown class="h-3 w-3 text-red-400" />
											{/if}
											<span class={item.priceChange > 0 ? 'text-green-400' : 'text-red-400'}>
												{Math.abs(item.priceChangePercent).toFixed(1)}%
											</span>
										</div>
									{/if}
								</div>

								<div class="flex items-center justify-between text-xs text-muted-foreground">
									<Badge class={`text-xs ${getRarityColor(item.rarity)}`}>
										{item.rarity}
									</Badge>
									<span>Vol: {item.volume}</span>
								</div>

								<div class="flex gap-2">
									<Button
										variant="outline"
										size="sm"
										class="flex-1 gap-1 text-xs"
										onclick={() => onViewItem?.(item)}
									>
										<Eye class="h-3 w-3" />
										View
									</Button>
									{#if item.marketable}
										<Button
											size="sm"
											class="flex-1 gap-1 text-xs"
											onclick={() => onBuyItem?.(item)}
										>
											<ShoppingCart class="h-3 w-3" />
											Buy
										</Button>
									{/if}
								</div>
							</div>
						</div>
					{/each}
				</div>
			{:else}
				<!-- List View -->
				<div class="space-y-3">
					{#each filteredItems as item (item.id)}
						<div class="bg-surface/50 rounded-2xl border border-border/40 p-4">
							<div class="flex items-center gap-4">
								<img
									src={getItemImage(item.iconUrl)}
									alt={item.name}
									class="w-16 h-16 rounded-xl object-cover"
								/>

								<div class="flex-1 min-w-0">
									<div class="flex items-start justify-between gap-4">
										<div>
											<h3 class="font-semibold text-white truncate">{item.name}</h3>
											<div class="flex items-center gap-2 mt-1">
												<Badge class={`text-xs ${getRarityColor(item.rarity)}`}>
													{item.rarity}
												</Badge>
												<span class="text-xs text-muted-foreground">{item.type}</span>
												{#if item.wear}
													<span class="text-xs text-muted-foreground">({item.wear})</span>
												{/if}
											</div>
										</div>

										<div class="text-right">
											<div class="text-xl font-bold text-white">
												{formatCurrency(item.marketPrice)}
											</div>
											{#if item.priceChange !== 0}
												<div class="flex items-center gap-1 text-sm justify-end">
													{#if item.priceChange > 0}
														<TrendingUp class="h-4 w-4 text-green-400" />
													{:else}
														<TrendingDown class="h-4 w-4 text-red-400" />
													{/if}
													<span class={item.priceChange > 0 ? 'text-green-400' : 'text-red-400'}>
														{item.priceChange > 0 ? '+' : ''}{item.priceChangePercent.toFixed(1)}%
													</span>
												</div>
											{/if}
											<div class="text-xs text-muted-foreground">
												Volume: {item.volume}
											</div>
										</div>
									</div>

									<div class="flex items-center justify-between mt-3">
										<div class="flex items-center gap-2">
											{#if !item.tradable || !item.marketable}
												<Badge class="bg-destructive/80 text-destructive-foreground text-xs">
													{!item.tradable ? 'Not Tradable' : 'Not Marketable'}
												</Badge>
											{/if}
										</div>

										<div class="flex gap-2">
											<Button
												variant="outline"
												size="sm"
												class="gap-2"
												onclick={() => window.open(`https://steamcommunity.com/market/listings/730/${item.marketHashName}`, '_blank')}
											>
												<ExternalLink class="h-4 w-4" />
												Steam Market
											</Button>
											{#if item.marketable}
												<Button
													size="sm"
													class="gap-2"
													onclick={() => onBuyItem?.(item)}
												>
													<ShoppingCart class="h-4 w-4" />
													Buy
												</Button>
											{/if}
										</div>
									</div>
								</div>
							</div>
						</div>
					{/each}
				</div>
			{/if}
		{/if}
	</CardContent>
</Card>