<script lang="ts">
	// ✅ FIXED: Use $effect instead of onMount
	import { CommunityPotsGrid, PotEntryModal } from '$lib/features/pots';
	import { api } from '$lib/api/client';
	import type { Pot } from '$lib/types/index';

	let pots = $state<Pot[]>([]);
	let loading = $state(true);
	let error = $state<string | null>(null);
	let selectedPot = $state<Pot | null>(null);
	let showEntryModal = $state(false);
	let filter = $state('all');
	let userBalance = $state(0);

	$effect(() => {
		loadPots();
		loadUserBalance();
	});

	async function loadUserBalance() {
		try {
			const profile = await api.auth.getProfile();
			if (profile) {
				userBalance = profile.balance || 0;
			}
		} catch (err) {
			console.error('Failed to load user balance:', err);
		}
	}

	async function loadPots() {
		try {
			loading = true;
			error = null;

			const statusFilters = filter === 'all' ? ['open', 'locked'] : [filter];
			pots = await api.pots.list({ status: statusFilters });
		} catch (err) {
			error = err instanceof Error ? err.message : 'Unknown error';
		} finally {
			loading = false;
		}
	}

	function handleJoinPot(potId: string) {
		selectedPot = pots.find((p) => p.id === potId) || null;
		showEntryModal = true;
	}

	function handleViewPot(potId: string) {
		// Navigate to pot detail page (create if needed)
		window.location.href = `/pots/${potId}`;
	}

	async function handleEntrySubmit(ticketCount: number) {
		if (!selectedPot) return;

		try {
			await api.pots.join(selectedPot.id, { ticketCount });
			showEntryModal = false;
			await loadPots();
			await loadUserBalance(); // Refresh balance after joining
		} catch (err) {
			alert(err instanceof Error ? err.message : 'Failed to join pot');
		}
	}

	function handleFilterChange(newFilter: string) {
		filter = newFilter;
		loadPots();
	}

	function handleCreatePot() {
		// Navigate to create pot page or open modal
		window.location.href = '/pots/create';
	}
</script>

<svelte:head>
	<title>Community Pots - TopRoll</title>
	<meta
		name="description"
		content="Join community pots and win CS2 skins with provably fair selection"
	/>
</svelte:head>

<main class="bg-surface mx-auto min-h-screen max-w-7xl px-6 py-8 md:px-10">
	<div class="mb-8">
		<h1 class="text-display mb-2 text-4xl font-bold">Community Pots</h1>
		<p class="text-muted-foreground text-lg">
			Join pots, buy tickets, and win CS2 skins with provably fair selection
		</p>
	</div>

	<CommunityPotsGrid
		{pots}
		{loading}
		error={error || undefined}
		{filter}
		onFilterChange={handleFilterChange}
		onRefresh={loadPots}
		onCreatePot={handleCreatePot}
		onJoinPot={handleJoinPot}
		onViewPot={handleViewPot}
		showCreateButton={true}
		class="mb-8"
	/>
</main>

{#if showEntryModal && selectedPot}
	<PotEntryModal
		pot={selectedPot}
		isOpen={showEntryModal}
		{userBalance}
		onClose={() => (showEntryModal = false)}
		onSubmit={handleEntrySubmit}
	/>
{/if}

<style>
	main {
		background: oklch(var(--gradient-primary));
	}
</style>
