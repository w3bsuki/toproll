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
		return item.icon_url
			? `https://community.akamai.steamstatic.com/economy/image/${item.icon_url}`
			: '';
	};
</script>

<Card class={className}>
	<CardContent class="p-6">
		{#if loading}
			<div class="flex items-center justify-center py-12">
				<div class="flex flex-col items-center gap-3">
					<div
						class="border-primary h-8 w-8 animate-spin rounded-full border-2 border-t-transparent"
					></div>
					<p class="text-muted-foreground">Loading inventory...</p>
				</div>
			</div>
		{:else if error}
			<div class="flex flex-col items-center gap-4 py-12 text-center">
				<AlertCircle class="text-destructive h-12 w-12" />
				<div>
					<h3 class="mb-2 text-lg font-semibold">Unable to Load Inventory</h3>
					<p class="text-muted-foreground max-w-md text-sm">{error}</p>
				</div>
				<Button variant="outline" class="gap-2">
					<ExternalLink class="h-4 w-4" />
					Make Inventory Public
				</Button>
			</div>
		{:else if items.length === 0}
			<div class="flex flex-col items-center gap-4 py-12 text-center">
				<Lock class="text-muted-foreground h-12 w-12" />
				<div>
					<h3 class="mb-2 text-lg font-semibold">No Items Found</h3>
					<p class="text-muted-foreground text-sm">
						Your CS2 inventory appears to be empty or private.
					</p>
				</div>
			</div>
		{:else}
			<div class="space-y-4">
				{#if selectable && selectedItems.length > 0}
					<div
						class="bg-surface/50 border-border/40 flex items-center justify-between rounded-2xl border p-4"
					>
						<span class="text-muted-foreground text-sm">
							{selectedItems.length} item{selectedItems.length !== 1 ? 's' : ''} selected
						</span>
						<Button
							variant="outline"
							size="sm"
							onclick={() =>
								selectedItems.forEach((id) => {
									const item = items.find((i) => i.assetid === id);
									if (item) onItemDeselect?.(item);
								})}
						>
							Clear Selection
						</Button>
					</div>
				{/if}

				<div
					class="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
				>
					{#each displayItems as item (item.assetid)}
						<div
							class="group relative cursor-pointer"
							onclick={() => handleItemClick(item)}
							role="button"
							tabindex="0"
							onkeydown={(e) => e.key === 'Enter' && handleItemClick(item)}
						>
							<div
								class="bg-surface/80 border-border/40 aspect-square overflow-hidden rounded-2xl border-2 {getRarityColor(
									item.rarity
								)} {selectable && isItemSelected(item)
									? 'ring-primary ring-offset-background ring-2 ring-offset-2'
									: ''}"
							>
								{#if getItemImage(item)}
									<img
										src={getItemImage(item)}
										alt={item.name}
										class="h-full w-full object-cover"
									/>
								{:else}
									<div class="text-muted-foreground flex h-full w-full items-center justify-center">
										<Eye class="h-8 w-8" />
									</div>
								{/if}

								<!-- Selection indicator -->
								{#if selectable && isItemSelected(item)}
									<div
										class="bg-primary text-primary-foreground absolute top-2 right-2 rounded-full p-1"
									>
										<svg class="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
											<path
												fill-rule="evenodd"
												d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
												clip-rule="evenodd"
											/>
										</svg>
									</div>
								{/if}

								<!-- Status badges -->
								<div class="absolute top-2 left-2 flex flex-col gap-1">
									{#if !item.tradable}
										<Badge
											class="bg-destructive/80 text-destructive-foreground px-1.5 py-0.5 text-xs"
										>
											Not Tradable
										</Badge>
									{:else if !item.marketable}
										<Badge class="bg-yellow-500/80 px-1.5 py-0.5 text-xs text-yellow-900">
											Not Marketable
										</Badge>
									{/if}
								</div>

								<!-- Value display -->
								{#if showValue && item.market_value}
									<div class="absolute right-0 bottom-0 left-0 bg-black/80 p-2 backdrop-blur-sm">
										<div class="text-center">
											<p class="text-xs font-bold text-white">
												{formatCurrency(item.market_value)}
											</p>
										</div>
									</div>
								{/if}
							</div>

							<!-- Item name on hover/select -->
							{#if selectable && isItemSelected(item)}
								<div class="mt-2 text-center">
									<p class="text-muted-foreground truncate text-xs" title={item.name}>
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
