<script lang="ts">
	// ✅ FIXED: Use $effect instead of onMount
	import { Badge, Button, Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui';
	import { Input } from '$lib/components/ui/input';
	import { BattleCreateDialog } from '$lib/features/battles';
	import {
		Search,
		Filter,
		Plus,
		RefreshCw,
		Swords,
		Users,
		Trophy,
		Zap,
		Shield,
		Clock,
		Eye,
		Play
	} from '@lucide/svelte';
	import { api } from '$lib/api/client';

	let battles = $state<any[]>([]);
	let loading = $state(true);
	let error = $state<string | null>(null);
	let searchQuery = $state('');
	let selectedFilter = $state('all');
	let selectedMode = $state('all');
	let showCreateDialog = $state(false);
	let userBalance = $state(0);

	$effect(() => {
		loadBattles();
		loadUserBalance();
	});

	async function loadBattles() {
		try {
			loading = true;
			error = null;

			battles = await api.battles.list({
				status: selectedFilter !== 'all' ? selectedFilter : undefined,
				mode: selectedMode !== 'all' ? selectedMode : undefined
			});
		} catch (err) {
			error = err instanceof Error ? err.message : 'Unknown error';
		} finally {
			loading = false;
		}
	}

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

	const filters = [
		{ id: 'all', label: 'All Battles' },
		{ id: 'waiting', label: 'Waiting' },
		{ id: 'in_progress', label: 'In Progress' },
		{ id: 'completed', label: 'Completed' }
	];

	const modes = [
		{ id: 'all', label: 'All Modes' },
		{ id: 'standard', label: 'Standard' },
		{ id: 'crazy', label: 'Crazy' }
	];

	const filteredBattles = $derived(() => {
		let filtered = battles;

		// Filter by search query
		if (searchQuery) {
			filtered = filtered.filter(
				(battle) =>
					battle.case?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
					battle.mode?.toLowerCase().includes(searchQuery.toLowerCase())
			);
		}

		// Filter by status
		if (selectedFilter !== 'all') {
			filtered = filtered.filter((battle) => battle.status === selectedFilter);
		}

		// Filter by mode
		if (selectedMode !== 'all') {
			filtered = filtered.filter((battle) => battle.mode === selectedMode);
		}

		return filtered;
	});

	const stats = $derived(() => {
		const totalBattles = battles.length;
		const waitingBattles = battles.filter((battle) => battle.status === 'waiting').length;
		const activeBattles = battles.filter((battle) => battle.status === 'in_progress').length;
		const totalPot = battles.reduce((sum, battle) => sum + (battle.total_pot || 0), 0);

		return { totalBattles, waitingBattles, activeBattles, totalPot };
	});

	const formatCurrency = (amount: number) => {
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: 'USD',
			minimumFractionDigits: 2,
			maximumFractionDigits: 2
		}).format(amount);
	};

	const getStatusColor = (status: string) => {
		switch (status) {
			case 'waiting':
				return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
			case 'in_progress':
				return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
			case 'completed':
				return 'bg-green-500/20 text-green-300 border-green-500/30';
			default:
				return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
		}
	};

	const getModeColor = (mode: string) => {
		switch (mode) {
			case 'standard':
				return 'bg-primary/20 text-primary border-primary/30';
			case 'crazy':
				return 'bg-orange-500/20 text-orange-300 border-orange-500/30';
			default:
				return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
		}
	};

	const handleJoinBattle = async (battleId: string) => {
		try {
			await api.battles.join(battleId);
			// Navigate to battle room
			window.location.href = `/battles/${battleId}`;
		} catch (err) {
			alert(err instanceof Error ? err.message : 'Failed to join battle');
		}
	};

	const handleViewBattle = (battleId: string) => {
		window.location.href = `/battles/${battleId}`;
	};

	const handleCreateBattle = () => {
		showCreateDialog = true;
	};

	const handleRefresh = () => {
		loadBattles();
	};

	const handleBattleCreated = () => {
		showCreateDialog = false;
		loadBattles();
		loadUserBalance(); // Refresh balance after creating battle
	};

	const handleFilterChange = () => {
		loadBattles();
	};

	// Watch for filter changes
	$effect(() => {
		handleFilterChange();
	});
</script>

<svelte:head>
	<title>Case Battles - TopRoll</title>
	<meta
		name="description"
		content="Join case battles and compete against other players for CS2 skins"
	/>
</svelte:head>

<div class="bg-surface space-y-8">
	<!-- Header -->
	<header class="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
		<div class="space-y-3">
			<Badge variant="outline" class="w-fit">Competitive Gaming</Badge>
			<h1 class="text-display text-3xl font-semibold md:text-4xl">Case Battles</h1>
			<p class="text-muted-foreground max-w-2xl text-sm">
				Compete against other players in case battles. Open cases and compete for the highest value
				items.
			</p>
		</div>
		<div class="flex flex-wrap gap-3">
			<Button variant="outline" class="gap-2" onclick={handleRefresh}>
				<RefreshCw class="h-4 w-4" />
				Refresh
			</Button>
			<Button class="gap-2" onclick={handleCreateBattle}>
				<Plus class="h-4 w-4" />
				Create Battle
			</Button>
		</div>
	</header>

	<!-- Stats Cards -->
	<section class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
		<Card class="border-border/60 bg-surface/70 border">
			<CardContent class="flex items-center gap-3 p-4">
				<div
					class="border-primary/50 bg-primary/15 text-primary flex h-8 w-8 items-center justify-center rounded-md border"
				>
					<Swords class="h-4 w-4" />
				</div>
				<div>
					<p class="text-muted-foreground text-xs tracking-wide uppercase">Total Battles</p>
					<p class="text-foreground text-lg font-semibold">{stats().totalBattles}</p>
				</div>
			</CardContent>
		</Card>

		<Card class="border-border/60 bg-surface/70 border">
			<CardContent class="flex items-center gap-3 p-4">
				<div
					class="border-warning/50 bg-warning/15 text-warning flex h-8 w-8 items-center justify-center rounded-md border"
				>
					<Clock class="h-4 w-4" />
				</div>
				<div>
					<p class="text-muted-foreground text-xs tracking-wide uppercase">Waiting</p>
					<p class="text-foreground text-lg font-semibold">{stats().waitingBattles}</p>
				</div>
			</CardContent>
		</Card>

		<Card class="border-border/60 bg-surface/70 border">
			<CardContent class="flex items-center gap-3 p-4">
				<div
					class="border-success/50 bg-success/15 text-success flex h-8 w-8 items-center justify-center rounded-md border"
				>
					<Zap class="h-4 w-4" />
				</div>
				<div>
					<p class="text-muted-foreground text-xs tracking-wide uppercase">Active</p>
					<p class="text-foreground text-lg font-semibold">{stats().activeBattles}</p>
				</div>
			</CardContent>
		</Card>

		<Card class="border-border/60 bg-surface/70 border">
			<CardContent class="flex items-center gap-3 p-4">
				<div
					class="border-secondary/50 bg-secondary/15 text-secondary flex h-8 w-8 items-center justify-center rounded-md border"
				>
					<Trophy class="h-4 w-4" />
				</div>
				<div>
					<p class="text-muted-foreground text-xs tracking-wide uppercase">Total Pot</p>
					<p class="text-foreground text-lg font-semibold">{formatCurrency(stats().totalPot)}</p>
				</div>
			</CardContent>
		</Card>
	</section>

	<!-- Search and Filters -->
	<section class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
		<div class="flex flex-1 flex-col gap-4 sm:flex-row sm:items-center">
			<!-- Search -->
			<div class="relative max-w-md flex-1">
				<Search class="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
				<Input type="text" placeholder="Search battles..." bind:value={searchQuery} class="pl-9" />
			</div>

			<!-- Status Filter -->
			<select
				bind:value={selectedFilter}
				class="border-border/60 bg-surface/70 text-foreground rounded-lg border px-3 py-2 text-sm"
			>
				{#each filters as filter}
					<option value={filter.id}>{filter.label}</option>
				{/each}
			</select>

			<!-- Mode Filter -->
			<select
				bind:value={selectedMode}
				class="border-border/60 bg-surface/70 text-foreground rounded-lg border px-3 py-2 text-sm"
			>
				{#each modes as mode}
					<option value={mode.id}>{mode.label}</option>
				{/each}
			</select>
		</div>
	</section>

	<!-- Battles Grid -->
	<section class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
		{#each filteredBattles() as battle}
			<Card class="border-border/60 bg-surface/70 hover:border-border transition-all duration-200">
				<CardHeader class="pb-3">
					<div class="flex items-start justify-between">
						<div class="space-y-2">
							<h3 class="text-foreground text-lg font-semibold">{battle.case?.name}</h3>
							<div class="flex items-center gap-2">
								<Badge class={`text-xs font-semibold ${getStatusColor(battle.status)} border`}>
									{battle.status.replace('_', ' ').toUpperCase()}
								</Badge>
								<Badge
									class={`text-xs font-semibold ${getModeColor(battle.mode || 'standard')} border`}
								>
									{(battle.mode || 'standard').toUpperCase()}
								</Badge>
							</div>
						</div>
						<div class="text-right">
							<p class="text-foreground text-xl font-bold">
								{formatCurrency(battle.total_pot || 0)}
							</p>
							<p class="text-muted-foreground text-xs">Total Pot</p>
						</div>
					</div>
				</CardHeader>
				<CardContent class="space-y-4">
					<div class="flex items-center gap-3">
						<img
							src={battle.case?.image_url}
							alt={battle.case?.name}
							class="border-border/60 h-12 w-12 rounded-lg border object-cover"
						/>
						<div class="min-w-0 flex-1">
							<p class="text-foreground truncate text-sm font-medium">{battle.case?.name}</p>
						</div>
					</div>

					<div class="grid grid-cols-2 gap-4 text-sm">
						<div>
							<p class="text-muted-foreground text-xs">Entry Fee</p>
							<p class="text-foreground font-medium">{formatCurrency(battle.entry_fee || 0)}</p>
						</div>
						<div>
							<p class="text-muted-foreground text-xs">Players</p>
							<p class="text-foreground font-medium">
								{battle.current_participants || 0}/{battle.max_participants || 0}
							</p>
						</div>
					</div>

					<div class="grid grid-cols-2 gap-4 text-sm">
						<div>
							<p class="text-muted-foreground text-xs">Rounds</p>
							<p class="text-foreground font-medium">
								{battle.current_round || 0}/{battle.rounds_count || 0}
							</p>
						</div>
						<div>
							<p class="text-muted-foreground text-xs">Mode</p>
							<p class="text-foreground font-medium capitalize">{battle.mode || 'standard'}</p>
						</div>
					</div>

					<div class="flex gap-2 pt-2">
						{#if battle.status === 'waiting'}
							<Button size="sm" class="flex-1 gap-1" onclick={() => handleJoinBattle(battle.id)}>
								<Play class="h-3 w-3" />
								Join Battle
							</Button>
						{:else}
							<Button
								size="sm"
								variant="outline"
								class="flex-1 gap-1"
								onclick={() => handleViewBattle(battle.id)}
							>
								<Eye class="h-3 w-3" />
								{battle.status === 'completed' ? 'View Results' : 'Watch Battle'}
							</Button>
						{/if}
					</div>
				</CardContent>
			</Card>
		{/each}
	</section>

	<!-- Empty State -->
	{#if filteredBattles().length === 0}
		<div
			class="border-border/40 bg-surface/30 flex flex-col items-center gap-4 rounded-3xl border py-12 text-center"
		>
			<div class="text-muted-foreground text-lg font-semibold">No battles found</div>
			<p class="text-muted-foreground max-w-md">
				{#if searchQuery || selectedFilter !== 'all' || selectedMode !== 'all'}
					Try adjusting your search or filters to find battles.
				{:else}
					There are no active battles at the moment. Create a new one to get started!
				{/if}
			</p>
			{#if searchQuery || selectedFilter !== 'all' || selectedMode !== 'all'}
				<Button
					variant="outline"
					onclick={() => {
						searchQuery = '';
						selectedFilter = 'all';
						selectedMode = 'all';
					}}
				>
					Clear Filters
				</Button>
			{/if}
		</div>
	{/if}
</div>

<!-- Battle Create Dialog -->
{#if showCreateDialog}
	<BattleCreateDialog
		open={showCreateDialog}
		{userBalance}
		onOpenChange={(open) => (showCreateDialog = open)}
		onBattleCreated={handleBattleCreated}
	/>
{/if}

<style>
	:global(body) {
		background: linear-gradient(135deg, #0f0f23 0%, #1a1a2e 100%);
	}
</style>
