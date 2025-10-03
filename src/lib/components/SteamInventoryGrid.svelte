<script lang="ts">
	import { Badge, Button, Card, CardContent } from '$lib/components/ui';
	import { Eye, ExternalLink, AlertCircle, Lock } from '@lucide/svelte';

	export interface CS2Item {
		assetid: string;
		classid: string;
		instanceid: string;
		name: string;
		market_name: string;
		icon_url: string;
		tradable: boolean;
		marketable: boolean;
		market_value?: number;
		rarity?: string;
		type?: string;
		wear?: string;
	}

	export interface SteamInventoryGridProps {
		items: CS2Item[];
		loading?: boolean;
		error?: string;
		selectedItems?: string[];
		onItemSelect?: (item: CS2Item) => void;
		onItemDeselect?: (item: CS2Item) => void;
		selectable?: boolean;
		showValue?: boolean;
		maxItems?: number;
		class?: string;
	}

	let {
		items,
		loading = false,
		error,
		selectedItems = [],
		onItemSelect,
		onItemDeselect,
		selectable = false,
		showValue = true,
		maxItems,
		class: className = ''
	}: SteamInventoryGridProps = $props();

	const displayItems = $derived(maxItems ? items.slice(0, maxItems) : items);

	const isItemSelected = (item: CS2Item) => selectedItems.includes(item.assetid);

	const handleItemClick = (item: CS2Item) => {
		if (!selectable) return;

		if (isItemSelected(item)) {
			onItemDeselect?.(item);
		} else {
			onItemSelect?.(item);
		}
	};

	const getRarityColor = (rarity?: string) => {
		switch (rarity?.toLowerCase()) {
			case 'consumer grade':
				return 'border-gray-500/50 bg-gray-500/10';
			case 'industrial grade':
				return 'border-blue-500/50 bg-blue-500/10';
			case 'mil-spec grade':
				return 'border-indigo-500/50 bg-indigo-500/10';
			case 'restricted':
				return 'border-purple-500/50 bg-purple-500/10';
			case 'classified':
				return 'border-pink-500/50 bg-pink-500/10';
			case 'covert':
				return 'border-red-500/50 bg-red-500/10';
			case 'contraband':
				return 'border-yellow-500/50 bg-yellow-500/10';
			default:
				return 'border-border/50 bg-surface/50';
		}
	};

	const formatCurrency = (amount: number) => {
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: 'USD'
		}).format(amount);
	};

	const getItemImage = (item: CS2Item) => {
		return item.icon_url ? `https://community.akamai.steamstatic.com/economy/image/${item.icon_url}` : '';
	};
</script>

<Card class={className}>
	<CardContent class="p-6">
		{#if loading}
			<div class="flex items-center justify-center py-12">
				<div class="flex flex-col items-center gap-3">
					<div class="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full"></div>
					<p class="text-muted-foreground">Loading inventory...</p>
				</div>
			</div>
		{:else if error}
			<div class="flex flex-col items-center gap-4 py-12 text-center">
				<AlertCircle class="h-12 w-12 text-destructive" />
				<div>
					<h3 class="font-semibold text-lg mb-2">Unable to Load Inventory</h3>
					<p class="text-muted-foreground text-sm max-w-md">{error}</p>
				</div>
				<Button variant="outline" class="gap-2">
					<ExternalLink class="h-4 w-4" />
					Make Inventory Public
				</Button>
			</div>
		{:else if items.length === 0}
			<div class="flex flex-col items-center gap-4 py-12 text-center">
				<Lock class="h-12 w-12 text-muted-foreground" />
				<div>
					<h3 class="font-semibold text-lg mb-2">No Items Found</h3>
					<p class="text-muted-foreground text-sm">
						Your CS2 inventory appears to be empty or private.
					</p>
				</div>
			</div>
		{:else}
			<div class="space-y-4">
				{#if selectable && selectedItems.length > 0}
					<div class="flex items-center justify-between bg-surface/50 rounded-2xl p-4 border border-border/40">
						<span class="text-sm text-muted-foreground">
							{selectedItems.length} item{selectedItems.length !== 1 ? 's' : ''} selected
						</span>
						<Button variant="outline" size="sm" onclick={() => selectedItems.forEach(id => {
							const item = items.find(i => i.assetid === id);
							if (item) onItemDeselect?.(item);
						})}>
							Clear Selection
						</Button>
					</div>
				{/if}

				<div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
					{#each displayItems as item (item.assetid)}
						<div
							class="group relative cursor-pointer"
							onclick={() => handleItemClick(item)}
							role="button"
							tabindex="0"
							onkeydown={(e) => e.key === 'Enter' && handleItemClick(item)}
						>
							<div
								class="aspect-square rounded-2xl border-2 overflow-hidden bg-surface/80 border-border/40 {getRarityColor(item.rarity)} {
									selectable && isItemSelected(item) ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' : ''
								}"
							>
								{#if getItemImage(item)}
									<img
										src={getItemImage(item)}
										alt={item.name}
										class="w-full h-full object-cover"
									/>
								{:else}
									<div class="w-full h-full flex items-center justify-center text-muted-foreground">
										<Eye class="h-8 w-8" />
									</div>
								{/if}

								<!-- Selection indicator -->
								{#if selectable && isItemSelected(item)}
									<div class="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full p-1">
										<svg class="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
											<path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
										</svg>
									</div>
								{/if}

								<!-- Status badges -->
								<div class="absolute top-2 left-2 flex flex-col gap-1">
									{#if !item.tradable}
										<Badge class="bg-destructive/80 text-destructive-foreground text-xs px-1.5 py-0.5">
											Not Tradable
										</Badge>
									{:else if !item.marketable}
										<Badge class="bg-yellow-500/80 text-yellow-900 text-xs px-1.5 py-0.5">
											Not Marketable
										</Badge>
									{/if}
								</div>

								<!-- Value display -->
								{#if showValue && item.market_value}
									<div class="absolute bottom-0 left-0 right-0 bg-black/80 backdrop-blur-sm p-2">
										<div class="text-center">
											<p class="text-white text-xs font-bold">
												{formatCurrency(item.market_value)}
											</p>
										</div>
									</div>
								{/if}
							</div>

							<!-- Item name on hover/select -->
							{#if selectable && isItemSelected(item)}
								<div class="mt-2 text-center">
									<p class="text-xs text-muted-foreground truncate" title={item.name}>
										{item.name}
									</p>
								</div>
							{/if}
						</div>
					{/each}
				</div>

				{#if maxItems && items.length > maxItems}
					<div class="flex justify-center pt-4">
						<Button variant="outline" class="gap-2">
							View All {items.length} Items
							<ExternalLink class="h-4 w-4" />
						</Button>
					</div>
				{/if}
			</div>
		{/if}
	</CardContent>
</Card>