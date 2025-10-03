<script lang="ts">
	import { Button } from '$lib/components/ui';
	import CommunityPotCard, { type CommunityPot } from './CommunityPotCard.svelte';
	import { Filter, Plus, RefreshCw } from '@lucide/svelte';

	export interface CommunityPotsGridProps {
		pots: CommunityPot[];
		loading?: boolean;
		error?: string;
		filter?: string;
		onFilterChange?: (filter: string) => void;
		onRefresh?: () => void;
		onCreatePot?: () => void;
		onJoinPot?: (potId: string) => void;
		onViewPot?: (potId: string) => void;
		showCreateButton?: boolean;
		maxItems?: number;
		class?: string;
	}

	let {
		pots,
		loading = false,
		error,
		filter = 'all',
		onFilterChange,
		onRefresh,
		onCreatePot,
		onJoinPot,
		onViewPot,
		showCreateButton = false,
		maxItems,
		class: className = ''
	}: CommunityPotsGridProps = $props();

	const filters = [
		{ id: 'all', label: 'All Pots' },
		{ id: 'active', label: 'Active' },
		{ id: 'rain', label: 'Rain Pots' },
		{ id: 'vip', label: 'VIP' },
		{ id: 'flash', label: 'Flash' },
		{ id: 'ending-soon', label: 'Ending Soon' }
	];

	const filteredPots = $derived(() => {
		if (filter === 'all') return pots;

		return pots.filter(pot => {
			switch (filter) {
				case 'active':
					return pot.status === 'active';
				case 'rain':
					return pot.type === 'rain';
				case 'vip':
					return pot.type === 'vip' || pot.isVIP;
				case 'flash':
					return pot.type === 'flash';
				case 'ending-soon':
					return pot.status === 'ending-soon';
				default:
					return true;
			}
		});
	});

	const displayPots = $derived(maxItems ? filteredPots.slice(0, maxItems) : filteredPots);

	const handleFilterChange = (newFilter: string) => {
		onFilterChange?.(newFilter);
	};
</script>

<section class={`space-y-6 ${className}`}>
	<!-- Header -->
	<div class="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
		<div class="space-y-2">
			<h2 class="text-3xl font-bold tracking-tight">Community Pots</h2>
			<p class="text-muted-foreground text-base">
				Join community rewards and rain events
			</p>
		</div>

		<div class="flex items-center gap-3">
			{#if onRefresh}
				<Button
					variant="outline"
					size="sm"
					class="gap-2"
					onclick={onRefresh}
					disabled={loading}
				>
					<RefreshCw class="h-4 w-4 {loading ? 'animate-spin' : ''}" />
					Refresh
				</Button>
			{/if}

			{#if showCreateButton && onCreatePot}
				<Button class="gap-2" onclick={onCreatePot}>
					<Plus class="h-4 w-4" />
					Create Pot
				</Button>
			{/if}
		</div>
	</div>

	<!-- Filters -->
	<div class="flex flex-wrap gap-2">
		{#each filters as filterOption}
			<Button
				variant={filter === filterOption.id ? 'default' : 'outline'}
				size="sm"
				class="gap-2 rounded-full"
				onclick={() => handleFilterChange(filterOption.id)}
			>
				{#if filterOption.id === 'all'}
					<Filter class="h-4 w-4" />
				{/if}
				{filterOption.label}
				{#if filterOption.id === 'all'}
					<span class="bg-primary/20 text-primary px-2 py-0.5 rounded-full text-xs">
						{pots.length}
					</span>
				{:else}
					<span class="bg-primary/20 text-primary px-2 py-0.5 rounded-full text-xs">
						{filter === filterOption.id ? filteredPots.length : pots.filter(pot => {
							switch (filterOption.id) {
								case 'active':
									return pot.status === 'active';
								case 'rain':
									return pot.type === 'rain';
								case 'vip':
									return pot.type === 'vip' || pot.isVIP;
								case 'flash':
									return pot.type === 'flash';
								case 'ending-soon':
									return pot.status === 'ending-soon';
								default:
									return false;
							}
						}).length}
					</span>
				{/if}
			</Button>
		{/each}
	</div>

	<!-- Content -->
	{#if loading}
		<div class="flex items-center justify-center py-12">
			<div class="flex flex-col items-center gap-3">
				<div class="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full"></div>
				<p class="text-muted-foreground">Loading community pots...</p>
			</div>
		</div>
	{:else if error}
		<div class="flex flex-col items-center gap-4 py-12 text-center bg-surface/30 rounded-3xl border border-border/40">
			<div class="text-destructive text-lg font-semibold">Error Loading Pots</div>
			<p class="text-muted-foreground max-w-md">{error}</p>
			<Button variant="outline" onclick={onRefresh}>
				Try Again
			</Button>
		</div>
	{:else if displayPots.length === 0}
		<div class="flex flex-col items-center gap-4 py-12 text-center bg-surface/30 rounded-3xl border border-border/40">
			<div class="text-muted-foreground text-lg font-semibold">No Community Pots Found</div>
			<p class="text-muted-foreground max-w-md">
				{#if filter === 'all'}
					There are no active community pots at the moment. Check back later!
				{:else}
					No pots found matching the selected filter. Try a different filter.
				{/if}
			</p>
			{#if filter !== 'all'}
				<Button variant="outline" onclick={() => handleFilterChange('all')}>
					Show All Pots
				</Button>
			{/if}
		</div>
	{:else}
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
			{#each displayPots as pot (pot.id)}
				<CommunityPotCard
					{pot}
					onJoin={onJoinPot}
					onView={onViewPot}
				/>
			{/each}
		</div>

		{#if maxItems && filteredPots.length > maxItems}
			<div class="flex justify-center pt-6">
				<Button variant="outline" class="gap-2">
					View All {filteredPots.length} Pots
				</Button>
			</div>
		{/if}
	{/if}
</section>