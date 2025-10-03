<script lang="ts">
	import { Badge } from '$lib/components/ui/badge';
	import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '$lib/components/ui/card';
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
	let totalsCard: HTMLElement;
	let potElement: HTMLElement;
	let winnerElement: HTMLElement;

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
			case 1: return Crown;
			case 2: return Trophy;
			case 3: return Medal;
			default: return Trophy;
		}
	}

	// Sort participants by total value
	const sortedParticipants = $derived(
		(battle?.participants || [])
			.map(p => ({
				...p,
				total: runningTotals[p.id] || 0
			}))
			.sort((a, b) => b.total - a.total)
	);

	// Get total pot value
	const totalPot = $derived(battle?.total_pot || 0);

	// Get highest total
	const highestTotal = $derived(
		sortedParticipants.length > 0 ? sortedParticipants[0].total : 0
	);

	// Calculate percentage for progress bars
	function getProgressPercentage(value: number): number {
		return highestTotal > 0 ? (value / highestTotal) * 100 : 0;
	}

	// Get rank color
	function getRankColor(position: number) {
		switch (position) {
			case 1: return 'text-warning-foreground bg-warning/20 border-warning/30';
			case 2: return 'text-surface-foreground bg-surface-muted/50 border-surface-muted/70';
			case 3: return 'text-amber-600 bg-amber-500/20 border-amber-500/30';
			default: return 'text-muted-foreground bg-surface-muted/30 border-border/40';
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

<Card bind:this={totalsCard}>
	<CardHeader>
		<CardTitle class="flex items-center gap-2">
			<Trophy class="h-5 w-5 text-primary" />
			Running Totals
		</CardTitle>
		<CardDescription>
			{#if isBattleComplete && winner}
				<span class="text-emerald-400 font-medium">Battle Complete! {winner.user?.username} wins!</span>
			{:else}
				{getModeDescription(battle?.mode || 'standard')}
			{/if}
		</CardDescription>
	</CardHeader>
	<CardContent class="space-y-4">
		<!-- Total Pot -->
		<div class="p-4 bg-primary/5 border border-primary/20 rounded-lg">
			<div class="flex items-center justify-between">
				<div class="flex items-center gap-2">
					<Currency class="h-5 w-5 text-primary" />
					<span class="font-semibold text-foreground">Total Pot</span>
				</div>
				<span bind:this={potElement} class="text-2xl font-bold text-primary">{formatCurrency(totalPot)}</span>
			</div>
		</div>

		<!-- Participant Totals -->
		<div class="space-y-3">
			{#each sortedParticipants as participant (participant.id)}
				<div class="relative">
					{#if isBattleComplete && winner?.user_id === participant.user_id}
						<!-- Winner Celebration -->
						<div class="absolute -inset-1 bg-gradient-to-r from-warning/20 via-primary/20 to-warning/20 rounded-lg animate-pulse pointer-events-none"></div>
					{/if}

					<div class="flex items-center gap-4 p-4 bg-surface rounded-lg border border-border/40 relative z-10">
						<!-- Position Badge -->
						<div class="flex flex-col items-center">
							<div class="flex items-center justify-center w-10 h-10 rounded-full {getRankColor(sortedParticipants.indexOf(participant) + 1)} border-2">
								{#if sortedParticipants.indexOf(participant) < 3}
									<svelte:component this={getWinnerIcon(sortedParticipants.indexOf(participant) + 1)} class="h-5 w-5" />
								{:else}
									<span class="font-bold text-sm">#{sortedParticipants.indexOf(participant) + 1}</span>
								{/if}
							</div>
							<span class="text-xs text-muted-foreground mt-1">
								{sortedParticipants.indexOf(participant) + 1}{sortedParticipants.indexOf(participant) === 0 ? 'st' : sortedParticipants.indexOf(participant) === 1 ? 'nd' : sortedParticipants.indexOf(participant) === 2 ? 'rd' : 'th'}
							</span>
						</div>

						<!-- Participant Info -->
						<div class="flex items-center gap-3 flex-1">
							{#if participant.user?.avatar_url}
								<img
									src={participant.user.avatar_url}
									alt={participant.user.username}
									class="h-10 w-10 rounded-full border-2 border-border/40"
								/>
							{:else}
								<div class="h-10 w-10 rounded-full bg-surface-muted flex items-center justify-center border-2 border-border/40">
									<Users class="h-5 w-5 text-muted-foreground" />
								</div>
							{/if}
							<div class="flex-1">
								<div class="flex items-center gap-2">
									<p class="font-semibold text-foreground">{participant.user?.username}</p>
									{#if isBattleComplete && winner?.user_id === participant.user_id}
										<Badge variant="default" class="gap-1 animate-bounce">
											<Crown class="h-3 w-3" />
											Winner
										</Badge>
									{/if}
								</div>
								<p class="text-sm text-muted-foreground">Player {participant.position}</p>
							</div>
						</div>

						<!-- Total Value -->
						<div class="text-right">
							<p class="text-sm text-muted-foreground">Total Value</p>
							<p class="text-xl font-bold {sortedParticipants.indexOf(participant) === 0 ? 'text-emerald-400' : 'text-foreground'}">
								{formatCurrency(participant.total)}
							</p>
							{#if sortedParticipants.indexOf(participant) > 0}
								<p class="text-xs text-muted-foreground">
									-{formatCurrency(highestTotal - participant.total)}
								</p>
							{/if}
						</div>
					</div>

					<!-- Progress Bar -->
					<div class="px-2">
						<Progress
							value={getProgressPercentage(participant.total)}
							class="h-2 {sortedParticipants.indexOf(participant) === 0 ? 'bg-primary/20' : 'bg-surface-muted/50'}"
						/>
					</div>
				</div>
			{/each}
		</div>

		{#if sortedParticipants.length === 0}
			<!-- Empty State -->
			<div class="text-center py-8 text-muted-foreground">
				<Trophy class="h-12 w-12 mx-auto mb-3 opacity-50" />
				<p>No totals yet</p>
				<p class="text-sm">Wait for the first round to complete</p>
			</div>
		{:else if !isBattleComplete}
			<!-- Battle Status -->
			<div class="flex items-center justify-between p-3 bg-surface/50 border border-border/40 rounded-lg">
				<div class="flex items-center gap-2 text-sm text-muted-foreground">
					<TrendingUp class="h-4 w-4" />
					<span>Battle in Progress</span>
				</div>
				<div class="text-sm text-muted-foreground">
					{battle?.current_round || 0} of {battle?.rounds_count || 0} rounds complete
				</div>
			</div>
		{:else}
			<!-- Battle Complete -->
			<div bind:this={winnerElement} class="flex items-center gap-3 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
				<CheckCircle class="h-5 w-5 text-emerald-400" />
				<div class="flex-1">
					<p class="font-semibold text-emerald-400">Battle Complete!</p>
					<p class="text-sm text-muted-foreground">
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
				<p class="font-semibold text-foreground">{battle?.participants?.length || 0}</p>
			</div>
			<div>
				<p class="text-muted-foreground">Mode</p>
				<p class="font-semibold capitalize text-foreground">{battle?.mode || 'standard'}</p>
			</div>
			<div>
				<p class="text-muted-foreground">Rounds</p>
				<p class="font-semibold text-foreground">{battle?.rounds_count || 0}</p>
			</div>
			<div>
				<p class="text-muted-foreground">Avg. Total</p>
				<p class="font-semibold text-foreground">
					{sortedParticipants.length > 0
						? formatCurrency(sortedParticipants.reduce((sum, p) => sum + p.total, 0) / sortedParticipants.length)
						: formatCurrency(0)
					}
				</p>
			</div>
		</div>
	</CardContent>
</Card>

