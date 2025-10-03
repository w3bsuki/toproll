<script lang="ts">
	import { Badge } from '$lib/components/ui/badge';
	import {
		Card,
		CardContent,
		CardDescription,
		CardHeader,
		CardTitle
	} from '$lib/components/ui/card';
	import { Separator } from '$lib/components/ui/separator';
	import { Progress } from '$lib/components/ui/progress';
	import { Trophy, Crown, Medal, Users, Currency, TrendingUp, CheckCircle } from '@lucide/svelte';
	import { onMount } from 'svelte';
	import { BattleAnimations, createAnimation } from '$lib/utils/animations';
	import type { Battle, BattleParticipant } from '$lib/types';

	// Props using Svelte 5 syntax
	let {
		battle,
		runningTotals = {},
		winner,
		isBattleComplete = false
	}: {
		battle: Battle | null;
		runningTotals?: Record<string, number>;
		winner?: BattleParticipant | null;
		isBattleComplete?: boolean;
	} = $props();

	// DOM refs for animations
	let totalsCard: HTMLElement | null = null;
	let potElement: HTMLElement | null = null;
	let winnerElement: HTMLElement | null = null;

	// Animation lifecycle
	onMount(() => {
		// Entrance animation for the totals card
		if (totalsCard) {
			BattleAnimations.slideInUp(totalsCard, { delay: 0.3 });
		}

		// Animate total pot value
		if (potElement) {
			BattleAnimations.countUp(potElement, totalPot, { delay: 0.5 });
		}
	});

	// Animate winner celebration
	$effect(() => {
		if (isBattleComplete && winner && winnerElement) {
			BattleAnimations.celebrateWinner(winnerElement, { delay: 0.2 });
		}
	});

	// Format currency
	function formatCurrency(amount: number): string {
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: 'USD'
		}).format(amount);
	}

	// Get winner icon based on position
	function getWinnerIcon(position: number) {
		switch (position) {
			case 1:
				return Crown;
			case 2:
				return Trophy;
			case 3:
				return Medal;
			default:
				return Trophy;
		}
	}

	// Sort participants by total value
	const sortedParticipants = $derived(
		(battle?.participants || [])
			.map((p) => ({
				...p,
				total: runningTotals[p.id] || 0
			}))
			.sort((a, b) => b.total - a.total)
	);

	// Get total pot value
	const totalPot = $derived(battle?.total_pot || 0);

	// Get highest total
	const highestTotal = $derived(sortedParticipants.length > 0 ? sortedParticipants[0].total : 0);

	// Calculate percentage for progress bars
	function getProgressPercentage(value: number): number {
		return highestTotal > 0 ? (value / highestTotal) * 100 : 0;
	}

	// Get rank color
	function getRankColor(position: number) {
		switch (position) {
			case 1:
				return 'text-warning-foreground bg-warning/20 border-warning/30';
			case 2:
				return 'text-surface-foreground bg-surface-muted/50 border-surface-muted/70';
			case 3:
				return 'text-amber-600 bg-amber-500/20 border-amber-500/30';
			default:
				return 'text-muted-foreground bg-surface-muted/30 border-border/40';
		}
	}

	// Get mode description
	function getModeDescription(mode: Battle['mode']) {
		switch (mode) {
			case 'standard':
				return 'Highest total value wins';
			case 'crazy':
				return 'Lowest total value wins';
			default:
				return 'Standard battle rules';
		}
	}
</script>

<div class="contents" bind:this={totalsCard}>
	<Card>
		<CardHeader>
			<CardTitle class="flex items-center gap-2">
				<Trophy class="text-primary h-5 w-5" />
				Running Totals
			</CardTitle>
			<CardDescription>
				{#if isBattleComplete && winner}
					<span class="font-medium text-emerald-400"
						>Battle Complete! {winner.user?.username} wins!</span
					>
				{:else}
					{getModeDescription(battle?.mode || 'standard')}
				{/if}
			</CardDescription>
		</CardHeader>
		<CardContent class="space-y-4">
			<!-- Total Pot -->
			<div class="bg-primary/5 border-primary/20 rounded-lg border p-4">
				<div class="flex items-center justify-between">
					<div class="flex items-center gap-2">
						<Currency class="text-primary h-5 w-5" />
						<span class="text-foreground font-semibold">Total Pot</span>
					</div>
					<span bind:this={potElement} class="text-primary text-2xl font-bold"
						>{formatCurrency(totalPot)}</span
					>
				</div>
			</div>

			<!-- Participant Totals -->
			<div class="space-y-3">
				{#each sortedParticipants as participant (participant.id)}
					<div class="relative">
						{#if isBattleComplete && winner?.user_id === participant.user_id}
							<!-- Winner Celebration -->
							<div
								class="from-warning/20 via-primary/20 to-warning/20 pointer-events-none absolute -inset-1 animate-pulse rounded-lg bg-gradient-to-r"
							></div>
						{/if}

						<div
							class="bg-surface border-border/40 relative z-10 flex items-center gap-4 rounded-lg border p-4"
						>
							<!-- Position Badge -->
							<div class="flex flex-col items-center">
								<div
									class="flex h-10 w-10 items-center justify-center rounded-full {getRankColor(
										sortedParticipants.indexOf(participant) + 1
									)} border-2"
								>
									{#if sortedParticipants.indexOf(participant) < 3}
										<svelte:component
											this={getWinnerIcon(sortedParticipants.indexOf(participant) + 1)}
											class="h-5 w-5"
										/>
									{:else}
										<span class="text-sm font-bold"
											>#{sortedParticipants.indexOf(participant) + 1}</span
										>
									{/if}
								</div>
								<span class="text-muted-foreground mt-1 text-xs">
									{sortedParticipants.indexOf(participant) + 1}{sortedParticipants.indexOf(
										participant
									) === 0
										? 'st'
										: sortedParticipants.indexOf(participant) === 1
											? 'nd'
											: sortedParticipants.indexOf(participant) === 2
												? 'rd'
												: 'th'}
								</span>
							</div>

							<!-- Participant Info -->
							<div class="flex flex-1 items-center gap-3">
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
										<Users class="text-muted-foreground h-5 w-5" />
									</div>
								{/if}
								<div class="flex-1">
									<div class="flex items-center gap-2">
										<p class="text-foreground font-semibold">{participant.user?.username}</p>
										{#if isBattleComplete && winner?.user_id === participant.user_id}
											<Badge variant="default" class="animate-bounce gap-1">
												<Crown class="h-3 w-3" />
												Winner
											</Badge>
										{/if}
									</div>
									<p class="text-muted-foreground text-sm">Player {participant.position}</p>
								</div>
							</div>

							<!-- Total Value -->
							<div class="text-right">
								<p class="text-muted-foreground text-sm">Total Value</p>
								<p
									class="text-xl font-bold {sortedParticipants.indexOf(participant) === 0
										? 'text-emerald-400'
										: 'text-foreground'}"
								>
									{formatCurrency(participant.total)}
								</p>
								{#if sortedParticipants.indexOf(participant) > 0}
									<p class="text-muted-foreground text-xs">
										-{formatCurrency(highestTotal - participant.total)}
									</p>
								{/if}
							</div>
						</div>

						<!-- Progress Bar -->
						<div class="px-2">
							<Progress
								value={getProgressPercentage(participant.total)}
								class="h-2 {sortedParticipants.indexOf(participant) === 0
									? 'bg-primary/20'
									: 'bg-surface-muted/50'}"
							/>
						</div>
					</div>
				{/each}
			</div>

			{#if sortedParticipants.length === 0}
				<!-- Empty State -->
				<div class="text-muted-foreground py-8 text-center">
					<Trophy class="mx-auto mb-3 h-12 w-12 opacity-50" />
					<p>No totals yet</p>
					<p class="text-sm">Wait for the first round to complete</p>
				</div>
			{:else if !isBattleComplete}
				<!-- Battle Status -->
				<div
					class="bg-surface/50 border-border/40 flex items-center justify-between rounded-lg border p-3"
				>
					<div class="text-muted-foreground flex items-center gap-2 text-sm">
						<TrendingUp class="h-4 w-4" />
						<span>Battle in Progress</span>
					</div>
					<div class="text-muted-foreground text-sm">
						{battle?.current_round || 0} of {battle?.rounds_count || 0} rounds complete
					</div>
				</div>
			{:else}
				<!-- Battle Complete -->
				<div
					bind:this={winnerElement}
					class="flex items-center gap-3 rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-4"
				>
					<CheckCircle class="h-5 w-5 text-emerald-400" />
					<div class="flex-1">
						<p class="font-semibold text-emerald-400">Battle Complete!</p>
						<p class="text-muted-foreground text-sm">
							{winner?.user?.username} wins {formatCurrency(totalPot)} total pot
						</p>
					</div>
					<Trophy class="h-6 w-6 text-emerald-400" />
				</div>
			{/if}

			<Separator />

			<!-- Battle Statistics -->
			<div class="grid grid-cols-2 gap-4 text-sm">
				<div>
					<p class="text-muted-foreground">Participants</p>
					<p class="text-foreground font-semibold">{battle?.participants?.length || 0}</p>
				</div>
				<div>
					<p class="text-muted-foreground">Mode</p>
					<p class="text-foreground font-semibold capitalize">{battle?.mode || 'standard'}</p>
				</div>
				<div>
					<p class="text-muted-foreground">Rounds</p>
					<p class="text-foreground font-semibold">{battle?.rounds_count || 0}</p>
				</div>
				<div>
					<p class="text-muted-foreground">Avg. Total</p>
					<p class="text-foreground font-semibold">
						{sortedParticipants.length > 0
							? formatCurrency(
									sortedParticipants.reduce((sum, p) => sum + p.total, 0) /
										sortedParticipants.length
								)
							: formatCurrency(0)}
					</p>
				</div>
			</div>
		</CardContent>
	</Card>
</div>
