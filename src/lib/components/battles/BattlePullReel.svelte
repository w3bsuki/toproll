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
							setTimeout(
								() => {
									BattleAnimations.sparkle(element);
								},
								index * 200 + 500
							);

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
		<div
			class="bg-surface/80 absolute inset-0 z-10 flex items-center justify-center rounded-xl backdrop-blur-sm"
		>
			<div class="text-center">
				<div class="relative">
					<Gift class="text-primary h-16 w-16" />
					<Sparkles class="text-warning absolute -top-2 -right-2 h-8 w-8" />
				</div>
				<p class="text-foreground mt-4 text-lg font-semibold">
					{revealAnimation ? 'Revealing Items...' : 'Preparing...'}
				</p>
				<div class="mt-2 flex justify-center gap-1">
					{#each Array(3) as _}
						<div class="bg-primary h-2 w-2 rounded-full" style="animation-delay: {_ * 0.2}s;"></div>
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
				<div
					class="bg-surface border-border/40 mb-3 flex items-center justify-between rounded-lg border p-3"
				>
					<div class="flex items-center gap-3">
						<span class="text-muted-foreground text-lg font-bold">#{participant.position}</span>
						{#if participant.user?.avatar_url}
							<img
								src={participant.user.avatar_url}
								alt={participant.user.username}
								class="border-border/40 h-10 w-10 rounded-full border-2"
							/>
						{:else}
							<div
								class="bg-surface-muted border-border/40 flex h-10 w-10 items-center justify-center rounded-full border-2"
							>
								<span class="text-muted-foreground text-sm font-bold">
									{participant.user?.username?.charAt(0).toUpperCase() || 'P'}
								</span>
							</div>
						{/if}
						<div>
							<p class="text-foreground font-semibold">{participant.user?.username}</p>
							<p class="text-muted-foreground text-sm">Player {participant.position}</p>
						</div>
					</div>
					<div class="flex items-center gap-2">
						<svelte:component
							this={getModeIcon(battle?.mode || 'standard')}
							class="text-primary h-4 w-4"
						/>
						<Badge variant="outline" class="text-xs">
							{battle?.mode || 'standard'}
						</Badge>
					</div>
				</div>

				<!-- Item Slot -->
				<div class="relative aspect-square">
					{#if currentPulls.find((p) => p.participant_id === participant.id) && showItems}
						<!-- Revealed Item -->
						{#each currentPulls.filter((p) => p.participant_id === participant.id) as pull (pull.id)}
							<Card
								class="group h-full overflow-hidden transition-transform duration-300 hover:scale-105 {getRarityGlow(
									pull.item?.rarity || 'Common'
								)} revealed-item"
							>
								<CardContent class="flex h-full flex-col p-0">
									<!-- Item Image -->
									<div class="bg-surface-accent/20 relative flex-1 overflow-hidden">
										{#if pull.item?.image_url}
											<img
												src={pull.item.image_url}
												alt={pull.item.name}
												class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
											/>
										{:else}
											<div class="flex h-full w-full items-center justify-center">
												<Gift class="text-muted-foreground h-12 w-12" />
											</div>
										{/if}

										<!-- Rarity Badge Overlay -->
										<div class="absolute top-2 right-2">
											<Badge
												variant="outline"
												class={getRarityColor(pull.item?.rarity || 'Common')}
											>
												{pull.item?.rarity}
											</Badge>
										</div>

										<!-- Roll Number -->
										<div class="absolute top-2 left-2">
											<div
												class="bg-surface/90 text-foreground rounded-full px-2 py-1 text-xs font-bold backdrop-blur-sm"
											>
												#{pull.mapped_roll}
											</div>
										</div>
									</div>

									<!-- Item Details -->
									<div class="bg-surface/90 p-3 backdrop-blur-sm">
										<h3 class="text-foreground mb-1 truncate text-sm font-semibold">
											{pull.item?.name}
										</h3>
										<div class="flex items-center justify-between">
											<span class="text-muted-foreground text-xs">
												{pull.item?.market_name}
											</span>
											<span class="text-sm font-bold text-emerald-400">
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
							<CardContent class="bg-surface-muted/20 flex h-full items-center justify-center p-0">
								<div class="text-center">
									<Gift class="text-muted-foreground mx-auto mb-2 h-8 w-8" />
									<p class="text-muted-foreground text-sm">No Item</p>
								</div>
							</CardContent>
						</Card>
					{:else}
						<!-- Pending Slot -->
						<Card
							class="border-border/40 hover:border-primary/50 h-full border-2 border-dashed transition-colors"
						>
							<CardContent class="bg-surface/50 flex h-full items-center justify-center p-0">
								<div class="text-center">
									{#if isRevealing}
										<div class="relative">
											<Gift class="text-primary h-12 w-12 animate-pulse" />
											<RefreshCw
												class="text-primary absolute -top-1 -right-1 h-6 w-6 animate-spin"
											/>
										</div>
										<p class="text-foreground mt-2 text-sm font-medium">Revealing...</p>
									{:else}
										<Gift class="text-muted-foreground mx-auto mb-2 h-12 w-12" />
										<p class="text-muted-foreground text-sm">Waiting to reveal</p>
									{/if}
								</div>
							</CardContent>
						</Card>
					{/if}
				</div>

				<!-- Special Effects for Rare Items -->
				{#if currentPulls.find((p) => p.participant_id === participant.id && showItems && (p.item?.rarity === 'Legendary' || p.item?.rarity === 'Contraband'))}
					<div class="pointer-events-none absolute -inset-2">
						<div
							class="from-warning/20 via-destructive/20 to-warning/20 absolute inset-0 animate-pulse rounded-xl bg-gradient-to-r"
						></div>
					</div>
				{/if}
			</div>
		{/each}
	</div>

	<!-- Round Status -->
	{#if isRoundComplete}
		<div class="mt-6 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-center">
			<div class="flex items-center justify-center gap-2 text-emerald-400">
				<CheckCircle class="h-5 w-5" />
				<span class="font-semibold">Round {currentRound} Complete</span>
			</div>
			<p class="text-muted-foreground mt-1 text-sm">
				All items have been revealed. Check the running totals to see the current standings.
			</p>
		</div>
	{:else if isRevealing}
		<div class="bg-primary/10 border-primary/20 mt-6 rounded-xl border p-4 text-center">
			<div class="text-primary flex items-center justify-center gap-2">
				<RefreshCw class="h-5 w-5 animate-spin" />
				<span class="font-semibold">Revealing Round {currentRound}</span>
			</div>
			<p class="text-muted-foreground mt-1 text-sm">Opening cases and revealing items...</p>
		</div>
	{:else}
		<div class="bg-surface/50 border-border/40 mt-6 rounded-xl border p-4 text-center">
			<div class="text-muted-foreground flex items-center justify-center gap-2">
				<Clock class="h-5 w-5" />
				<span class="font-semibold">Round {currentRound} Pending</span>
			</div>
			<p class="text-muted-foreground mt-1 text-sm">
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
		0%,
		100% {
			transform: translateY(0px);
		}
		50% {
			transform: translateY(-10px);
		}
	}

	@keyframes sparkle {
		0%,
		100% {
			opacity: 0;
			transform: scale(0) rotate(0deg);
		}
		50% {
			opacity: 1;
			transform: scale(1) rotate(180deg);
		}
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
