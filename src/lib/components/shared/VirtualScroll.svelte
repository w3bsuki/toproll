<script lang="ts" generics="T">
	/**
	 * VirtualScroll - High-performance virtual scrolling for large lists
	 * 
	 * Renders only visible items + buffer for smooth scrolling
	 * 
	 * Usage:
	 * ```svelte
	 * <VirtualScroll
	 *   items={myLargeArray}
	 *   itemHeight={100}
	 *   let:item
	 *   let:index
	 * >
	 *   <MyListItem {item} {index} />
	 * </VirtualScroll>
	 * ```
	 */
	import type { Snippet } from 'svelte';

	type Props = {
		items: T[];
		itemHeight: number;
		height?: string;
		buffer?: number;
		children: Snippet<[{ item: T; index: number }]>;
	};

	let {
		items,
		itemHeight,
		height = '600px',
		buffer = 5,
		children
	}: Props = $props();

	let scrollTop = $state(0);
	let containerHeight = $state(600);

	// ✅ Derived: Calculate visible range
	const visibleStart = $derived(Math.max(0, Math.floor(scrollTop / itemHeight) - buffer));
	const visibleEnd = $derived(
		Math.min(items.length, Math.ceil((scrollTop + containerHeight) / itemHeight) + buffer)
	);
	const visibleItems = $derived(items.slice(visibleStart, visibleEnd));
	const totalHeight = $derived(items.length * itemHeight);
	const offsetY = $derived(visibleStart * itemHeight);

	let container: HTMLDivElement;

	// ✅ Effect with cleanup: Track scroll position
	$effect(() => {
		if (!container) return;

		const handleScroll = () => {
			scrollTop = container.scrollTop;
		};

		const observer = new ResizeObserver((entries) => {
			const entry = entries[0];
			if (entry) {
				containerHeight = entry.contentRect.height;
			}
		});

		container.addEventListener('scroll', handleScroll);
		observer.observe(container);

		// ✅ Cleanup function
		return () => {
			container.removeEventListener('scroll', handleScroll);
			observer.disconnect();
		};
	});
</script>

<div
	bind:this={container}
	class="overflow-y-auto"
	style="height: {height}; position: relative;"
	role="list"
>
	<div style="height: {totalHeight}px; position: relative;">
		<div style="transform: translateY({offsetY}px); will-change: transform;">
			{#each visibleItems as item, i (visibleStart + i)}
				<div style="height: {itemHeight}px;" role="listitem">
					{@render children({ item, index: visibleStart + i })}
				</div>
			{/each}
		</div>
	</div>
</div>
