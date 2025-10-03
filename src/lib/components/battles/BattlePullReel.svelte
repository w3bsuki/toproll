<script lang="ts">
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import { Card, CardContent } from '$lib/components/ui/card';
	import { Sparkles, Trophy, Play, RefreshCw, Gift } from '@lucide/svelte';
	import { onMount } from 'svelte';
        import { BattleAnimations, animations } from '$lib/utils/animations';
        import { CheckCircle, Clock } from '@lucide/svelte';
	import type { Battle, BattlePull, CaseItem } from '$lib/types';

	// Props using Svelte 5 syntax
	let {
		battle,
		currentRound,
		currentPulls,
		isRevealing,
		isRoundComplete
	}: {
		battle: Battle | null;
		currentRound: number;
		currentPulls: BattlePull[];
		isRevealing: boolean;
		isRoundComplete: boolean;
	} = $props();

	// Reactive state for animations
	let revealAnimation = $state(false);
	let showItems = $state(false);

	// DOM refs for animations
	let reelContainer: HTMLElement;
	let itemElements: HTMLElement[] = [];

	// Animation lifecycle
        onMount(() => {
                // Set up entrance animations for static elements
                if (reelContainer) {
                        animations.slideInUp(reelContainer, { delay: 0.2 });
                }
        });

	// Get rarity color
	function getRarityColor(rarity: CaseItem['rarity']) {
		const colors = {
			Common: 'bg-surface-muted text-surface-muted-foreground border-border/70',
			Uncommon: 'bg-secondary/20 text-secondary-foreground border-secondary/60',
			Rare: 'bg-primary/15 text-primary border-primary/50',
			Epic: 'bg-accent/20 text-accent-foreground border-accent/50',
			Legendary: 'bg-warning/20 text-warning-foreground border-warning/55',
			Contraband: 'bg-destructive/20 text-destructive-foreground border-destructive/60'
		};
		return colors[rarity] || colors.Common;
	}

	// Get rarity glow effect
	function getRarityGlow(rarity: CaseItem['rarity']) {
		const glows = {
			Common: '',
			Uncommon: 'shadow-secondary/20',
			Rare: 'shadow-primary/30',
			Epic: 'shadow-accent/30',
			Legendary: 'shadow-warning/40',
			Contraband: 'shadow-destructive/50'
		};
		return glows[rarity] || '';
	}

	// Format currency
	function formatCurrency(amount: number): string {
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: 'USD'
		}).format(amount);
	}

	// Start reveal animation
	function startRevealAnimation() {
		revealAnimation = true;
		showItems = false;

		// Clear previous animation elements
		itemElements = [];

		// Wait for DOM to update, then animate items
		setTimeout(() => {
			showItems = true;

			// Animate revealed items with stagger
			setTimeout(() => {
				// Find all revealed item elements
				const revealedItems = reelContainer?.querySelectorAll('.revealed-item') || [];
				itemElements = Array.from(revealedItems) as HTMLElement[];

				if (itemElements.length > 0) {
					// Staggered reveal animation
					BattleAnimations.revealItems(itemElements, {
						duration: 0.8,
						stagger: 0.2,
						direction: 'scale',
						distance: 100
					});

					// Add special effects for rare items
					itemElements.forEach((element, index) => {
						const pull = currentPulls[index];
						if (pull?.item?.rarity === 'Legendary' || pull?.item?.rarity === 'Contraband') {
							// Add sparkle effect
							setTimeout(() => {
								BattleAnimations.sparkle(element);
							}, index * 200 + 500);

							// Add glow animation
							BattleAnimations.glow(element, {
								duration: 2,
								delay: index * 200
							});
						}
					});
				}
			}, 100);
		}, 500);

		// End animation
		setTimeout(() => {
			revealAnimation = false;
		}, 3000);
	}

	// Auto-start animation when revealing
	$effect(() => {
		if (isRevealing && !revealAnimation) {
			startRevealAnimation();
		}
	});

	// Get mode icon
	function getModeIcon(mode: Battle['mode']) {
		return mode === 'crazy' ? Sparkles : Trophy;
	}
</script>

<!-- Pull Reel Container -->
<div class="relative" bind:this={reelContainer}>
	{#if isRevealing || revealAnimation}
		<!-- Animation Overlay -->
		<div class="absolute inset-0 bg-surface/80 backdrop-blur-sm rounded-xl z-10 flex items-center justify-center">
			<div class="text-center">
				<div class="relative">
					<Gift class="h-16 w-16 text-primary" />
					<Sparkles class="h-8 w-8 text-warning absolute -top-2 -right-2" />
				</div>
				<p class="text-lg font-semibold text-foreground mt-4">
					{revealAnimation ? 'Revealing Items...' : 'Preparing...'}
				</p>
				<div class="flex justify-center gap-1 mt-2">
					{#each Array(3) as _}
						<div class="h-2 w-2 bg-primary rounded-full" style="animation-delay: {(_ * 0.2)}s;"></div>
					{/each}
				</div>
			</div>
		</div>
	{/if}

	<!-- Pull Grid -->
	<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-{battle?.participants?.length || 2}">
		{#each battle?.participants || [] as participant (participant.id)}
			<div class="relative">
				<!-- Participant Header -->
				<div class="flex items-center justify-between mb-3 p-3 bg-surface rounded-lg border border-border/40">
					<div class="flex items-center gap-3">
						<span class="text-lg font-bold text-muted-foreground">#{participant.position}</span>
						{#if participant.user?.avatar_url}
							<img
								src={participant.user.avatar_url}
								alt={participant.user.username}
								class="h-10 w-10 rounded-full border-2 border-border/40"
							/>
						{:else}
							<div class="h-10 w-10 rounded-full bg-surface-muted flex items-center justify-center border-2 border-border/40">
								<span class="text-sm font-bold text-muted-foreground">
									{participant.user?.username?.charAt(0).toUpperCase() || 'P'}
								</span>
							</div>
						{/if}
						<div>
							<p class="font-semibold text-foreground">{participant.user?.username}</p>
							<p class="text-sm text-muted-foreground">Player {participant.position}</p>
						</div>
					</div>
					<div class="flex items-center gap-2">
						<svelte:component this={getModeIcon(battle?.mode || 'standard')} class="h-4 w-4 text-primary" />
						<Badge variant="outline" class="text-xs">
							{battle?.mode || 'standard'}
						</Badge>
					</div>
				</div>

				<!-- Item Slot -->
				<div class="relative aspect-square">
					{#if currentPulls.find(p => p.participant_id === participant.id) && showItems}
						<!-- Revealed Item -->
						{#each currentPulls.filter(p => p.participant_id === participant.id) as pull (pull.id)}
							<Card class="h-full overflow-hidden group hover:scale-105 transition-transform duration-300 {getRarityGlow(pull.item?.rarity || 'Common')} revealed-item">
								<CardContent class="p-0 h-full flex flex-col">
									<!-- Item Image -->
									<div class="relative flex-1 bg-surface-accent/20 overflow-hidden">
										{#if pull.item?.image_url}
											<img
												src={pull.item.image_url}
												alt={pull.item.name}
												class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
											/>
										{:else}
											<div class="w-full h-full flex items-center justify-center">
												<Gift class="h-12 w-12 text-muted-foreground" />
											</div>
										{/if}

										<!-- Rarity Badge Overlay -->
										<div class="absolute top-2 right-2">
											<Badge variant="outline" class={getRarityColor(pull.item?.rarity || 'Common')}>
												{pull.item?.rarity}
											</Badge>
										</div>

										<!-- Roll Number -->
										<div class="absolute top-2 left-2">
											<div class="bg-surface/90 backdrop-blur-sm rounded-full px-2 py-1 text-xs font-bold text-foreground">
												#{pull.mapped_roll}
											</div>
										</div>
									</div>

									<!-- Item Details -->
									<div class="p-3 bg-surface/90 backdrop-blur-sm">
										<h3 class="font-semibold text-foreground text-sm truncate mb-1">
											{pull.item?.name}
										</h3>
										<div class="flex items-center justify-between">
											<span class="text-xs text-muted-foreground">
												{pull.item?.market_name}
											</span>
											<span class="font-bold text-emerald-400 text-sm">
												{formatCurrency(pull.item?.market_value || 0)}
											</span>
										</div>
									</div>
								</CardContent>
							</Card>
						{/each}
					{:else if isRoundComplete}
						<!-- Empty Slot (Completed Round) -->
						<Card class="h-full opacity-50">
							<CardContent class="p-0 h-full flex items-center justify-center bg-surface-muted/20">
								<div class="text-center">
									<Gift class="h-8 w-8 text-muted-foreground mx-auto mb-2" />
									<p class="text-sm text-muted-foreground">No Item</p>
								</div>
							</CardContent>
						</Card>
					{:else}
						<!-- Pending Slot -->
						<Card class="h-full border-2 border-dashed border-border/40 hover:border-primary/50 transition-colors">
							<CardContent class="p-0 h-full flex items-center justify-center bg-surface/50">
								<div class="text-center">
									{#if isRevealing}
										<div class="relative">
											<Gift class="h-12 w-12 text-primary animate-pulse" />
											<RefreshCw class="h-6 w-6 text-primary absolute -top-1 -right-1 animate-spin" />
										</div>
										<p class="text-sm text-foreground mt-2 font-medium">Revealing...</p>
									{:else}
										<Gift class="h-12 w-12 text-muted-foreground mx-auto mb-2" />
										<p class="text-sm text-muted-foreground">Waiting to reveal</p>
									{/if}
								</div>
							</CardContent>
						</Card>
					{/if}
				</div>

				<!-- Special Effects for Rare Items -->
				{#if currentPulls.find(p => p.participant_id === participant.id && showItems && (p.item?.rarity === 'Legendary' || p.item?.rarity === 'Contraband'))}
					<div class="absolute -inset-2 pointer-events-none">
						<div class="absolute inset-0 bg-gradient-to-r from-warning/20 via-destructive/20 to-warning/20 rounded-xl animate-pulse"></div>
					</div>
				{/if}
			</div>
		{/each}
	</div>

	<!-- Round Status -->
	{#if isRoundComplete}
		<div class="mt-6 text-center p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
			<div class="flex items-center justify-center gap-2 text-emerald-400">
				<CheckCircle class="h-5 w-5" />
				<span class="font-semibold">Round {currentRound} Complete</span>
			</div>
			<p class="text-sm text-muted-foreground mt-1">
				All items have been revealed. Check the running totals to see the current standings.
			</p>
		</div>
	{:else if isRevealing}
		<div class="mt-6 text-center p-4 bg-primary/10 border border-primary/20 rounded-xl">
			<div class="flex items-center justify-center gap-2 text-primary">
				<RefreshCw class="h-5 w-5 animate-spin" />
				<span class="font-semibold">Revealing Round {currentRound}</span>
			</div>
			<p class="text-sm text-muted-foreground mt-1">
				Opening cases and revealing items...
			</p>
		</div>
	{:else}
		<div class="mt-6 text-center p-4 bg-surface/50 border border-border/40 rounded-xl">
			<div class="flex items-center justify-center gap-2 text-muted-foreground">
				<Clock class="h-5 w-5" />
				<span class="font-semibold">Round {currentRound} Pending</span>
			</div>
			<p class="text-sm text-muted-foreground mt-1">
				{#if battle?.status === 'in_progress'}
					Click "Reveal Items" to start the round
				{:else}
					Waiting for battle to start...
				{/if}
			</p>
		</div>
	{/if}
</div>

<style>
	/* Custom animations for special effects */
	@keyframes float {
		0%, 100% { transform: translateY(0px); }
		50% { transform: translateY(-10px); }
	}

	@keyframes sparkle {
		0%, 100% { opacity: 0; transform: scale(0) rotate(0deg); }
		50% { opacity: 1; transform: scale(1) rotate(180deg); }
	}

	.animate-float {
		animation: float 3s ease-in-out infinite;
	}

	.animate-sparkle {
		animation: sparkle 2s ease-in-out infinite;
	}

	/* Grid responsive columns */
	.grid {
		display: grid;
		gap: 1rem;
	}

	/* Responsive grid columns */
	@media (min-width: 768px) {
		.grid {
			grid-template-columns: repeat(2, 1fr);
		}
	}

	@media (min-width: 1024px) {
		.grid {
			grid-template-columns: repeat(var(--cols, 2), 1fr);
		}
	}
</style>

