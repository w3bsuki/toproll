<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import type { CS2Item } from '$lib/types';

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
		class: className,
		...restProps
	}: InventoryGridProps = $props();

	const rarityClasses: Record<string, string> = {
		'Common': 'bg-gray-100 text-gray-800',
		'Uncommon': 'bg-green-100 text-green-800',
		'Rare': 'bg-blue-100 text-blue-800',
		'Epic': 'bg-purple-100 text-purple-800',
		'Legendary': 'bg-orange-100 text-orange-800',
		'Contraband': 'bg-red-100 text-red-800'
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

<div class="grid grid-cols-4 gap-4 {className}" {...restProps}>
	{#if loading}
		{#each Array.from({ length: 8 }, (_, i) => i) as index (index)}
			<div class="overflow-hidden rounded-lg border bg-white shadow-sm">
				<div class="p-0">
					<div class="h-32 w-full animate-pulse bg-gray-200"></div>
				</div>
				<div class="p-4">
					<div class="mb-2 h-4 w-3/4 animate-pulse bg-gray-200 rounded"></div>
					<div class="h-3 w-1/2 animate-pulse bg-gray-200 rounded"></div>
				</div>
			</div>
		{/each}
	{:else}
		{#each items as item (item.assetid)}
			<div
				class="cursor-pointer overflow-hidden rounded-lg border bg-white shadow-sm transition-transform hover:scale-105 hover:shadow-md {selectable
					? 'ring-2 ring-transparent hover:ring-blue-500'
					: ''}"
				onclick={() => handleItemClick(item)}
			>
				<div class="relative p-0">
					{#if item.icon_url}
						<img src={item.icon_url} alt={item.market_name} class="h-32 w-full object-cover" />
					{:else}
						<div class="bg-gray-100 flex h-32 w-full items-center justify-center">
							<span class="text-gray-500 text-sm">No Image</span>
						</div>
					{/if}
					{#if item.rarity}
						<div class="absolute top-2 right-2">
							<span
								class="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium {rarityClasses[item.rarity] || 'bg-gray-100 text-gray-800'}"
							>
								{item.rarity}
							</span>
						</div>
					{/if}
					{#if item.wear}
						<div class="absolute bottom-2 left-2">
							<span class="inline-flex items-center rounded-full border px-2 py-1 text-xs font-medium bg-white/80">
								{item.wear}
							</span>
						</div>
					{/if}
				</div>
				<div class="p-4">
					<h3 class="mb-1 truncate text-sm font-semibold">{item.market_name}</h3>
					{#if item.market_value}
						<p class="text-gray-500 text-sm">
							{formatPrice(item.market_value)}
						</p>
					{/if}
				</div>
			</div>
		{/each}
	{/if}
</div>

{#if !loading && items.length === 0}
	<div class="col-span-full py-8 text-center">
		<p class="text-gray-500">No items found in inventory</p>
	</div>
{/if}
