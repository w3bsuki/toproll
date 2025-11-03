<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import type { CS2Item } from '$lib/types/index';
	import { cn } from '$lib/utils';

	interface InventoryGridProps extends HTMLAttributes<HTMLDivElement> {
		items: CS2Item[];
		loading?: boolean;
		selectable?: boolean;
		onItemClick?: (item: CS2Item) => void;
	}

	let {
		items = [],
		loading = false,
		selectable = false,
		onItemClick,
		class: className = '',
		...restProps
	}: InventoryGridProps = $props();

	const rarityClasses: Record<string, string> = {
		Common: 'bg-surface-muted/60 text-muted-foreground',
		Uncommon: 'bg-success/15 text-success',
		Rare: 'bg-info/15 text-info',
		Epic: 'bg-secondary/15 text-secondary',
		Legendary: 'bg-warning/15 text-warning-foreground',
		Contraband: 'bg-destructive/15 text-destructive'
	};

	function handleItemClick(item: CS2Item) {
		onItemClick?.(item);
	}

	function formatPrice(price: number) {
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: 'USD'
		}).format(price);
	}
</script>

<div class={cn('grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4', className)} {...restProps}>
	{#if loading}
		{#each Array.from({ length: 8 }, (_, index) => index) as index (index)}
			<div class="border-border/60 bg-surface/70 shadow-marketplace-sm rounded-lg border">
				<div class="bg-surface-muted/60 h-32 w-full animate-pulse rounded-t-lg"></div>
				<div class="space-y-2 p-4">
					<div class="bg-surface-muted/60 h-4 w-3/4 animate-pulse rounded"></div>
					<div class="bg-surface-muted/60 h-3 w-1/2 animate-pulse rounded"></div>
				</div>
			</div>
		{/each}
	{:else}
		{#each items as item (item.assetid)}
			<button
				type="button"
				class={cn(
					'group border-border/60 bg-surface/70 shadow-marketplace-sm duration-subtle ease-market-ease hover:border-primary/60 hover:shadow-marketplace-md flex h-full flex-col overflow-hidden rounded-lg border text-left transition-colors',
					selectable && 'focus-visible:ring-ring/60 focus-visible:ring-2 focus-visible:outline-none'
				)}
				onclick={() => handleItemClick(item)}
			>
				<div class="relative">
					{#if item.icon_url}
						<img src={item.icon_url} alt={item.market_name} class="h-32 w-full object-cover" />
					{:else}
						<div
							class="bg-surface-muted/60 text-muted-foreground flex h-32 w-full items-center justify-center text-xs"
						>
							No preview
						</div>
					{/if}
					{#if item.rarity}
						<span
							class={cn(
								'absolute top-3 right-3 rounded-full px-2 py-1 text-[10px] font-medium tracking-wide uppercase',
								rarityClasses[item.rarity] || 'bg-surface-muted/60 text-muted-foreground'
							)}
						>
							{item.rarity}
						</span>
					{/if}
					{#if item.wear}
						<span
							class="border-border/60 bg-background/80 text-muted-foreground absolute bottom-3 left-3 rounded-full border px-2 py-1 text-[10px] font-medium"
						>
							{item.wear}
						</span>
					{/if}
				</div>
				<div class="flex flex-1 flex-col justify-between space-y-2 p-4">
					<h3 class="text-foreground line-clamp-2 text-sm font-medium">{item.market_name}</h3>
					{#if item.market_value}
						<p class="text-primary text-sm font-semibold">{formatPrice(item.market_value)}</p>
					{/if}
				</div>
			</button>
		{/each}
	{/if}
</div>

{#if !loading && items.length === 0}
	<div
		class="border-border/60 bg-surface/70 text-muted-foreground col-span-full rounded-lg border py-10 text-center text-sm"
	>
		No items found in inventory
	</div>
{/if}

