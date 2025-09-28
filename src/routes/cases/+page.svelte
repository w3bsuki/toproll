<script lang="ts">
	import CaseOpeningRoulette from '$lib/components/CaseOpeningRoulette.svelte';
	import ParticleEffects from '$lib/components/ParticleEffects.svelte';
	// import CaseBattle from '$lib/components/CaseBattle.svelte';
	import LoadingSkeleton from '$lib/components/LoadingSkeleton.svelte';
	import ErrorBoundary from '$lib/components/ErrorBoundary.svelte';
	import { Package, Users, TrendingUp, Zap } from 'lucide-svelte';
	import type { CS2Item } from '$lib/types';
	import type { PageData } from './$types';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();
	let isLoading = $state(false);
	let error = $state<Error | null>(null);
	let showParticles = $state(false);
	let lastWin: any = $state(null);

	// Use real cases from database
	const cases = $derived(data.cases || []);

	const battles = [
		{
			id: 'battle_001',
			maxPlayers: 2,
			entryFee: 2.49,
			currentPlayers: 1,
			status: 'waiting'
		},
		{
			id: 'battle_002',
			maxPlayers: 4,
			entryFee: 5.0,
			currentPlayers: 3,
			status: 'waiting'
		}
	];

	function handleCaseOpen(caseId: string, item: CS2Item) {
		console.log(`Opened case ${caseId}, got item:`, item);
		// In real app, this would send to backend API
	}

	function handleCaseComplete(item: any) {
		lastWin = item;
		showParticles = true;
		setTimeout(() => (showParticles = false), 2500);
	}

	// Convert case items to roulette format with proper rarity mapping
	const rouletteItems = $derived(
		cases[0]?.case_items?.map((item) => {
			// Map database rarities to roulette rarities
			const rarityMap: Record<
				string,
				'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'mythical'
			> = {
				Common: 'common',
				Uncommon: 'uncommon',
				Rare: 'rare',
				Epic: 'epic',
				Legendary: 'legendary',
				Contraband: 'mythical', // Map Contraband to mythical
			};

			return {
				id: item.id,
				name: item.name,
				rarity: rarityMap[item.rarity] || 'common',
				image: item.image_url,
				value: item.market_value
			};
		}) || []
	);

	// Debug logging
	$effect(() => {
		console.log('Roulette items:', rouletteItems);
		console.log('Cases data:', cases[0]);
	});

	function handleBattleJoin(battleId: string) {
		console.log(`Joined battle ${battleId}`);
		// In real app, this would join via WebSocket/API
	}

	function handleBattleLeave(battleId: string) {
		console.log(`Left battle ${battleId}`);
		// In real app, this would leave via WebSocket/API
	}

	function getRarityBadgeColor(rarity: string): string {
		const colors = {
			Consumer: 'neutral',
			Industrial: 'info',
			'Mil-Spec': 'primary',
			Restricted: 'warning',
			Classified: 'accent',
			Covert: 'error',
			Contraband: 'success'
		};
		return colors[rarity as keyof typeof colors] || 'neutral';
	}
</script>

<svelte:head>
	<title>Cases - TopRoll</title>
</svelte:head>

<ErrorBoundary {error}>
	<div class="space-y-12">
		<!-- Header -->
		<div class="mb-8 text-center">
			<h1 class="mb-4 text-4xl font-bold tracking-tight">CS2 Cases & Battles</h1>
			<p class="text-muted-foreground text-xl">
				Open exclusive cases or battle other players for the best items
			</p>
		</div>

		<!-- Stats Cards -->
		<div class="grid gap-6 lg:grid-cols-3">
			<div class="card bg-base-100 shadow-xl">
				<div class="card-body">
					<div class="flex items-center gap-3">
						<div class="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
							<Package class="h-5 w-5 text-primary" />
						</div>
						<div>
							<p class="text-sm text-base-content/70">Cases Opened Today</p>
							<p class="text-2xl font-bold">1,247</p>
						</div>
					</div>
				</div>
			</div>

			<div class="card bg-base-100 shadow-xl">
				<div class="card-body">
					<div class="flex items-center gap-3">
						<div class="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
							<Users class="h-5 w-5 text-accent" />
						</div>
						<div>
							<p class="text-sm text-base-content/70">Active Battles</p>
							<p class="text-2xl font-bold">23</p>
						</div>
					</div>
				</div>
			</div>

			<div class="card bg-base-100 shadow-xl">
				<div class="card-body">
					<div class="flex items-center gap-3">
						<div class="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
							<TrendingUp class="h-5 w-5 text-success" />
						</div>
						<div>
							<p class="text-sm text-base-content/70">Biggest Win Today</p>
							<p class="text-2xl font-bold">$2,450</p>
						</div>
					</div>
				</div>
			</div>
		</div>

		<!-- GSAP Case Opening Animation -->
		<div class="relative mb-12 space-y-6">
			<ParticleEffects trigger={showParticles} intensity="high" />

			<div class="space-y-4 text-center">
				<h2 class="text-3xl font-bold">Try Case Opening</h2>
				<p class="text-muted-foreground">Experience the thrill with GSAP-powered animation</p>
			</div>

			{#if rouletteItems.length > 0}
				<CaseOpeningRoulette items={rouletteItems} onComplete={handleCaseComplete} />
			{/if}

			{#if lastWin}
				<div class="mx-auto max-w-md rounded-lg border border-base-300 bg-base-200/50 p-4">
					<h3 class="mb-2 text-lg font-semibold">Last Win</h3>
					<div class="flex items-center gap-3">
						<img src={lastWin.image} alt={lastWin.name} class="h-12 w-12 rounded" />
						<div>
							<p class="font-medium">{lastWin.name}</p>
							<p class="font-bold text-success">${lastWin.value}</p>
							<p class="text-sm text-base-content/70 capitalize">{lastWin.rarity}</p>
						</div>
					</div>
				</div>
			{/if}
		</div>

		<!-- Content Grid -->
		<div class="grid gap-12 xl:grid-cols-2">
			<!-- Cases Section -->
			<div class="space-y-6">
				<div class="flex items-center gap-2">
					<Package class="h-6 w-6" />
					<h2 class="text-2xl font-bold">Available Cases</h2>
				</div>

				{#if isLoading}
					<div class="space-y-4">
						{#each Array(2) as _}
							<LoadingSkeleton variant="card"></LoadingSkeleton>
						{/each}
					</div>
				{:else}
					<div class="space-y-4">
						{#each cases as caseData}
							<div class="card bg-base-100 shadow-xl">
								<div class="card-body">
									<div class="flex items-center gap-4">
										{#if caseData.image_url}
											<img
												src={caseData.image_url}
												alt={caseData.name}
												class="h-16 w-16 rounded-lg object-cover"
											/>
										{:else}
											<div class="flex h-16 w-16 items-center justify-center rounded-lg bg-base-300">
												<Package class="h-8 w-8 text-base-content/50" />
											</div>
										{/if}
										<div class="flex-1">
											<h3 class="card-title">{caseData.name}</h3>
											<p class="text-sm text-base-content/70">{caseData.description || 'Premium CS2 case with exclusive skins'}</p>
											<div class="mt-2 flex items-center gap-4">
												<p class="text-lg font-bold text-success">${caseData.price}</p>
												<p class="text-sm text-base-content/70">{caseData.item_count} items</p>
											</div>
										</div>
										<button class="btn btn-primary">
											Open Case
										</button>
									</div>
								</div>
							</div>
						{/each}
					</div>
				{/if}
			</div>

			<!-- Battles Section -->
			<div class="space-y-6">
				<div class="flex items-center gap-2">
					<Users class="h-6 w-6" />
					<h2 class="text-2xl font-bold">Case Battles</h2>
				</div>

				{#if isLoading}
					<div class="space-y-4">
						{#each Array(2) as _}
							<LoadingSkeleton variant="card"></LoadingSkeleton>
						{/each}
					</div>
				{:else}
					<div class="space-y-4">
						{#each battles as battle}
							<div class="card bg-base-100 shadow-xl">
								<div class="card-body">
									<h3 class="card-title">Battle #{battle.id}</h3>
									<p class="text-sm text-base-content/70">
										{battle.currentPlayers}/{battle.maxPlayers} players
									</p>
									<p class="text-lg font-bold text-success">Entry: ${battle.entryFee}</p>
								</div>
							</div>
						{/each}
					</div>
				{/if}
			</div>
		</div>

		<!-- Recent Wins -->
		<div>
			<div class="mb-8 flex items-center gap-2">
				<Zap class="h-6 w-6" />
				<h2 class="text-3xl font-bold">Recent Big Wins</h2>
			</div>

			<div class="grid gap-6 lg:grid-cols-3">
				{#each [{ user: 'ProGamer123', item: 'AWP | Dragon Lore', value: 2450.0, rarity: 'Covert' }, { user: 'CS2Legend', item: 'AK-47 | Fire Serpent', value: 1200.0, rarity: 'Covert' }, { user: 'SkinHunter', item: 'M4A4 | Howl', value: 850.0, rarity: 'Contraband' }] as win}
					<div class="card bg-base-100 shadow-xl">
						<div class="card-body">
							<div class="flex items-center gap-3">
								<div class="avatar">
									<div class="h-12 w-12 rounded-full bg-base-300"></div>
								</div>
								<div class="flex-1">
									<p class="font-medium">{win.user}</p>
									<p class="text-sm text-base-content/70">{win.item}</p>
								</div>
								<div class="text-right">
									<p class="font-bold text-success">${win.value.toFixed(2)}</p>
									<div class="badge badge-{getRarityBadgeColor(win.rarity)}">
										{win.rarity}
									</div>
								</div>
							</div>
						</div>
					</div>
				{/each}
			</div>
		</div>
	</div>
</ErrorBoundary>
