<script lang="ts">
	// ✅ FIXED: Use $effect instead of onMount
	import { Badge, Button, Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui';
	import { Input } from '$lib/components/ui/input';
	import {
		RefreshCw,
		Download,
		ShoppingCart,
		Upload,
		Settings,
		Filter,
		Search,
		Tag,
		DollarSign,
		SortAsc,
		SortDesc,
		Plus
	} from '@lucide/svelte';
	import { api } from '$lib/api/client';
	import type { CS2Item } from '$lib/types/index';

	let inventory = $state<CS2Item[]>([]);
	let loading = $state(true);
	let error = $state<string | null>(null);
	let searchQuery = $state('');
	let selectedRarity = $state('all');
	let selectedSort = $state('value');
	let showSyncModal = $state(false);
	let steamId = $state('');
	let userBalance = $state(0);
	let syncInProgress = $state(false);
	let totalValue = $state(0);

	const rarities = [
		{ id: 'all', label: 'All Rarities' },
		{ id: 'Common', label: 'Common' },
		{ id: 'Uncommon', label: 'Uncommon' },
		{ id: 'Rare', label: 'Rare' },
		{ id: 'Epic', label: 'Epic' },
		{ id: 'Legendary', label: 'Legendary' },
		{ id: 'Contraband', label: 'Contraband' }
	];

	const sortOptions = [
		{ id: 'value', label: 'Value: High to Low' },
		{ id: 'name', label: 'Name: A-Z' },
		{ id: 'rarity', label: 'Rarity' },
		{ id: 'type', label: 'Type' }
	];

	$effect(() => {
		loadUser();
		loadInventory();
	});

	async function loadUser() {
		try {
			const profile = await api.auth.getProfile();
			if (profile) {
				userBalance = profile.balance || 0;
				steamId = profile.steam_id || '';
			}
		} catch (err) {
			console.error('Failed to load user:', err);
		}
	}

	async function loadInventory() {
		try {
			loading = true;
			error = null;

			inventory = await api.inventory.listInventory();
			totalValue = inventory.reduce((sum, item) => sum + item.market_value, 0);
		} catch (err) {
			error = err instanceof Error ? err.message : 'Unknown error';
		} finally {
			loading = false;
		}
	}

	async function syncInventory() {
		if (!steamId) {
			error = 'Steam ID not found. Please link your Steam account.';
			return;
		}

		try {
			syncInProgress = true;

			const result = await api.inventory.syncInventory(steamId);
			if (!result.success) {
				throw new Error('Failed to sync inventory');
			}

			await loadInventory();
		} catch (err) {
			error = err instanceof Error ? err.message : 'Unknown error';
		} finally {
			syncInProgress = false;
			showSyncModal = false;
		}
	}

	function handleSearch() {
		// Filter inventory based on search query
		// This is a simple client-side filter for demonstration
	}

	function handleFilterChange() {
		// Filter inventory based on selected filters
		// This is a simple client-side filter for demonstration
	}

	function handleSortChange() {
		// Sort inventory based on selected sort option
		// This is a simple client-side sort for demonstration
	}

	function handleCreateListing(itemId: string) {
		window.location.href = `/marketplace/create?item=${itemId}`;
	}

	function formatCurrency(amount: number) {
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: 'USD',
			minimumFractionDigits: 2,
			maximumFractionDigits: 2
		}).format(amount);
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

	// Filter and sort inventory based on current filters
	const filteredInventory = $derived(() => {
		let filtered = [...inventory];

		// Filter by search query
		if (searchQuery) {
			filtered = filtered.filter(
				(item) =>
					item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
					item.market_name.toLowerCase().includes(searchQuery.toLowerCase())
			);
		}

		// Filter by rarity
		if (selectedRarity !== 'all') {
			filtered = filtered.filter((item) => item.rarity === selectedRarity);
		}

		// Sort based on selected option
		switch (selectedSort) {
			case 'value':
				filtered.sort((a, b) => b.market_value - a.market_value);
				break;
			case 'name':
				filtered.sort((a, b) => a.name.localeCompare(b.name));
				break;
			case 'rarity':
				filtered.sort((a, b) => a.rarity.localeCompare(b.rarity));
				break;
			case 'type':
				filtered.sort((a, b) => (a.type || '').localeCompare(b.type || ''));
				break;
		}

		return filtered;
	});
</script>

<svelte:head>
	<title>My Inventory - TopRoll</title>
	<meta
		name="description"
		content="Manage your CS2 skin inventory and create marketplace listings"
	/>
</svelte:head>

<main class="bg-surface container mx-auto min-h-screen px-4 py-8">
	<div class="mb-8">
		<h1 class="text-display mb-2 text-4xl font-bold">My Inventory</h1>
		<p class="text-muted-foreground text-lg">
			Manage your CS2 skin inventory and create marketplace listings
		</p>
	</div>

	<div class="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
		<div class="flex flex-1 flex-col gap-4 sm:flex-row sm:items-center">
			<!-- Search -->
			<div class="relative max-w-md flex-1">
				<Search class="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
				<Input
					type="text"
					placeholder="Search for skins..."
					bind:value={searchQuery}
					class="pl-9"
					onkeyup={handleSearch}
				/>
			</div>

			<!-- Rarity Filter -->
			<select
				bind:value={selectedRarity}
				onchange={handleFilterChange}
				class="border-border/60 bg-surface/70 text-foreground rounded-lg border px-3 py-2 text-sm"
			>
				{#each rarities as rarity}
					<option value={rarity.id}>{rarity.label}</option>
				{/each}
			</select>

			<!-- Sort Options -->
			<select
				bind:value={selectedSort}
				onchange={handleSortChange}
				class="border-border/60 bg-surface/70 text-foreground rounded-lg border px-3 py-2 text-sm"
			>
				{#each sortOptions as option}
					<option value={option.id}>{option.label}</option>
				{/each}
			</select>
		</div>

		<div class="flex gap-3">
			<Button variant="outline" class="gap-2" onclick={loadInventory}>
				<RefreshCw class="h-4 w-4" />
				Refresh
			</Button>
			<Button variant="outline" class="gap-2" onclick={() => (showSyncModal = true)}>
				<Download class="h-4 w-4" />
				Sync Steam
			</Button>
			<Button class="gap-2" href="/marketplace/create">
				<Plus class="h-4 w-4" />
				Create Listing
			</Button>
		</div>
	</div>

	<!-- Stats Cards -->
	<div class="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
		<Card class="border-border/60 bg-surface/70 border">
			<CardContent class="flex items-center gap-3 p-4">
				<div
					class="border-primary/50 bg-primary/15 text-primary flex h-8 w-8 items-center justify-center rounded-md border"
				>
					<ShoppingCart class="h-4 w-4" />
				</div>
				<div>
					<p class="text-muted-foreground text-xs tracking-wide uppercase">Total Items</p>
					<p class="text-foreground text-lg font-semibold">{inventory.length}</p>
				</div>
			</CardContent>
		</Card>

		<Card class="border-border/60 bg-surface/70 border">
			<CardContent class="flex items-center gap-3 p-4">
				<div
					class="border-secondary/50 bg-secondary/15 text-secondary flex h-8 w-8 items-center justify-center rounded-md border"
				>
					<DollarSign class="h-4 w-4" />
				</div>
				<div>
					<p class="text-muted-foreground text-xs tracking-wide uppercase">Total Value</p>
					<p class="text-foreground text-lg font-semibold">{formatCurrency(totalValue)}</p>
				</div>
			</CardContent>
		</Card>

		<Card class="border-border/60 bg-surface/70 border">
			<CardContent class="flex items-center gap-3 p-4">
				<div
					class="border-success/50 bg-success/15 text-success flex h-8 w-8 items-center justify-center rounded-md border"
				>
					<Settings class="h-4 w-4" />
				</div>
				<div>
					<p class="text-muted-foreground text-xs tracking-wide uppercase">Balance</p>
					<p class="text-foreground text-lg font-semibold">{formatCurrency(userBalance)}</p>
				</div>
			</CardContent>
		</Card>

		<Card class="border-border/60 bg-surface/70 border">
			<CardContent class="flex items-center gap-3 p-4">
				<div
					class="border-warning/50 bg-warning/15 text-warning flex h-8 w-8 items-center justify-center rounded-md border"
				>
					<Tag class="h-4 w-4" />
				</div>
				<div>
					<p class="text-muted-foreground text-xs tracking-wide uppercase">Steam ID</p>
					<p class="text-foreground font-mono text-sm">{steamId || 'Not linked'}</p>
				</div>
			</CardContent>
		</Card>
	</div>

	<!-- Inventory Grid -->
	{#if loading}
		<div class="flex min-h-[400px] items-center justify-center">
			<div class="text-center">
				<div
					class="border-primary mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-t-transparent"
				></div>
				<p class="text-muted-foreground">Loading inventory...</p>
			</div>
		</div>
	{:else if error}
		<div class="flex min-h-[400px] items-center justify-center">
			<div class="text-center">
				<p class="mb-4 text-lg font-semibold text-red-500">Error loading inventory</p>
				<p class="text-muted-foreground">{error}</p>
				<Button variant="outline" onclick={loadInventory}>Try Again</Button>
			</div>
		</div>
	{:else if filteredInventory().length === 0}
		<div class="flex min-h-[400px] items-center justify-center">
			<div class="text-center">
				<p class="text-muted-foreground mb-4 text-lg font-semibold">No items found</p>
				<p class="text-muted-foreground max-w-md">
					{#if searchQuery || selectedRarity !== 'all'}
						Try adjusting your search or filters to find items.
					{:else if inventory.length === 0}
						Your inventory is empty. Sync your Steam inventory to get started!
					{:else}
						No items match your current filters.
					{/if}
				</p>
				{#if inventory.length === 0}
					<Button variant="outline" onclick={() => (showSyncModal = true)}>
						<Download class="mr-2 h-4 w-4" />
						Sync Steam Inventory
					</Button>
				{:else if searchQuery || selectedRarity !== 'all'}
					<Button
						variant="outline"
						onclick={() => {
							searchQuery = '';
							selectedRarity = 'all';
						}}
					>
						Clear Filters
					</Button>
				{/if}
			</div>
		</div>
	{:else}
		<div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
			{#each filteredInventory() as item (item.assetid)}
				<Card
					class="border-border/60 bg-surface/70 hover:border-border transition-all duration-200"
				>
					<CardHeader class="pb-3">
						<div class="flex items-start justify-between">
							<div class="space-y-2">
								<h3 class="text-foreground text-lg font-semibold">{item.name}</h3>
								<div class="flex items-center gap-2">
									<Badge class={`text-xs font-semibold ${getRarityColor(item.rarity)} border`}>
										{item.rarity}
									</Badge>
									{#if item.wear}
										<Badge variant="outline" class="text-xs">
											{item.wear}
										</Badge>
									{/if}
								</div>
							</div>
							<div class="text-right">
								<p class="text-foreground text-xl font-bold">{formatCurrency(item.market_value)}</p>
								<p class="text-muted-foreground text-xs">Market Value</p>
							</div>
						</div>
					</CardHeader>
					<CardContent class="space-y-4">
						<div class="flex items-center gap-3">
							<img
								src={item.icon_url}
								alt={item.name}
								class="border-border/60 h-16 w-16 rounded-lg border object-cover"
							/>
							<div class="min-w-0 flex-1">
								<p class="text-foreground truncate text-sm font-medium">{item.market_name}</p>
								<p class="text-muted-foreground text-xs">{item.type}</p>
							</div>
						</div>

						<div class="flex items-center gap-2 text-sm">
							<DollarSign class="text-muted-foreground h-4 w-4" />
							<span class="text-foreground">Market Value: {formatCurrency(item.market_value)}</span>
						</div>

						<div class="flex items-center gap-2 text-sm">
							{#if item.tradable}
								<Badge variant="outline" class="text-xs text-green-500">Tradable</Badge>
							{:else}
								<Badge variant="outline" class="text-xs text-red-500">Not Tradable</Badge>
							{/if}
							{#if item.marketable}
								<Badge variant="outline" class="text-xs text-blue-500">Marketable</Badge>
							{:else}
								<Badge variant="outline" class="text-xs text-gray-500">Not Marketable</Badge>
							{/if}
						</div>

						<div class="flex gap-2 pt-2">
							<Button
								variant="outline"
								size="sm"
								class="flex-1 gap-1"
								disabled={!item.tradable || !item.marketable}
							>
								<ShoppingCart class="h-3 w-3" />
								List
							</Button>
						</div>
					</CardContent>
				</Card>
			{/each}
		</div>
	{/if}
</main>

<!-- Sync Modal -->
{#if showSyncModal}
	<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
		<Card class="border-border/60 bg-surface/90 w-full max-w-md">
			<CardHeader>
				<CardTitle class="flex items-center gap-2">
					<Download class="h-5 w-5" />
					Sync Steam Inventory
				</CardTitle>
			</CardHeader>
			<CardContent class="space-y-4">
				<div class="space-y-2">
					<p class="text-muted-foreground">
						Sync your Steam inventory to import all your tradable CS2 skins to your TopRoll account.
					</p>
					<p class="text-muted-foreground text-sm">
						This may take a few moments depending on the size of your inventory.
					</p>
				</div>

				<div class="space-y-2">
					<label for="steamId" class="text-sm font-medium">Steam ID</label>
					<Input
						id="steamId"
						type="text"
						placeholder="Your Steam ID"
						bind:value={steamId}
						disabled={syncInProgress}
					/>
				</div>

				<div class="flex gap-2 pt-2">
					<Button
						variant="outline"
						onclick={() => (showSyncModal = false)}
						disabled={syncInProgress}
					>
						Cancel
					</Button>
					<Button onclick={syncInventory} disabled={syncInProgress || !steamId}>
						{#if syncInProgress}
							<div class="flex items-center gap-2">
								<div
									class="border-primary h-4 w-4 animate-spin rounded-full border-2 border-t-transparent"
								></div>
								Syncing...
							</div>
						{:else}
							Sync Inventory
						{/if}
					</Button>
				</div>
			</CardContent>
		</Card>
	</div>
{/if}

<style>
	main {
		background: linear-gradient(135deg, #0f0f23 0%, #1a1a2e 100%);
	}
</style>
