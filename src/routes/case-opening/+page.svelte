<script lang="ts">
	import CaseOpeningRoulette from '$lib/components/CaseOpeningRoulette.svelte';
	import ParticleEffects from '$lib/components/ParticleEffects.svelte';

	let showParticles = false;
	let lastWin: any = null;

	// Real CS2 items using downloaded PNG images
	const mockItems = [
		{
			id: '1',
			name: 'AK-47 | Redline',
			rarity: 'rare' as const,
			image: '/images/skins/ak47-redline.png',
			value: 45.5
		},
		{
			id: '2',
			name: 'AWP | Dragon Lore',
			rarity: 'legendary' as const,
			image: '/images/skins/awp-dragon-lore.png',
			value: 4200.0
		},
		{
			id: '3',
			name: 'M4A4 | Howl',
			rarity: 'mythical' as const,
			image: '/images/skins/m4a4-howl.png',
			value: 2500.0
		},
		{
			id: '4',
			name: 'Glock-18 | Fade',
			rarity: 'uncommon' as const,
			image: '/images/skins/glock-fade.png',
			value: 12.3
		},
		{
			id: '5',
			name: 'USP-S | Kill Confirmed',
			rarity: 'epic' as const,
			image: '/images/skins/usps-kill-confirmed.png',
			value: 78.9
		},
		{
			id: '6',
			name: 'Desert Eagle | Blaze',
			rarity: 'common' as const,
			image: '/images/skins/deagle-blaze.png',
			value: 0.04
		},
		{
			id: '7',
			name: 'Karambit | Fade',
			rarity: 'mythical' as const,
			image: '/images/skins/karambit-fade.png',
			value: 1850.0
		},
		{
			id: '8',
			name: 'AK-47 | Fire Serpent',
			rarity: 'legendary' as const,
			image: '/images/skins/ak47-fire-serpent.png',
			value: 1200.0
		}
	];

	function handleCaseComplete(item: any) {
		lastWin = item;
		showParticles = true;
		setTimeout(() => (showParticles = false), 2500);
	}
</script>

<svelte:head>
	<title>Case Opening - TopRoll</title>
</svelte:head>

<div class="bg-background relative min-h-screen p-6">
	<ParticleEffects trigger={showParticles} color="#ffd700" intensity="high" />

	<div class="container mx-auto space-y-8">
		<!-- Header -->
		<div class="space-y-4 text-center">
			<h1 class="text-foreground text-4xl font-bold tracking-tight md:text-6xl">
				Case <span class="text-warning">Opening</span>
			</h1>
			<p class="text-muted-foreground mx-auto max-w-2xl text-xl">
				Experience the thrill of CS2 case openings with flawless animations
			</p>
		</div>

		<!-- Stats Display -->
		{#if lastWin}
			<div class="border-border/60 bg-surface/60 mx-auto max-w-md rounded-lg border p-6">
				<h3 class="text-foreground mb-3 text-lg font-semibold">Recent Win</h3>
				<div class="flex items-center gap-4">
					<img src={lastWin.image} alt={lastWin.name} class="h-12 w-12 rounded" />
					<div>
						<p class="text-foreground font-medium">{lastWin.name}</p>
						<p class="text-success font-bold">${lastWin.value}</p>
						<p class="text-muted-foreground text-sm capitalize">{lastWin.rarity}</p>
					</div>
				</div>
			</div>
		{/if}

		<!-- Case Opening Component -->
		<CaseOpeningRoulette items={mockItems} onComplete={handleCaseComplete} />

		<!-- Features Grid -->
		<div class="mx-auto mt-16 grid max-w-4xl grid-cols-1 gap-6 md:grid-cols-3">
			<div class="border-border/60 bg-surface/40 rounded-lg border p-6 text-center">
				<div class="text-warning mb-3 text-3xl">🎯</div>
				<h3 class="text-foreground mb-2 text-lg font-semibold">Perfect Physics</h3>
				<p class="text-muted-foreground text-sm">
					GSAP-powered animations with realistic deceleration and precise timing
				</p>
			</div>

			<div class="border-border/60 bg-surface/40 rounded-lg border p-6 text-center">
				<div class="text-warning mb-3 text-3xl">⚡</div>
				<h3 class="text-foreground mb-2 text-lg font-semibold">60FPS Performance</h3>
				<p class="text-muted-foreground text-sm">
					Hardware-accelerated transforms for buttery smooth animations
				</p>
			</div>

			<div class="border-border/60 bg-surface/40 rounded-lg border p-6 text-center">
				<div class="text-warning mb-3 text-3xl">🎨</div>
				<h3 class="text-foreground mb-2 text-lg font-semibold">Clean Design</h3>
				<p class="text-muted-foreground text-sm">
					Minimal, professional interface ready for real CS2 skin images
				</p>
			</div>
		</div>

		<!-- Navigation -->
		<div class="text-center">
			<a
				href="/"
				class="bg-surface-muted text-foreground hover:bg-surface-muted/80 inline-block rounded-lg px-6 py-3 transition-colors"
			>
				← Back to Home
			</a>
		</div>
	</div>
</div>
