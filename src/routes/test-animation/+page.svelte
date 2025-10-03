<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';

	let gsap: any = null;
	let testDiv: HTMLDivElement;

	// Simple test items
	const testItems = [
		{
			id: '1',
			name: 'AK-47 Redline',
			rarity: 'rare',
			image: 'https://via.placeholder.com/80x80/ff0000/ffffff?text=AK',
			value: 45
		},
		{
			id: '2',
			name: 'AWP Dragon Lore',
			rarity: 'legendary',
			image: 'https://via.placeholder.com/80x80/ffa500/ffffff?text=AWP',
			value: 4200
		},
		{
			id: '3',
			name: 'Glock Water',
			rarity: 'uncommon',
			image: 'https://via.placeholder.com/80x80/008000/ffffff?text=GL',
			value: 12
		},
		{
			id: '4',
			name: 'M4A4 Howl',
			rarity: 'mythical',
			image: 'https://via.placeholder.com/80x80/800080/ffffff?text=M4',
			value: 2500
		}
	];

	onMount(async () => {
		if (browser) {
			try {
				const gsapModule = await import('gsap');
				gsap = gsapModule.gsap;
				console.log('GSAP loaded successfully:', !!gsap);
			} catch (error) {
				console.error('Failed to load GSAP:', error);
			}
		}
	});

	function testAnimation() {
		console.log('Test button clicked');
		console.log('GSAP available:', !!gsap);
		console.log('Test div:', !!testDiv);

		if (!gsap || !testDiv) {
			console.error('GSAP or testDiv not available');
			return;
		}

		// Simple test animation
		gsap.to(testDiv, {
			x: 200,
			duration: 2,
			ease: 'power2.out',
			onComplete: () => {
				console.log('Animation completed!');
				gsap.to(testDiv, { x: 0, duration: 1 });
			}
		});
	}
</script>

<svelte:head>
	<title>Animation Test</title>
</svelte:head>

<div class="space-y-8 p-8">
	<h1 class="text-3xl font-bold">GSAP Animation Test</h1>

	<!-- Simple Test -->
	<div class="space-y-4">
		<h2 class="text-xl">Simple Animation Test</h2>
		<div bind:this={testDiv} class="bg-primary h-20 w-20 rounded"></div>
		<button
			onclick={testAnimation}
			class="bg-primary text-primary-foreground hover:bg-primary/90 rounded px-4 py-2"
		>
			Test GSAP Animation
		</button>
	</div>

	<!-- Items Display -->
	<div class="space-y-4">
		<h2 class="text-xl">Test Items</h2>
		<div class="flex gap-4 overflow-x-auto">
			{#each testItems as item}
				<div
					class="border-primary/50 bg-surface flex min-w-36 flex-col items-center rounded-lg border-2 p-3"
				>
					<img src={item.image} alt={item.name} class="mb-2 h-16 w-16" />
					<h3 class="text-foreground text-center text-sm">{item.name}</h3>
					<p class="text-success text-xs">${item.value}</p>
				</div>
			{/each}
		</div>
	</div>

	<a
		href="/cases"
		class="bg-surface-muted text-foreground hover:bg-surface-muted/80 inline-block rounded px-4 py-2 transition-colors"
	>
		← Back to Cases
	</a>
</div>
