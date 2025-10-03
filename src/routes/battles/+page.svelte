<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import { Tabs, TabsContent, TabsList, TabsTrigger } from '$lib/components/ui/tabs';
	import HeroBanner from '$lib/components/home/HeroBanner.svelte';
	import LiveDropsTicker from '$lib/components/home/LiveDropsTicker.svelte';
	import BattleCreateDialog from '$lib/components/battles/BattleCreateDialog.svelte';
	import {
		Users,
		Trophy,
		Clock,
		Play,
		Settings,
		Eye,
		Flame,
		Currency,
		Sparkles
	} from '@lucide/svelte';
	import type { Battle, BattleParticipant } from '$lib/types';

	// Reactive state with Svelte 5 runes
	let battles = $state<Battle[]>([]);
	let isLoading = $state(true);
	let error = $state<string | null>(null);
	let activeTab = $state('waiting');
	let createDialogOpen = $state(false);
	let userBalance = $state(1000.0); // Mock balance
	let activeFilters = $state({
		mode: 'all', // 'all', 'standard', 'crazy'
		maxPlayers: 'all', // 'all', 2, 4
		minValue: 0
	});

	// Load battles from API
	async function loadBattles() {
		isLoading = true;
		error = null;

		try {
			const response = await fetch('/api/battles');
			if (!response.ok) throw new Error('Failed to load battles');
			const data = await response.json();
			battles = data.battles || [];
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to load battles';
			console.error('Error loading battles:', err);
		} finally {
			isLoading = false;
		}
	}

	// Load battles on component mount
	loadBattles();

	// Computed values
	const waitingBattles = $derived(
		battles.filter(
			(b) => b && b.status === 'waiting' && b.current_participants < b.max_participants
		)
	);
	const activeBattles = $derived(
		battles.filter((b) => b && (b.status === 'in_progress' || b.status === 'locking'))
	);

	// Format time relative to now
	function formatTimeAgo(dateString: string): string {
		const date = new Date(dateString);
		const now = new Date();
		const diffMs = now.getTime() - date.getTime();
		const diffMins = Math.floor(diffMs / 60000);

		if (diffMins < 1) return 'Just now';
		if (diffMins < 60) return `${diffMins}m ago`;
		const diffHours = Math.floor(diffMins / 60);
		return `${diffHours}h ago`;
	}

	// Get status color for battle
	function getStatusColor(status: Battle['status']) {
		switch (status) {
			case 'waiting':
				return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
			case 'locking':
				return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
			case 'in_progress':
				return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
			case 'completed':
				return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
			default:
				return 'bg-surface-muted text-surface-muted-foreground border-border/70';
		}
	}

	// Handle battle actions
	function handleCreateBattle() {
		createDialogOpen = true;
	}

	async function handleJoinBattle(battleId: string) {
		try {
			const response = await fetch(`/api/battles/${battleId}/join`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					client_seed: Math.random().toString(36).substring(2, 15)
				})
			});

			if (!response.ok) {
				const error = await response.text();
				console.error('Failed to join battle:', error);
				// TODO: Show error to user
				return;
			}

			// Reload battles after joining
			await loadBattles();
		} catch (err) {
			console.error('Error joining battle:', err);
			// TODO: Show error to user
		}
	}

	function handleSpectateBattle(battleId: string) {
		window.location.href = `/battles/${battleId}`;
	}
</script>

<!-- Live Drops Ticker -->
<LiveDropsTicker />

<!-- Hero Banner -->
<HeroBanner />

<!-- Main Content -->
<section class="container mx-auto max-w-7xl px-4 py-6">
	<!-- Header -->
	<header class="mb-6">
		<div class="flex items-center justify-between">
			<div>
				<h1 class="text-foreground mb-2 text-3xl font-bold">
					Case Battles
					<Flame class="text-warning ml-2 inline-block h-7 w-7" />
				</h1>
				<p class="text-muted-foreground text-lg">
					Create epic battles, challenge opponents, and win legendary skins
				</p>
			</div>
			<div class="flex items-center gap-4">
				<div class="text-right">
					<p class="text-muted-foreground text-sm">Your Balance</p>
					<p class="text-xl font-bold text-emerald-400">${userBalance.toFixed(2)}</p>
				</div>
				<Button
					size="lg"
					onclick={handleCreateBattle}
					class="bg-primary text-primary-foreground hover:bg-primary/90 gap-2 font-bold"
				>
					<Trophy class="h-4 w-4" />
					Create Battle
				</Button>
			</div>
		</div>
	</header>

	<!-- Battle Tabs -->
	<Tabs bind:value={activeTab} class="mb-6">
		<div class="mb-4 flex items-center justify-between">
			<TabsList class="grid w-auto grid-cols-2">
				<TabsTrigger value="waiting" class="gap-2">
					<Clock class="h-4 w-4" />
					Waiting ({waitingBattles.length})
				</TabsTrigger>
				<TabsTrigger value="active" class="gap-2">
					<Play class="h-4 w-4" />
					Active ({activeBattles.length})
				</TabsTrigger>
			</TabsList>

			<!-- Quick Stats -->
			<div class="flex items-center gap-6 text-sm">
				<div class="flex items-center gap-2">
					<Users class="text-muted-foreground h-4 w-4" />
					<span class="text-muted-foreground">Total Players:</span>
					<span class="text-foreground font-semibold">
						{battles.reduce((sum, b) => sum + b.current_participants, 0)}
					</span>
				</div>
				<div class="flex items-center gap-2">
					<Currency class="text-muted-foreground h-4 w-4" />
					<span class="text-muted-foreground">Total Pot:</span>
					<span class="font-semibold text-emerald-400">
						${battles.reduce((sum, b) => sum + b.total_pot, 0).toFixed(2)}
					</span>
				</div>
			</div>
		</div>

		<TabsContent value="waiting" class="space-y-4">
			{#if isLoading}
				<!-- Loading Skeleton -->
				<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
					{#each Array(6) as _}
						<div class="bg-surface border-border/40 h-48 animate-pulse rounded-xl border"></div>
					{/each}
				</div>
			{:else if waitingBattles.length === 0}
				<div class="py-12 text-center">
					<Clock class="text-muted-foreground mx-auto mb-4 h-12 w-12" />
					<h3 class="text-foreground mb-2 text-xl font-semibold">No Waiting Battles</h3>
					<p class="text-muted-foreground mb-4">
						Be the first to create a battle and start the action!
					</p>
					<Button onclick={handleCreateBattle} class="gap-2">
						<Trophy class="h-4 w-4" />
						Create First Battle
					</Button>
				</div>
			{:else}
				<!-- Waiting Battles Grid -->
				<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
					{#each waitingBattles as battle (battle.id)}
						<div
							class="group bg-surface border-border/40 hover:border-primary/50 hover:shadow-primary/10 relative overflow-hidden rounded-xl border transition-all duration-300 hover:shadow-lg"
						>
							<!-- Battle Header -->
							<div class="border-border/40 border-b p-4">
								<div class="mb-3 flex items-start justify-between">
									<div class="flex items-center gap-2">
										{#if battle.case?.image_url}
											<img
												src={battle.case.image_url}
												alt={battle.case.name}
												class="h-10 w-10 rounded-lg object-cover"
											/>
										{/if}
										<div>
											<h3 class="text-foreground font-semibold">
												{battle.case?.name || 'Unknown Case'}
											</h3>
											<p class="text-muted-foreground text-xs">{battle.rounds_count} rounds</p>
										</div>
									</div>
									<Badge variant="outline" class={getStatusColor(battle.status)}>
										{battle.status}
									</Badge>
								</div>

								<!-- Mode and Participants -->
								<div class="flex items-center justify-between text-sm">
									<div class="flex items-center gap-1">
										{#if battle.mode === 'crazy'}
											<Sparkles class="text-primary h-4 w-4" />
										{:else}
											<Trophy class="text-primary h-4 w-4" />
										{/if}
										<span class="text-muted-foreground capitalize">{battle.mode}</span>
									</div>
									<div class="flex items-center gap-1">
										<Users class="text-muted-foreground h-4 w-4" />
										<span class="text-foreground">
											{battle.current_participants}/{battle.max_participants}
										</span>
									</div>
								</div>
							</div>

							<!-- Participants -->
							<div class="space-y-2 p-4">
								{#each battle.participants?.slice(0, 3) || [] as participant}
									<div class="flex items-center gap-2 text-sm">
										{#if participant.user?.avatar_url}
											<img
												src={participant.user.avatar_url}
												alt={participant.user.username}
												class="h-6 w-6 rounded-full"
											/>
										{:else}
											<div
												class="bg-surface-muted flex h-6 w-6 items-center justify-center rounded-full"
											>
												<Users class="text-muted-foreground h-3 w-3" />
											</div>
										{/if}
										<span class="text-foreground">{participant.user?.username}</span>
									</div>
								{/each}
								{#if (battle.participants?.length || 0) < battle.max_participants}
									<div class="text-muted-foreground flex items-center gap-2 text-sm">
										<div
											class="border-border/40 flex h-6 w-6 items-center justify-center rounded-full border-2 border-dashed"
										>
											<span class="text-xs">+</span>
										</div>
										<span>Waiting for player...</span>
									</div>
								{/if}
							</div>

							<!-- Footer with Pot and Actions -->
							<div class="bg-surface-accent border-border/40 border-t p-4">
								<div class="mb-3 flex items-center justify-between">
									<div>
										<p class="text-muted-foreground text-xs">Entry Fee</p>
										<p class="font-semibold text-emerald-400">${battle.entry_fee.toFixed(2)}</p>
									</div>
									<div class="text-right">
										<p class="text-muted-foreground text-xs">Total Pot</p>
										<p class="text-lg font-bold text-emerald-400">${battle.total_pot.toFixed(2)}</p>
									</div>
								</div>
								<div class="flex gap-2">
									<Button
										size="sm"
										class="flex-1 gap-1"
										onclick={() => handleJoinBattle(battle.id)}
									>
										<Play class="h-3 w-3" />
										Join Battle
									</Button>
									<Button
										size="sm"
										variant="outline"
										class="gap-1"
										onclick={() => handleSpectateBattle(battle.id)}
									>
										<Eye class="h-3 w-3" />
									</Button>
								</div>
							</div>

							<!-- Time Ago Badge -->
							<div class="absolute top-2 right-2">
								<Badge variant="outline" class="bg-surface/80 text-xs backdrop-blur-sm">
									{formatTimeAgo(battle.created_at)}
								</Badge>
							</div>
						</div>
					{/each}
				</div>
			{/if}
		</TabsContent>

		<TabsContent value="active" class="space-y-4">
			{#if isLoading}
				<!-- Loading Skeleton -->
				<div class="space-y-4">
					{#each Array(3) as _}
						<div class="bg-surface border-border/40 h-32 animate-pulse rounded-xl border"></div>
					{/each}
				</div>
			{:else if activeBattles.length === 0}
				<div class="py-12 text-center">
					<Play class="text-muted-foreground mx-auto mb-4 h-12 w-12" />
					<h3 class="text-foreground mb-2 text-xl font-semibold">No Active Battles</h3>
					<p class="text-muted-foreground">
						Join waiting battles or create your own to get started!
					</p>
				</div>
			{:else}
				<!-- Active Battles List -->
				<div class="space-y-4">
					{#each activeBattles as battle (battle.id)}
						<div class="bg-surface border-border/40 rounded-xl border p-6">
							<div class="flex items-center justify-between">
								<div class="flex items-center gap-4">
									{#if battle.case?.image_url}
										<img
											src={battle.case.image_url}
											alt={battle.case.name}
											class="h-16 w-16 rounded-xl object-cover"
										/>
									{/if}
									<div>
										<h3 class="text-foreground mb-1 text-lg font-semibold">
											{battle.case?.name || 'Unknown Case'}
										</h3>
										<div class="text-muted-foreground flex items-center gap-4 text-sm">
											<span class="capitalize">{battle.mode} mode</span>
											<span>•</span>
											<span>Round {battle.current_round}/{battle.rounds_count}</span>
											<span>•</span>
											<span>{battle.current_participants} players</span>
										</div>
									</div>
								</div>
								<div class="text-right">
									<p class="text-muted-foreground mb-1 text-sm">Pot Size</p>
									<p class="text-2xl font-bold text-emerald-400">${battle.total_pot.toFixed(2)}</p>
								</div>
							</div>
							<div class="mt-4 flex justify-end">
								<Button
									variant="outline"
									class="gap-2"
									onclick={() => handleSpectateBattle(battle.id)}
								>
									<Eye class="h-4 w-4" />
									Spectate Battle
								</Button>
							</div>
						</div>
					{/each}
				</div>
			{/if}
		</TabsContent>
	</Tabs>
</section>

<!-- Create Battle Dialog -->
{#if createDialogOpen}
	<BattleCreateDialog
		open={createDialogOpen}
		{userBalance}
		onOpenChange={(open: boolean) => (createDialogOpen = open)}
		onBattleCreated={async (battle: any) => {
			console.log('Battle created:', battle);
			createDialogOpen = false;
			// Reload battles after creating new one
			await loadBattles();
		}}
	/>
{/if}
