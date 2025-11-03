<script lang="ts">
	// ✅ FIXED: Use $effect instead of onMount
	import { goto } from '$app/navigation';
	import { Badge, Button, Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui';
	import {
		Loader2,
		Users,
		Trophy,
		Clock,
		Lock,
		Unlock,
		Gift,
		Eye,
		ArrowLeft
	} from '@lucide/svelte';
	import { api } from '$lib/api/client';
	import type { Pot, PotDetails, PotEntry } from '$lib/types';

	let potDetails = $state<PotDetails | null>(null);
	let loading = $state(true);
	let error = $state<string | null>(null);
	let isJoining = $state(false);
	let isLocking = $state(false);
	let isSettling = $state(false);

	// Get pot ID from URL params
	let potId = $state('');

	$effect(() => {
		// Extract pot ID from URL
		const pathParts = window.location.pathname.split('/');
		potId = pathParts[pathParts.length - 1];

		if (potId) {
			loadPotDetails();
		}
	});

	async function loadPotDetails() {
		try {
			loading = true;
			error = null;

			potDetails = await api.pots.get(potId);
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to load pot details';
		} finally {
			loading = false;
		}
	}

	async function handleJoinPot(ticketCount: number) {
		if (!potDetails) return;

		try {
			isJoining = true;
			await api.pots.join(potId, { ticketCount });
			await loadPotDetails(); // Refresh pot details
		} catch (err) {
			alert(err instanceof Error ? err.message : 'Failed to join pot');
		} finally {
			isJoining = false;
		}
	}

	async function handleLockPot() {
		if (!potDetails) return;

		try {
			isLocking = true;
			await api.pots.lock(potId);
			await loadPotDetails(); // Refresh pot details
		} catch (err) {
			alert(err instanceof Error ? err.message : 'Failed to lock pot');
		} finally {
			isLocking = false;
		}
	}

	async function handleSettlePot() {
		if (!potDetails) return;

		try {
			isSettling = true;
			await api.pots.settle(potId);
			await loadPotDetails(); // Refresh pot details
		} catch (err) {
			alert(err instanceof Error ? err.message : 'Failed to settle pot');
		} finally {
			isSettling = false;
		}
	}

	function getStatusColor(status: string) {
		switch (status) {
			case 'open':
				return 'bg-green-500/20 text-green-300 border-green-500/30';
			case 'locked':
				return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
			case 'settling':
				return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
			case 'settled':
				return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
			default:
				return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
		}
	}

	function getStatusText(status: string) {
		switch (status) {
			case 'open':
				return 'Open for Entries';
			case 'locked':
				return 'Locked - No More Entries';
			case 'settling':
				return 'Settling - Determining Winner';
			case 'settled':
				return 'Settled - Winner Selected';
			default:
				return status;
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
</script>

<svelte:head>
	<title>{potDetails?.pot.name || 'Pot Details'} - TopRoll</title>
	<meta name="description" content="View pot details and join community pots" />
</svelte:head>

<main class="mx-auto min-h-screen max-w-7xl px-6 py-8 md:px-10">
	<div class="mb-8">
		<Button variant="ghost" class="mb-4 gap-2" onclick={() => goto('/pots')}>
			<ArrowLeft class="h-4 w-4" />
			Back to Pots
		</Button>

		{#if loading}
			<div class="flex items-center gap-3">
				<Loader2 class="h-6 w-6 animate-spin" />
				<span class="text-lg">Loading pot details...</span>
			</div>
		{:else if error}
			<div class="text-center">
				<p class="mb-4 text-lg font-semibold text-red-500">Error</p>
				<p class="text-muted-foreground">{error}</p>
				<Button onclick={loadPotDetails}>Try Again</Button>
			</div>
		{:else if potDetails}
			<div class="space-y-8">
				<!-- Pot Header -->
				<div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
					<div>
						<h1 class="text-foreground text-3xl font-bold md:text-4xl">{potDetails.pot.name}</h1>
						<p class="text-muted-foreground mt-2 text-lg">{potDetails.pot.description}</p>
						<div class="mt-4 flex items-center gap-3">
							<Badge
								class={`text-sm font-semibold ${getStatusColor(potDetails.pot.status)} border`}
							>
								{getStatusText(potDetails.pot.status)}
							</Badge>
							<div class="text-muted-foreground flex items-center gap-2 text-sm">
								<Clock class="h-4 w-4" />
								<span>Created: {formatDate(potDetails.pot.created_at)}</span>
							</div>
						</div>
					</div>

					<div class="flex flex-col gap-4 md:flex-row md:items-end">
						<div class="text-right">
							<p class="text-muted-foreground text-sm">Total Pot Value</p>
							<p class="text-foreground text-3xl font-bold">
								{formatCurrency(potDetails.pot.total_value)}
							</p>
						</div>

						{#if potDetails.pot.status === 'open'}
							<Button
								class="bg-primary text-primary-foreground"
								onclick={() => handleJoinPot(1)}
								disabled={isJoining}
							>
								{#if isJoining}
									<Loader2 class="mr-2 h-4 w-4 animate-spin" />
								{/if}
								Join Pot (1 Ticket)
							</Button>
						{:else if potDetails.pot.status === 'locked'}
							<Button variant="outline" onclick={handleLockPot} disabled={isLocking}>
								{#if isLocking}
									<Loader2 class="mr-2 h-4 w-4 animate-spin" />
								{/if}
								Lock Pot
							</Button>
						{:else if potDetails.pot.status === 'settling'}
							<Button variant="outline" onclick={handleSettlePot} disabled={isSettling}>
								{#if isSettling}
									<Loader2 class="mr-2 h-4 w-4 animate-spin" />
								{/if}
								Settle Pot
							</Button>
						{/if}
					</div>
				</div>

				<!-- Pot Stats -->
				<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
					<Card class="border-border/60 bg-surface/70 border">
						<CardContent class="flex items-center gap-3 p-4">
							<Users class="text-muted-foreground h-5 w-5" />
							<div>
								<p class="text-muted-foreground text-xs tracking-wide uppercase">Total Tickets</p>
								<p class="text-foreground text-lg font-semibold">
									{potDetails.pot.total_tickets}/{potDetails.pot.max_tickets}
								</p>
							</div>
						</CardContent>
					</Card>

					<Card class="border-border/60 bg-surface/70 border">
						<CardContent class="flex items-center gap-3 p-4">
							<Gift class="text-muted-foreground h-5 w-5" />
							<div>
								<p class="text-muted-foreground text-xs tracking-wide uppercase">Entry Cost</p>
								<p class="text-foreground text-lg font-semibold">
									{formatCurrency(potDetails.pot.entry_cost)}
								</p>
							</div>
						</CardContent>
					</Card>

					<Card class="border-border/60 bg-surface/70 border">
						<CardContent class="flex items-center gap-3 p-4">
							<Trophy class="text-muted-foreground h-5 w-5" />
							<div>
								<p class="text-muted-foreground text-xs tracking-wide uppercase">Fill Progress</p>
								<p class="text-foreground text-lg font-semibold">
									{potDetails.pot.fill_percent ? potDetails.pot.fill_percent.toFixed(1) : '0.0'}%
								</p>
							</div>
						</CardContent>
					</Card>

					<Card class="border-border/60 bg-surface/70 border">
						<CardContent class="flex items-center gap-3 p-4">
							<Lock class="text-muted-foreground h-5 w-5" />
							<div>
								<p class="text-muted-foreground text-xs tracking-wide uppercase">Max Per User</p>
								<p class="text-foreground text-lg font-semibold">
									{potDetails.pot.max_per_user} tickets
								</p>
							</div>
						</CardContent>
					</Card>
				</div>

				<!-- Progress Bar -->
				<div class="w-full">
					<div class="mb-2 flex justify-between text-sm">
						<span class="text-muted-foreground">Progress</span>
						<span class="text-muted-foreground"
							>{potDetails.pot.total_tickets}/{potDetails.pot.max_tickets} tickets</span
						>
					</div>
					<div class="bg-surface-muted h-2 w-full rounded-full">
						<div
							class="bg-primary h-2 rounded-full transition-all duration-300"
							style="width: {potDetails.pot.fill_percent ?? 0}%"
						></div>
					</div>
				</div>

				<!-- Entries -->
				<div class="space-y-4">
					<h2 class="text-foreground text-2xl font-semibold">
						Entries ({potDetails.entries.length})
					</h2>

					{#if potDetails.entries.length === 0}
						<div class="border-border/40 bg-surface/30 rounded-lg p-8 text-center">
							<Eye class="text-muted-foreground mx-auto mb-4 h-8 w-8" />
							<p class="text-muted-foreground">No entries yet. Be the first to join!</p>
						</div>
					{:else}
						<div class="space-y-2">
							{#each potDetails.entries as entry (entry.id)}
								<Card class="border-border/60 bg-surface/70 border">
									<CardContent class="flex items-center justify-between p-4">
										<div class="flex items-center gap-3">
											<img
												src={entry.user?.avatar_url}
												alt={entry.user?.username}
												class="h-10 w-10 rounded-full object-cover"
											/>
											<div>
												<p class="text-foreground font-medium">{entry.user?.username}</p>
												<p class="text-muted-foreground text-sm">
													{entry.ticket_count} tickets ({formatCurrency(entry.credits_spent)})
												</p>
											</div>
										</div>

										<div class="text-right">
											<p class="text-muted-foreground text-sm">Tickets</p>
											<p class="text-foreground font-semibold">
												{entry.ticket_start_index}-{entry.ticket_end_index}
											</p>
										</div>
									</CardContent>
								</Card>
							{/each}
						</div>
					{/if}
				</div>

				<!-- Winner Information -->
				{#if potDetails.pot.status === 'settled' && potDetails.winner_entry}
					<div class="border-warning/20 bg-warning/5 rounded-lg p-6">
						<h2 class="text-warning-foreground mb-4 text-2xl font-semibold">🎉 Winner</h2>
						<div class="flex items-center gap-4">
							<img
								src={potDetails.winner_entry.user?.avatar_url}
								alt={potDetails.winner_entry.user?.username}
								class="h-16 w-16 rounded-full object-cover"
							/>
							<div>
								<p class="text-foreground text-lg font-medium">
									{potDetails.winner_entry.user?.username}
								</p>
								<p class="text-muted-foreground">
									Won with ticket #{potDetails.pot.winner_ticket_index}
								</p>
								<p class="text-foreground font-semibold">
									Prize: {formatCurrency(potDetails.pot.total_value)}
								</p>
							</div>
						</div>
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
