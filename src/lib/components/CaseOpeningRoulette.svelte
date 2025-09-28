<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { gsap } from 'gsap';
	import { createImageProps } from '$lib/utils/images';

	interface CaseItem {
		id: string;
		name: string;
		rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'mythical';
		image: string;
		value: number;
	}

	export let items: CaseItem[] = [];
	export let onComplete: ((item: CaseItem) => void) | undefined = undefined;

	let containerRef: HTMLDivElement;
	let rouletteRef: HTMLDivElement;
	let indicatorRef: HTMLDivElement;
	let isSpinning = false;
	let winningItem: CaseItem | null = null;
	let showResult = false;
	let gsapInstance: typeof gsap | null = null;

	// Generate extended item list for smooth infinite scroll effect
	$: extendedItems = [...items, ...items, ...items, ...items, ...items];

	const rarityBorders = {
		common: 'border-gray-400',
		uncommon: 'border-green-400',
		rare: 'border-blue-400',
		epic: 'border-purple-400',
		legendary: 'border-orange-400',
		mythical: 'border-red-400'
	};

	const rarityText = {
		common: 'text-gray-400',
		uncommon: 'text-green-400',
		rare: 'text-blue-400',
		epic: 'text-purple-400',
		legendary: 'text-orange-400',
		mythical: 'text-red-400'
	};

	async function startAnimation() {
		console.log('Animation triggered:', {
			browser,
			isSpinning,
			rouletteRef: !!rouletteRef,
			indicatorRef: !!indicatorRef,
			gsap: !!gsapInstance
		});
		if (!browser || isSpinning || !rouletteRef || !indicatorRef || !gsapInstance) return;

		console.log('Starting GSAP animation...');
		isSpinning = true;
		showResult = false;
		winningItem = null;

		// Reset roulette position
		gsapInstance.set(rouletteRef, { x: 0 });

		// Select random winning item
		const randomIndex = Math.floor(Math.random() * items.length);
		const selectedItem = items[randomIndex];

		// Calculate precise positioning
		const itemWidth = 160; // Card width + gap
		const containerWidth = containerRef?.offsetWidth || 800;
		const centerOffset = containerWidth / 2 - itemWidth / 2;

		// Position to center the winning item perfectly
		const finalPosition = -(items.length * itemWidth + randomIndex * itemWidth - centerOffset);

		// Indicator pulse during spin
		gsapInstance.to(indicatorRef, {
			scaleY: 1.3,
			scaleX: 0.8,
			duration: 0.08,
			repeat: -1,
			yoyo: true,
			ease: 'power2.inOut'
		});

		// Perfect easing timeline
		const tl = gsapInstance.timeline({
			onComplete: () => {
				winningItem = selectedItem;
				isSpinning = false;

				// Stop indicator animation smoothly
				gsapInstance.killTweensOf(indicatorRef);
				gsapInstance.to(indicatorRef, { scaleY: 1, scaleX: 1, duration: 0.2 });

				// Reveal result with timing
				setTimeout(() => {
					showResult = true;
					onComplete?.(selectedItem);
				}, 300);
			}
		});

		// Phase 1: Fast acceleration
		tl.to(rouletteRef, {
			x: finalPosition + 800,
			duration: 1.8,
			ease: 'power2.out'
		});

		// Phase 2: Perfect deceleration to exact position
		tl.to(rouletteRef, {
			x: finalPosition,
			duration: 1.5,
			ease: 'power4.out'
		});
	}

	onMount(async () => {
		// Load GSAP dynamically only on client
		if (browser) {
			try {
				gsapInstance = gsap;

				// Initialize roulette position
				if (rouletteRef) {
					gsapInstance.set(rouletteRef, { x: 0 });
				}
			} catch (error) {
				console.error('Failed to load GSAP:', error);
			}
		}
	});
</script>

<div class="mx-auto w-full max-w-5xl space-y-6">
	<!-- Roulette Container -->
	<div
		bind:this={containerRef}
		class="relative h-48 overflow-hidden rounded-lg border border-slate-700/50 bg-slate-900/40 backdrop-blur-sm"
	>
		<!-- Center Indicator Line -->
		<div
			bind:this={indicatorRef}
			class="absolute top-0 left-1/2 z-10 h-full w-0.5 -translate-x-1/2 transform bg-red-500 shadow-lg shadow-red-500/30"
		/>

		<!-- Items Roulette Track -->
		<div
			bind:this={rouletteRef}
			class="flex h-full items-center gap-3 px-4"
			style="width: {extendedItems.length * 160}px"
		>
			{#each extendedItems as item, index (item.id + '-' + index)}
				<div
					class="h-40 w-36 flex-shrink-0 border-2 bg-slate-800/80 {rarityBorders[
						item.rarity
					]} flex flex-col items-center justify-between rounded-lg p-3 backdrop-blur-sm"
				>
					<!-- Item Image -->
					<div class="flex h-20 w-20 items-center justify-center">
						{#if item.image}
							<img
								{...createImageProps(item.image, item.name, 'medium')}
								class="max-h-full max-w-full"
							/>
						{:else}
							<div class="h-20 w-20 bg-gray-600 rounded flex items-center justify-center text-white text-xs">
								No Image
							</div>
						{/if}
					</div>

					<!-- Item Info -->
					<div class="space-y-1 text-center">
						<h3 class="w-full truncate text-xs font-medium text-white" title={item.name}>
							{item.name}
						</h3>
						<p class="text-xs font-bold text-green-400">${item.value}</p>
						<p class="{rarityText[item.rarity]} text-xs font-medium capitalize">
							{item.rarity}
						</p>
					</div>
				</div>
			{/each}
		</div>

		<!-- Edge Fade Effects -->
		<div
			class="pointer-events-none absolute top-0 left-0 h-full w-24 bg-gradient-to-r from-slate-900/80 to-transparent"
		/>
		<div
			class="pointer-events-none absolute top-0 right-0 h-full w-24 bg-gradient-to-l from-slate-900/80 to-transparent"
		/>
	</div>

	<!-- Controls -->
	<div class="flex justify-center">
		<button
			on:click={startAnimation}
			disabled={isSpinning}
			class="transform rounded-lg bg-orange-600 px-8 py-3 font-bold text-white shadow-lg transition-all hover:scale-105 hover:bg-orange-700 disabled:scale-100 disabled:cursor-not-allowed disabled:bg-gray-600 disabled:opacity-50"
		>
			{isSpinning ? 'Opening Case...' : 'Open Case'}
		</button>
	</div>

	<!-- Result Modal -->
	{#if showResult && winningItem}
		<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
			<div
				class="border-2 bg-slate-800 {rarityBorders[
					winningItem.rarity
				]} mx-4 max-w-md space-y-6 rounded-2xl p-8 text-center shadow-2xl"
			>
				<h2 class="text-3xl font-bold text-white">Case Opened!</h2>

				<div class="space-y-4">
					<div class="mx-auto flex h-32 w-32 items-center justify-center">
						<img
							{...createImageProps(winningItem.image, winningItem.name, 'large')}
							class="max-h-full max-w-full"
						/>
					</div>

					<div>
						<h3 class="mb-1 text-xl font-bold text-white">{winningItem.name}</h3>
						<p class="mb-2 text-lg font-bold text-green-400">${winningItem.value}</p>
						<p class="{rarityText[winningItem.rarity]} text-sm font-medium capitalize">
							{winningItem.rarity} Skin
						</p>
					</div>
				</div>

				<button
					on:click={() => (showResult = false)}
					class="rounded-lg bg-slate-700 px-6 py-2 text-white transition-colors hover:bg-slate-600"
				>
					Close
				</button>
			</div>
		</div>
	{/if}
</div>
