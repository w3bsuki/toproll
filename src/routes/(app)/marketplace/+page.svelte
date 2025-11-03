<script lang="ts">
	// ✅ FIXED: Use $app/state and $effect
	import { page } from '$app/state';
	import { Badge, Button, Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui';
	import { Input } from '$lib/components/ui/input';
	import {
		Search,
		Filter,
		RefreshCw,
		ShoppingCart,
		DollarSign,
		Tag,
		Star,
		Eye,
		Plus,
		Settings
	} from '@lucide/svelte';
	import { api } from '$lib/api/client';
	import type { MarketplaceListing } from '$lib/types/index';

	let listings = $state<MarketplaceListing[]>([]);
	let loading = $state(true);
	let error = $state<string | null>(null);
	let searchQuery = $state('');
	let selectedRarity = $state('all');
	let selectedSort = $state('newest');
	let minPrice = $state<number | null>(null);
	let maxPrice = $state<number | null>(null);
	let showCreateListing = $state(false);
	let userBalance = $state(0);
	let currentUser = $state<any>(null);

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
		{ id: 'newest', label: 'Newest First' },
		{ id: 'oldest', label: 'Oldest First' },
		{ id: 'price_low', label: 'Price: Low to High' },
		{ id: 'price_high', label: 'Price: High to Low' },
		{ id: 'value_low', label: 'Value: Low to High' },
		{ id: 'value_high', label: 'Value: High to Low' }
	];

	$effect(() => {
		loadUser();
		loadListings();
	});

	async function loadUser() {
		try {
			const profile = await api.auth.getProfile();
			currentUser = profile ? { id: profile.user_id, steamId: profile.steam_id } : null;
		} catch (err) {
			console.error('Failed to load user:', err);
		}
	}

	async function loadListings() {
		try {
			loading = true;
			error = null;

			listings = await api.marketplace.listListings({
				search: searchQuery || undefined,
				rarity: selectedRarity !== 'all' ? selectedRarity : undefined,
				minPrice: minPrice !== null ? minPrice : undefined,
				maxPrice: maxPrice !== null ? maxPrice : undefined
			});
		} catch (err) {
			error = err instanceof Error ? err.message : 'Unknown error';
		} finally {
			loading = false;
		}
	}

	function handleSearch() {
		loadListings();
	}

	function handleFilterChange() {
		loadListings();
	}

	function handleCreateListing() {
		showCreateListing = true;
	}

	function handleViewListing(listingId: string) {
		window.location.href = `/marketplace/${listingId}`;
	}

	async function handlePurchaseListing(listingId: string) {
		try {
			const result = await api.marketplace.purchase(listingId);
			if (result.success) {
				alert('Purchase successful! Item has been added to your inventory.');
				await loadListings(); // Refresh listings
			}
		} catch (err) {
			alert(err instanceof Error ? err.message : 'Failed to purchase listing');
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
	<title>Skin Marketplace - TopRoll</title>
	<meta
		name="description"
		content="Buy, sell, and trade CS2 skins with provably fair transactions"
	/>
</svelte:head>

<main class="bg-surface container mx-auto min-h-screen px-4 py-8">
	<div class="mb-8">
		<h1 class="text-display mb-2 text-4xl font-bold">Skin Marketplace</h1>
		<p class="text-muted-foreground text-lg">
			Buy, sell, and trade CS2 skins with provably fair transactions
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
				/>
			</div>

			<!-- Rarity Filter -->
			<select
				bind:value={selectedRarity}
				onchange={handleFilterChange}
				onkeyup={(e) => e.key === 'Enter' && handleSearch()}
				class="border-border/60 bg-surface/70 text-foreground rounded-lg border px-3 py-2 text-sm"
			>
				{#each rarities as rarity}
					<option value={rarity.id}>{rarity.label}</option>
				{/each}
			</select>

			<!-- Sort Options -->
			<select
				bind:value={selectedSort}
				onchange={handleFilterChange}
				class="border-border/60 bg-surface/70 text-foreground rounded-lg border px-3 py-2 text-sm"
			>
				{#each sortOptions as option}
					<option value={option.id}>{option.label}</option>
				{/each}
			</select>
		</div>

		<div class="flex gap-3">
			<Button variant="outline" class="gap-2" onclick={loadListings}>
				<RefreshCw class="h-4 w-4" />
				Refresh
			</Button>
			{#if currentUser}
				<Button class="gap-2" onclick={handleCreateListing}>
					<Plus class="h-4 w-4" />
					Create Listing
				</Button>
			{/if}
		</div>
	</div>

	<!-- Price Range Filter -->
	<div class="mb-6 flex items-center gap-4">
		<div class="flex items-center gap-2">
			<label for="min-price" class="text-sm text-gray-400">Price Range:</label>
			<Input
				id="min-price"
				type="number"
				placeholder="Min"
				bind:value={minPrice}
				class="w-24"
				onchange={handleFilterChange}
			/>
			<span class="text-gray-400">-</span>
			<Input
				type="number"
				placeholder="Max"
				bind:value={maxPrice}
				class="w-24"
				onchange={handleFilterChange}
			/>
		</div>
	</div>

	<!-- Listings Grid -->
	{#if loading}
		<div class="flex min-h-[400px] items-center justify-center">
			<div class="text-center">
				<div
					class="border-primary mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-t-transparent"
				></div>
				<p class="text-muted-foreground">Loading marketplace...</p>
			</div>
		</div>
	{:else if error}
		<div class="flex min-h-[400px] items-center justify-center">
			<div class="text-center">
				<p class="mb-4 text-lg font-semibold text-red-500">Error loading marketplace</p>
				<p class="text-muted-foreground">{error}</p>
				<Button variant="outline" onclick={loadListings}>Try Again</Button>
			</div>
		</div>
	{:else if listings.length === 0}
		<div class="flex min-h-[400px] items-center justify-center">
			<div class="text-center">
				<p class="text-muted-foreground mb-4 text-lg font-semibold">No listings found</p>
				<p class="text-muted-foreground max-w-md">
					{#if searchQuery || selectedRarity !== 'all' || minPrice !== null || maxPrice !== null}
						Try adjusting your search or filters to find skins.
					{:else}
						There are no active listings at the moment. Be the first to list a skin!
					{/if}
				</p>
				{#if searchQuery || selectedRarity !== 'all' || minPrice !== null || maxPrice !== null}
					<Button
						variant="outline"
						onclick={() => {
							searchQuery = '';
							selectedRarity = 'all';
							minPrice = null;
							maxPrice = null;
							loadListings();
						}}
					>
						Clear Filters
					</Button>
				{/if}
			</div>
		</div>
	{:else}
		<div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
			{#each listings as listing (listing.id)}
				<Card
					class="border-border/60 bg-surface/70 hover:border-border transition-all duration-200"
				>
					<CardHeader class="pb-3">
						<div class="flex items-start justify-between">
							<div class="space-y-2">
								<h3 class="text-foreground text-lg font-semibold">{listing.inventory?.name}</h3>
								<div class="flex items-center gap-2">
									<Badge
										class={`text-xs font-semibold ${getRarityColor(listing.inventory?.rarity || 'Common')} border`}
									>
										{listing.inventory?.rarity}
									</Badge>
									{#if listing.inventory?.wear}
										<Badge variant="outline" class="text-xs">
											{listing.inventory?.wear}
										</Badge>
									{/if}
								</div>
							</div>
							<div class="text-right">
								<p class="text-foreground text-xl font-bold">{formatCurrency(listing.price)}</p>
								<p class="text-muted-foreground text-xs">Market Price</p>
							</div>
						</div>
					</CardHeader>
					<CardContent class="space-y-4">
						<div class="flex items-center gap-3">
							<img
								src={listing.inventory?.icon_url}
								alt={listing.inventory?.name}
								class="border-border/60 h-16 w-16 rounded-lg border object-cover"
							/>
							<div class="min-w-0 flex-1">
								<p class="text-foreground truncate text-sm font-medium">
									{listing.inventory?.market_name}
								</p>
								<p class="text-muted-foreground text-xs">{listing.inventory?.type}</p>
							</div>
						</div>

						<div class="flex items-center gap-2 text-sm">
							<DollarSign class="text-muted-foreground h-4 w-4" />
							<span class="text-foreground"
								>Market Value: {formatCurrency(listing.inventory?.market_value || 0)}</span
							>
						</div>

						<div class="flex items-center gap-2 text-sm">
							<Tag class="text-muted-foreground h-4 w-4" />
							<span class="text-foreground">Seller: {listing.seller?.username}</span>
						</div>

						<div class="flex gap-2 pt-2">
							<Button
								variant="outline"
								size="sm"
								class="flex-1 gap-1"
								onclick={() => handleViewListing(listing.id)}
							>
								<Eye class="h-3 w-3" />
								View
							</Button>
							{#if currentUser}
								<Button
									size="sm"
									class="flex-1 gap-1"
									onclick={() => handlePurchaseListing(listing.id)}
								>
									<ShoppingCart class="h-3 w-3" />
									Buy
								</Button>
							{/if}
						</div>
					</CardContent>
				</Card>
			{/each}
		</div>
	{/if}
</main>

<style>
	main {
		background: linear-gradient(135deg, #0f0f23 0%, #1a1a2e 100%);
	}
</style>
