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
	let userBalance = $state(1000.00); // Mock balance
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
		battles.filter(b => b && b.status === 'waiting' && b.current_participants < b.max_participants)
	);
	const activeBattles = $derived(
		battles.filter(b => b && (b.status === 'in_progress' || b.status === 'locking'))
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
			case 'waiting': return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
			case 'locking': return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
			case 'in_progress': return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
			case 'completed': return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
			default: return 'bg-surface-muted text-surface-muted-foreground border-border/70';
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
<section class="container mx-auto px-4 py-6 max-w-7xl">
	<!-- Header -->
	<header class="mb-6">
		<div class="flex items-center justify-between">
			<div>
				<h1 class="text-3xl font-bold text-foreground mb-2">
					Case Battles
					<Flame class="inline-block h-7 w-7 ml-2 text-warning" />
				</h1>
				<p class="text-muted-foreground text-lg">
					Create epic battles, challenge opponents, and win legendary skins
				</p>
			</div>
			<div class="flex items-center gap-4">
				<div class="text-right">
					<p class="text-sm text-muted-foreground">Your Balance</p>
					<p class="text-xl font-bold text-emerald-400">${userBalance.toFixed(2)}</p>
				</div>
				<Button
					size="lg"
					onclick={handleCreateBattle}
					class="bg-primary text-primary-foreground hover:bg-primary/90 font-bold gap-2"
				>
					<Trophy class="h-4 w-4" />
					Create Battle
				</Button>
			</div>
		</div>
	</header>

	<!-- Battle Tabs -->
	<Tabs bind:value={activeTab} class="mb-6">
		<div class="flex items-center justify-between mb-4">
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
					<Users class="h-4 w-4 text-muted-foreground" />
					<span class="text-muted-foreground">Total Players:</span>
					<span class="font-semibold text-foreground">
						{battles.reduce((sum, b) => sum + b.current_participants, 0)}
					</span>
				</div>
				<div class="flex items-center gap-2">
					<Currency class="h-4 w-4 text-muted-foreground" />
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
						<div class="h-48 bg-surface rounded-xl border border-border/40 animate-pulse"></div>
					{/each}
				</div>
			{:else if waitingBattles.length === 0}
				<div class="text-center py-12">
					<Clock class="h-12 w-12 mx-auto text-muted-foreground mb-4" />
					<h3 class="text-xl font-semibold text-foreground mb-2">No Waiting Battles</h3>
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
						<div class="group relative bg-surface rounded-xl border border-border/40 overflow-hidden hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10">
							<!-- Battle Header -->
							<div class="p-4 border-b border-border/40">
								<div class="flex items-start justify-between mb-3">
									<div class="flex items-center gap-2">
										{#if battle.case?.image_url}
											<img
												src={battle.case.image_url}
												alt={battle.case.name}
												class="h-10 w-10 rounded-lg object-cover"
											/>
										{/if}
										<div>
											<h3 class="font-semibold text-foreground">{battle.case?.name || 'Unknown Case'}</h3>
											<p class="text-xs text-muted-foreground">{battle.rounds_count} rounds</p>
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
											<Sparkles class="h-4 w-4 text-primary" />
										{:else}
											<Trophy class="h-4 w-4 text-primary" />
										{/if}
										<span class="capitalize text-muted-foreground">{battle.mode}</span>
									</div>
									<div class="flex items-center gap-1">
										<Users class="h-4 w-4 text-muted-foreground" />
										<span class="text-foreground">
											{battle.current_participants}/{battle.max_participants}
										</span>
									</div>
								</div>
							</div>

							<!-- Participants -->
							<div class="p-4 space-y-2">
								{#each battle.participants?.slice(0, 3) || [] as participant}
									<div class="flex items-center gap-2 text-sm">
										{#if participant.user?.avatar_url}
											<img
												src={participant.user.avatar_url}
												alt={participant.user.username}
												class="h-6 w-6 rounded-full"
											/>
										{:else}
											<div class="h-6 w-6 rounded-full bg-surface-muted flex items-center justify-center">
												<Users class="h-3 w-3 text-muted-foreground" />
											</div>
										{/if}
										<span class="text-foreground">{participant.user?.username}</span>
									</div>
								{/each}
								{#if (battle.participants?.length || 0) < battle.max_participants}
									<div class="flex items-center gap-2 text-sm text-muted-foreground">
										<div class="h-6 w-6 rounded-full border-2 border-dashed border-border/40 flex items-center justify-center">
											<span class="text-xs">+</span>
										</div>
										<span>Waiting for player...</span>
									</div>
								{/if}
							</div>

							<!-- Footer with Pot and Actions -->
							<div class="p-4 bg-surface-accent border-t border-border/40">
								<div class="flex items-center justify-between mb-3">
									<div>
										<p class="text-xs text-muted-foreground">Entry Fee</p>
										<p class="font-semibold text-emerald-400">${battle.entry_fee.toFixed(2)}</p>
									</div>
									<div class="text-right">
										<p class="text-xs text-muted-foreground">Total Pot</p>
										<p class="font-bold text-lg text-emerald-400">${battle.total_pot.toFixed(2)}</p>
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
								<Badge variant="outline" class="text-xs bg-surface/80 backdrop-blur-sm">
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
						<div class="h-32 bg-surface rounded-xl border border-border/40 animate-pulse"></div>
					{/each}
				</div>
			{:else if activeBattles.length === 0}
				<div class="text-center py-12">
					<Play class="h-12 w-12 mx-auto text-muted-foreground mb-4" />
					<h3 class="text-xl font-semibold text-foreground mb-2">No Active Battles</h3>
					<p class="text-muted-foreground">
						Join waiting battles or create your own to get started!
					</p>
				</div>
			{:else}
				<!-- Active Battles List -->
				<div class="space-y-4">
					{#each activeBattles as battle (battle.id)}
						<div class="bg-surface rounded-xl border border-border/40 p-6">
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
										<h3 class="text-lg font-semibold text-foreground mb-1">
											{battle.case?.name || 'Unknown Case'}
										</h3>
										<div class="flex items-center gap-4 text-sm text-muted-foreground">
											<span class="capitalize">{battle.mode} mode</span>
											<span>•</span>
											<span>Round {battle.current_round}/{battle.rounds_count}</span>
											<span>•</span>
											<span>{battle.current_participants} players</span>
										</div>
									</div>
								</div>
								<div class="text-right">
									<p class="text-sm text-muted-foreground mb-1">Pot Size</p>
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
		userBalance={userBalance}
		onOpenChange={(open: boolean) => createDialogOpen = open}
		onBattleCreated={async (battle: any) => {
			console.log('Battle created:', battle);
			createDialogOpen = false;
			// Reload battles after creating new one
			await loadBattles();
		}}
	/>
{/if}

