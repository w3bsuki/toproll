<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';

	let containerRef: HTMLDivElement;
	let rouletteRef: HTMLDivElement;
	let isAnimating = false;

	const items = [
		{ id: 1, name: 'AK-47', color: 'bg-primary' },
		{ id: 2, name: 'AWP', color: 'bg-secondary' },
		{ id: 3, name: 'M4A4', color: 'bg-success' },
		{ id: 4, name: 'Glock', color: 'bg-warning' },
		{ id: 5, name: 'USP', color: 'bg-accent' },
		{ id: 6, name: 'Knife', color: 'bg-destructive' }
	];

	let extendedItems = [...items, ...items, ...items, ...items];

	onMount(async () => {
		if (browser) {
			console.log('Component mounted in browser');
			console.log('User Agent:', navigator.userAgent);
			console.log('Is mobile:', /iPhone|iPad|iPod|Android/i.test(navigator.userAgent));

			// Try to load GSAP
			try {
				const { gsap } = await import('gsap');
				console.log('GSAP loaded:', gsap);
				console.log('GSAP version:', gsap.version);

				// Test simple animation on mount
				if (rouletteRef) {
					gsap.set(rouletteRef, { x: 0 });
					console.log('GSAP set initial position');
				}

				// Expose to window for debugging
				(window as any).testGsap = () => {
					console.log('testGsap called');
					console.log('rouletteRef:', rouletteRef);
					console.log('isAnimating:', isAnimating);

					if (rouletteRef && !isAnimating) {
						isAnimating = true;
						console.log('Starting test animation...');

						gsap.to(rouletteRef, {
							x: -800,
							duration: 3,
							ease: 'power2.out',
							onComplete: () => {
								console.log('Animation complete');
								isAnimating = false;
								gsap.set(rouletteRef, { x: 0 });
							}
						});
					} else {
						console.log('Animation blocked:', { rouletteRef: !!rouletteRef, isAnimating });
					}
				};

				// Desktop detected - manual testing only
				if (!/iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
					console.log('Desktop detected - ready for manual button clicks');
				}
			} catch (error) {
				console.error('Failed to load GSAP:', error);
			}
		}
	});

	function startTest() {
		console.log('Button clicked on desktop');
		console.log('Event handler working');

		// Force trigger the animation directly
		if (rouletteRef && !isAnimating) {
			console.log('Direct animation trigger');

			// Load GSAP if not loaded
			import('gsap')
				.then(({ gsap }) => {
					isAnimating = true;
					console.log('Starting direct animation...');

					gsap.to(rouletteRef, {
						x: -800,
						duration: 3,
						ease: 'power2.out',
						onComplete: () => {
							console.log('Direct animation complete');
							isAnimating = false;
							gsap.set(rouletteRef, { x: 0 });
						}
					});
				})
				.catch((err) => {
					console.error('Failed to load GSAP in button handler:', err);
				});
		} else {
			console.log('Animation blocked in button handler:', {
				rouletteRef: !!rouletteRef,
				isAnimating
			});
		}
	}
</script>

<div class="space-y-6 p-8">
	<h1 class="text-2xl font-bold">Simple GSAP Test</h1>

	<button
		onclick={startTest}
		class="bg-primary text-primary-foreground hover:bg-primary/90 rounded px-6 py-3 transition-colors disabled:opacity-50"
		disabled={isAnimating}
	>
		{isAnimating ? 'Animating...' : 'Start Animation'}
	</button>

	<div bind:this={containerRef} class="bg-surface relative h-32 overflow-hidden rounded">
		<!-- Red line indicator -->
		<div class="bg-destructive absolute top-0 left-1/2 z-10 h-full w-1"></div>

		<!-- Items strip -->
		<div
			bind:this={rouletteRef}
			class="flex h-full items-center gap-4 px-4"
			style="width: {extendedItems.length * 120}px"
		>
			{#each extendedItems as item, i}
				<div
					class="h-24 w-24 {item.color} text-foreground flex items-center justify-center rounded font-bold"
				>
					{item.name}
				</div>
			{/each}
		</div>
	</div>

	<div class="text-muted-foreground text-sm">
		Open browser console to see debug info. You can also run `testGsap()` in console.
	</div>
</div>
