<script lang="ts">
	// ✅ FIXED: Use $effect instead of onMount
	import { goto } from '$app/navigation';
	import { Badge, Button, Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui';
	import { Loader2, Users, Trophy, Clock, Play, Eye, ArrowLeft, Swords, Zap } from '@lucide/svelte';
	import { api } from '$lib/api/client';
	import type { BattleDetails, BattleResult } from '$lib/types';

	let battleDetails = $state<BattleDetails | null>(null);
	let loading = $state(true);
	let error = $state<string | null>(null);
	let isJoining = $state(false);
	let isSimulating = $state(false);

	// Get battle ID from URL params
	let battleId = $state('');

	$effect(() => {
		// Extract battle ID from URL
		const pathParts = window.location.pathname.split('/');
		battleId = pathParts[pathParts.length - 1];

		if (battleId) {
			loadBattleDetails();
		}
	});

	async function loadBattleDetails() {
		try {
			loading = true;
			error = null;

			battleDetails = await api.battles.get(battleId);
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to load battle details';
		} finally {
			loading = false;
		}
	}

	async function handleJoinBattle() {
		if (!battleDetails) return;

		try {
			isJoining = true;
			await api.battles.join(battleId);
			await loadBattleDetails(); // Refresh battle details
		} catch (err) {
			alert(err instanceof Error ? err.message : 'Failed to join battle');
		} finally {
			isJoining = false;
		}
	}

	async function handleSimulateBattle() {
		if (!battleDetails) return;

		try {
			isSimulating = true;
			await api.battles.simulate(battleId);
			await loadBattleDetails(); // Refresh battle details
		} catch (err) {
			alert(err instanceof Error ? err.message : 'Failed to simulate battle');
		} finally {
			isSimulating = false;
		}
	}

	function getStatusColor(status: string) {
		switch (status) {
			case 'waiting':
				return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
			case 'locking':
				return 'bg-orange-500/20 text-orange-300 border-orange-500/30';
			case 'in_progress':
				return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
			case 'completed':
				return 'bg-green-500/20 text-green-300 border-green-500/30';
			default:
				return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
		}
	}

	function getStatusText(status: string) {
		switch (status) {
			case 'waiting':
				return 'Waiting for Players';
			case 'locking':
				return 'Starting Soon';
			case 'in_progress':
				return 'In Progress';
			case 'completed':
				return 'Completed';
			default:
				return status;
		}
	}

	function getModeColor(mode: string) {
		switch (mode) {
			case 'standard':
				return 'bg-primary/20 text-primary border-primary/30';
			case 'crazy':
				return 'bg-orange-500/20 text-orange-300 border-orange-500/30';
			default:
				return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
		}
	}

	function getModeText(mode: string) {
		switch (mode) {
			case 'standard':
				return 'Standard (Highest Value Wins)';
			case 'crazy':
				return 'Crazy (Lowest Value Wins)';
			default:
				return mode;
		}
	}

	function formatCurrency(amount: number) {
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: 'USD',
			minimumFractionDigits: 2,
			maximumFractionDigits: 2
		}).format(amount);
	}

	function formatDate(dateString: string) {
		return new Date(dateString).toLocaleString();
	}

	function getRarityColor(rarity: string) {
		switch (rarity) {
			case 'Common':
				return 'bg-surface-muted text-surface-muted-foreground border-border/70';
			case 'Uncommon':
				return 'bg-secondary/20 text-secondary-foreground border-secondary/60';
			case 'Rare':
				return 'bg-primary/15 text-primary border-primary/50';
			case 'Epic':
				return 'bg-accent/20 text-accent-foreground border-accent/50';
			case 'Legendary':
				return 'bg-warning/20 text-warning-foreground border-warning/55';
			case 'Contraband':
				return 'bg-destructive/20 text-destructive-foreground border-destructive/60';
			default:
				return 'bg-surface-muted text-surface-muted-foreground border-border/70';
		}
	}
</script>

<svelte:head>
	<title>{battleDetails?.battle.case?.name || 'Battle Details'} - TopRoll</title>
	<meta name="description" content="View battle details and participate in case battles" />
</svelte:head>

<main class="mx-auto min-h-screen max-w-7xl px-6 py-8 md:px-10">
	<div class="mb-8">
		<Button variant="ghost" class="mb-4 gap-2" onclick={() => goto('/battles')}>
			<ArrowLeft class="h-4 w-4" />
			Back to Battles
		</Button>

		{#if loading}
			<div class="flex items-center gap-3">
				<Loader2 class="h-6 w-6 animate-spin" />
				<span class="text-lg">Loading battle details...</span>
			</div>
		{:else if error}
			<div class="text-center">
				<p class="mb-4 text-lg font-semibold text-red-500">Error</p>
				<p class="text-muted-foreground">{error}</p>
				<Button onclick={loadBattleDetails}>Try Again</Button>
			</div>
		{:else if battleDetails}
			<div class="space-y-8">
				<!-- Battle Header -->
				<div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
					<div>
						<h1 class="text-foreground text-3xl font-bold md:text-4xl">
							{battleDetails.battle.case?.name} Battle
						</h1>
						<div class="mt-2 flex items-center gap-3">
							<Badge
								class={`text-sm font-semibold ${getStatusColor(battleDetails.battle.status)} border`}
							>
								{getStatusText(battleDetails.battle.status)}
							</Badge>
							<Badge
								class={`text-sm font-semibold ${getModeColor(battleDetails.battle.mode)} border`}
							>
								{getModeText(battleDetails.battle.mode)}
							</Badge>
							<div class="text-muted-foreground flex items-center gap-2 text-sm">
								<Clock class="h-4 w-4" />
								<span>Created: {formatDate(battleDetails.battle.created_at)}</span>
							</div>
						</div>
					</div>

					<div class="flex flex-col gap-4 md:flex-row md:items-end">
						<div class="text-right">
							<p class="text-muted-foreground text-sm">Total Pot</p>
							<p class="text-foreground text-3xl font-bold">
								{formatCurrency(battleDetails.battle.total_pot)}
							</p>
						</div>

						{#if battleDetails.battle.status === 'waiting'}
							<Button
								class="bg-primary text-primary-foreground"
								onclick={handleJoinBattle}
								disabled={isJoining}
							>
								{#if isJoining}
									<Loader2 class="mr-2 h-4 w-4 animate-spin" />
								{/if}
								Join Battle ({formatCurrency(battleDetails.battle.entry_fee)})
							</Button>
						{:else if battleDetails.battle.status === 'in_progress'}
							<Button variant="outline" onclick={handleSimulateBattle} disabled={isSimulating}>
								{#if isSimulating}
									<Loader2 class="mr-2 h-4 w-4 animate-spin" />
								{/if}
								Simulate Battle
							</Button>
						{:else if battleDetails.battle.status === 'completed'}
							<Button variant="outline" disabled>
								<Trophy class="mr-2 h-4 w-4" />
								Battle Completed
							</Button>
						{/if}
					</div>
				</div>

				<!-- Battle Stats -->
				<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
					<Card class="border-border/60 bg-surface/70 border">
						<CardContent class="flex items-center gap-3 p-4">
							<Users class="text-muted-foreground h-5 w-5" />
							<div>
								<p class="text-muted-foreground text-xs tracking-wide uppercase">Participants</p>
								<p class="text-foreground text-lg font-semibold">
									{battleDetails.battle.current_participants}/{battleDetails.battle
										.max_participants}
								</p>
							</div>
						</CardContent>
					</Card>

					<Card class="border-border/60 bg-surface/70 border">
						<CardContent class="flex items-center gap-3 p-4">
							<Swords class="text-muted-foreground h-5 w-5" />
							<div>
								<p class="text-muted-foreground text-xs tracking-wide uppercase">Entry Fee</p>
								<p class="text-foreground text-lg font-semibold">
									{formatCurrency(battleDetails.battle.entry_fee)}
								</p>
							</div>
						</CardContent>
					</Card>

					<Card class="border-border/60 bg-surface/70 border">
						<CardContent class="flex items-center gap-3 p-4">
							<Zap class="text-muted-foreground h-5 w-5" />
							<div>
								<p class="text-muted-foreground text-xs tracking-wide uppercase">Rounds</p>
								<p class="text-foreground text-lg font-semibold">
									{battleDetails.battle.current_round}/{battleDetails.battle.rounds_count}
								</p>
							</div>
						</CardContent>
					</Card>

					<Card class="border-border/60 bg-surface/70 border">
						<CardContent class="flex items-center gap-3 p-4">
							<Trophy class="text-muted-foreground h-5 w-5" />
							<div>
								<p class="text-muted-foreground text-xs tracking-wide uppercase">Mode</p>
								<p class="text-foreground text-lg font-semibold capitalize">
									{battleDetails.battle.mode}
								</p>
							</div>
						</CardContent>
					</Card>
				</div>

				<!-- Case Information -->
				{#if battleDetails.battle.case}
					<Card class="border-border/60 bg-surface/70 border">
						<CardHeader>
							<CardTitle class="flex items-center gap-3">
								<img
									src={battleDetails.battle.case.image_url}
									alt={battleDetails.battle.case.name}
									class="h-12 w-12 rounded-lg object-cover"
								/>
								<div>
									<h3 class="text-foreground text-lg font-semibold">
										{battleDetails.battle.case.name}
									</h3>
									<p class="text-muted-foreground text-sm">
										{battleDetails.battle.case.description}
									</p>
								</div>
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div class="flex items-center justify-between">
								<div>
									<p class="text-muted-foreground text-sm">Case Price</p>
									<p class="text-foreground font-semibold">
										{formatCurrency(battleDetails.battle.case.price)}
									</p>
								</div>
								<div>
									<p class="text-muted-foreground text-sm">Items in Case</p>
									<p class="text-foreground font-semibold">
										{battleDetails.battle.case.item_count}
									</p>
								</div>
							</div>
						</CardContent>
					</Card>
				{/if}

				<!-- Participants -->
				<div class="space-y-4">
					<h2 class="text-foreground text-2xl font-semibold">
						Participants ({battleDetails.participants.length})
					</h2>

					{#if battleDetails.participants.length === 0}
						<div class="border-border/40 bg-surface/30 rounded-lg p-8 text-center">
							<Users class="text-muted-foreground mx-auto mb-4 h-8 w-8" />
							<p class="text-muted-foreground">No participants yet. Be the first to join!</p>
						</div>
					{:else}
						<div class="grid gap-4 md:grid-cols-2">
							{#each battleDetails.participants as participant (participant.id)}
								<Card class="border-border/60 bg-surface/70 border">
									<CardContent class="flex items-center justify-between p-4">
										<div class="flex items-center gap-3">
											<img
												src={participant.user?.avatar_url}
												alt={participant.user?.username}
												class="h-10 w-10 rounded-full object-cover"
											/>
											<div>
												<p class="text-foreground font-medium">{participant.user?.username}</p>
												<p class="text-muted-foreground text-sm">
													Position #{participant.position}
												</p>
											</div>
										</div>

										<div class="text-right">
											<p class="text-muted-foreground text-sm">Joined</p>
											<p class="text-foreground font-semibold">
												{formatDate(participant.joined_at)}
											</p>
										</div>
									</CardContent>
								</Card>
							{/each}
						</div>
					{/if}
				</div>

				<!-- Battle Results -->
				{#if battleDetails.results && battleDetails.results.length > 0}
					<div class="space-y-4">
						<h2 class="text-foreground text-2xl font-semibold">Battle Results</h2>

						<div class="grid gap-4 md:grid-cols-2">
							{#each battleDetails.results as result (result.id)}
								<Card
									class={`border-border/60 bg-surface/70 border ${result.is_winner ? 'ring-warning/50 ring-2' : ''}`}
								>
									<CardContent class="p-4">
										<div class="mb-4 flex items-start justify-between">
											<div class="flex items-center gap-3">
												<img
													src={result.item?.image_url}
													alt={result.item?.name}
													class="h-12 w-12 rounded-lg object-cover"
												/>
												<div>
													<p class="text-foreground font-medium">{result.item?.name}</p>
													<p class="text-muted-foreground text-sm">{result.item?.market_name}</p>
													<Badge
														class={`text-xs font-semibold ${getRarityColor(result.item?.rarity || 'Common')} border`}
													>
														{result.item?.rarity}
													</Badge>
												</div>
											</div>

											<div class="text-right">
												{#if result.is_winner}
													<div class="text-warning flex items-center gap-1">
														<Trophy class="h-4 w-4" />
														<span class="font-semibold">Winner</span>
													</div>
												{/if}
											</div>
										</div>

										<div class="flex items-center justify-between">
											<div>
												<p class="text-muted-foreground text-sm">Market Value</p>
												<p class="text-foreground font-semibold">
													{formatCurrency(result.total_value)}
												</p>
											</div>

											<div class="text-right">
												<p class="text-muted-foreground text-sm">Participant</p>
												<p class="text-foreground font-medium">
													{result.participant?.user?.username}
												</p>
											</div>
										</div>
									</CardContent>
								</Card>
							{/each}
						</div>
					</div>
				{/if}

				<!-- Winner Information -->
				{#if battleDetails.battle.status === 'completed' && battleDetails.battle.winner_id}
					<div class="border-warning/20 bg-warning/5 rounded-lg p-6">
						<h2 class="text-warning-foreground mb-4 text-2xl font-semibold">🎉 Battle Winner</h2>
						{#each battleDetails.participants as participant}
							{#if participant.user_id === battleDetails.battle.winner_id}
								<div class="flex items-center gap-4">
									<img
										src={participant.user?.avatar_url}
										alt={participant.user?.username}
										class="h-16 w-16 rounded-full object-cover"
									/>
									<div>
										<p class="text-foreground text-lg font-medium">{participant.user?.username}</p>
										<p class="text-muted-foreground">Position #{participant.position}</p>
										<p class="text-foreground font-semibold">
											Prize: {formatCurrency(battleDetails.battle.total_pot)}
										</p>
									</div>
								</div>
							{/if}
						{/each}
					</div>
				{/if}
			</div>
		{/if}
	</div>
</main>

<style>
	main {
		background: var(--gradient-primary);
	}
</style>
