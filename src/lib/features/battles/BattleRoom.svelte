<script lang="ts">
	import {
		Button,
		Badge,
		Card,
		CardContent,
		CardDescription,
		CardHeader,
		CardTitle,
		Separator,
		Tabs,
		TabsContent,
		TabsList,
		TabsTrigger
	} from '$lib/components/ui';
	import Progress from '$lib/components/ui/progress/progress.svelte';
	import BattlePullReel from './BattlePullReel.svelte';
	import BattleTotals from './BattleTotals.svelte';
	import { ChatPanel } from '$lib/features/layout';
	import {
		Trophy,
		Users,
		Clock,
		Play,
		Eye,
		Flame,
		Currency,
		Sparkles,
		CheckCircle,
		AlertCircle,
		RefreshCw,
		Shield
	} from '@lucide/svelte';
	import type { Battle, BattleParticipant, BattleRound, BattlePull, CaseItem } from '$lib/types/index';

	// Props using Svelte 5 syntax
	let {
		battleId,
		battle,
		battleRoom
	}: {
		battleId: string;
		battle?: Battle | null;
		battleRoom: {
			battle: any;
			rounds: any;
			pulls: any;
			participants: any;
			isLoading: () => boolean;
			isConnected: () => boolean;
			error: () => string | null;
			disconnect: () => void;
			client: any;
		};
	} = $props();

	// Reactive state
	let activeTab = $state('battle');
	let isRevealing = $state(false);
	let currentRound = $derived(battle?.current_round || 1);
	let totalRounds = $derived(battle?.rounds_count || 3);
	let battleProgress = $derived((currentRound / totalRounds) * 100);

	// Mock battle data for development
	let rounds = $state<BattleRound[]>([
		{
			id: 'round-1',
			battle_id: battleId,
			round_index: 0,
			case_id: 'case-1',
			server_seed_hash: 'hash-123',
			created_at: new Date().toISOString()
		},
		{
			id: 'round-2',
			battle_id: battleId,
			round_index: 1,
			case_id: 'case-2',
			server_seed_hash: 'hash-456',
			created_at: new Date().toISOString()
		},
		{
			id: 'round-3',
			battle_id: battleId,
			round_index: 2,
			case_id: 'case-3',
			server_seed_hash: 'hash-789',
			created_at: new Date().toISOString()
		}
	]);

	// Mock pull data
	let pulls = $state<Map<string, BattlePull[]>>(
		new Map([
			[
				'round-1',
				[
					{
						id: 'pull-1',
						round_id: 'round-1',
						participant_id: 'p1',
						item_id: 'item-1',
						client_seed: 'client-seed-1',
						nonce: 1,
						hash: 'pull-hash-1',
						mapped_roll: 42,
						created_at: new Date().toISOString(),
						item: {
							id: 'item-1',
							case_id: 'case-1',
							name: 'AK-47 | Redline',
							market_name: 'AK-47 | Redline (Field-Tested)',
							image_url: '/items/ak47-redline.jpg',
							rarity: 'Epic',
							probability: 3.5,
							market_value: 25.5,
							created_at: new Date().toISOString()
						},
						participant: {
							id: 'p1',
							battle_id: battleId,
							user_id: 'user-1',
							position: 1,
							joined_at: new Date().toISOString(),
							user: {
								id: 'user-1',
								username: 'Shaddy',
								avatar_url: '/avatars/shaddy.jpg'
							}
						}
					},
					{
						id: 'pull-2',
						round_id: 'round-1',
						participant_id: 'p2',
						item_id: 'item-2',
						client_seed: 'client-seed-2',
						nonce: 2,
						hash: 'pull-hash-2',
						mapped_roll: 15,
						created_at: new Date().toISOString(),
						item: {
							id: 'item-2',
							case_id: 'case-1',
							name: 'AWP | Dragon Lore',
							market_name: 'AWP | Dragon Lore (Factory New)',
							image_url: '/items/awp-dragon-lore.jpg',
							rarity: 'Legendary',
							probability: 1.4,
							market_value: 8500.0,
							created_at: new Date().toISOString()
						},
						participant: {
							id: 'p2',
							battle_id: battleId,
							user_id: 'user-2',
							position: 2,
							joined_at: new Date().toISOString(),
							user: {
								id: 'user-2',
								username: 'PartyBoy69',
								avatar_url: '/avatars/partyboy.jpg'
							}
						}
					}
				]
			],
			[
				'round-2',
				[
					{
						id: 'pull-3',
						round_id: 'round-2',
						participant_id: 'p1',
						item_id: 'item-3',
						client_seed: 'client-seed-3',
						nonce: 3,
						hash: 'pull-hash-3',
						mapped_roll: 78,
						created_at: new Date().toISOString(),
						item: {
							id: 'item-3',
							case_id: 'case-2',
							name: 'M4A4 | Howl',
							market_name: 'M4A4 | Howl (Minimal Wear)',
							image_url: '/items/m4a4-howl.jpg',
							rarity: 'Contraband',
							probability: 0.1,
							market_value: 3200.0,
							created_at: new Date().toISOString()
						},
						participant: {
							id: 'p1',
							battle_id: battleId,
							user_id: 'user-1',
							position: 1,
							joined_at: new Date().toISOString(),
							user: {
								id: 'user-1',
								username: 'Shaddy',
								avatar_url: '/avatars/shaddy.jpg'
							}
						}
					}
				]
			]
		])
	);

	// Mock running totals
	let runningTotals = $state<Record<string, number>>({
		p1: 3225.5,
		p2: 8500.0
	});

	// Computed values
	const currentRoundData = $derived(rounds[currentRound - 1]);
	const currentPulls = $derived(currentRoundData ? pulls.get(currentRoundData.id) || [] : []);
	const isRoundComplete = $derived(currentPulls.length === (battle?.participants?.length || 0));
	const isBattleComplete = $derived(battle?.status === 'completed');
	const winner = $derived(
		isBattleComplete && battle?.winner_id
			? battle.participants?.find((p) => p.user_id === battle.winner_id)
			: null
	);

	// Get rarity color
	function getRarityColor(rarity: CaseItem['rarity']) {
		const colors = {
			Common: 'bg-surface-muted text-surface-muted-foreground border-border/70',
			Uncommon: 'bg-secondary/20 text-secondary-foreground border-secondary/60',
			Rare: 'bg-primary/15 text-primary border-primary/50',
			Epic: 'bg-accent/20 text-accent-foreground border-accent/50',
			Legendary: 'bg-warning/20 text-warning-foreground border-warning/55',
			Contraband: 'bg-destructive/20 text-destructive-foreground border-destructive/60'
		};
		return colors[rarity] || colors.Common;
	}

	// Format currency
	function formatCurrency(amount: number): string {
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: 'USD'
		}).format(amount);
	}

	// Format time
	function formatTime(dateString: string): string {
		return new Date(dateString).toLocaleTimeString();
	}

	// Simulate round reveal
	async function revealRound() {
		if (isRevealing || isRoundComplete) return;

		isRevealing = true;
		await new Promise((resolve) => setTimeout(resolve, 3000));
		isRevealing = false;
	}

	// Get mode icon
	function getModeIcon(mode: Battle['mode']) {
		return mode === 'crazy' ? Sparkles : Trophy;
	}

	// Get status color
	function getStatusColor(status: Battle['status']) {
		switch (status) {
			case 'waiting':
				return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
			case 'locking':
				return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
			case 'in_progress':
				return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
			case 'settling':
				return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
			case 'completed':
				return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
			default:
				return 'bg-surface-muted text-surface-muted-foreground border-border/70';
		}
	}
</script>

{#if battle}
	<div class="grid grid-cols-1 gap-6 lg:grid-cols-4">
		<!-- Main Battle Area -->
		<div class="space-y-6 lg:col-span-3">
			<!-- Battle Header -->
			<Card>
				<CardHeader>
					<div class="flex items-center justify-between">
						<div class="flex items-center gap-4">
							{#if battle.case?.image_url}
								<img
									src={battle.case.image_url}
									alt={battle.case.name}
									class="border-border/40 h-16 w-16 rounded-xl border object-cover"
								/>
							{/if}
							<div>
								<CardTitle class="flex items-center gap-2">
									{battle.case?.name} Battle
									{@const ModeIcon = getModeIcon(battle.mode)}
									<ModeIcon class="text-primary h-5 w-5" />
								</CardTitle>
								<CardDescription>
									<span class="capitalize">{battle.mode} mode</span>
									<Separator orientation="vertical" class="mx-2 h-4" />
									{battle.max_participants} players
									<Separator orientation="vertical" class="mx-2 h-4" />
									{battle.rounds_count} rounds
								</CardDescription>
							</div>
						</div>
						<div class="flex items-center gap-4">
							<div class="text-right">
								<p class="text-muted-foreground text-sm">Total Pot</p>
								<p class="text-2xl font-bold text-emerald-400">
									{formatCurrency(battle.total_pot)}
								</p>
							</div>
							<Badge variant="outline" class={getStatusColor(battle.status)}>
								{battle.status.replace('_', ' ')}
							</Badge>
							{#if battle?.status === 'in_progress'}
								<div class="flex items-center gap-2">
									<span class="sr-only">Battle status:</span>
									<div
										class="bg-destructive h-2 w-2 animate-pulse rounded-full"
										aria-hidden="true"
									></div>
									<span class="text-destructive text-sm font-medium">Live</span>
								</div>
							{/if}
						</div>
					</div>
				</CardHeader>
				<CardContent>
					<!-- Progress Bar -->
					<div class="space-y-2">
						<div class="flex items-center justify-between text-sm">
							<span class="text-muted-foreground">Battle Progress</span>
							<span class="text-foreground font-medium">Round {currentRound} of {totalRounds}</span>
						</div>
						<Progress value={battleProgress} class="h-2" />
					</div>

					<!-- Participants -->
					<div class="mt-6">
						<h3 class="text-foreground mb-4 flex items-center gap-2 font-semibold">
							<Users class="h-4 w-4" />
							Participants
						</h3>
						<div class="grid gap-4 md:grid-cols-2">
							{#each battle.participants || [] as participant (participant.id)}
								<div
									class="bg-surface border-border/40 flex items-center justify-between rounded-lg border p-4"
								>
									<div class="flex items-center gap-3">
										<span class="text-muted-foreground text-lg font-bold"
											>#{participant.position}</span
										>
										{#if participant.user?.avatar_url}
											<img
												src={participant.user.avatar_url}
												alt={participant.user.username}
												class="h-10 w-10 rounded-full"
											/>
										{:else}
											<div
												class="bg-surface-muted flex h-10 w-10 items-center justify-center rounded-full"
											>
												<Users class="text-muted-foreground h-5 w-5" />
											</div>
										{/if}
										<div>
											<p class="text-foreground font-semibold">{participant.user?.username}</p>
											<p class="text-muted-foreground text-sm">
												Joined {formatTime(participant.joined_at)}
											</p>
										</div>
									</div>
									<div class="text-right">
										<p class="text-muted-foreground text-sm">Total</p>
										<p class="font-bold text-emerald-400">
											{formatCurrency(runningTotals[participant.id] || 0)}
										</p>
										{#if winner && participant.user_id === winner.user_id}
											<Badge variant="default" class="mt-1 gap-1">
												<Trophy class="h-3 w-3" />
												Winner
											</Badge>
										{/if}
									</div>
								</div>
							{/each}
						</div>
					</div>
				</CardContent>
			</Card>

			<!-- Battle Tabs -->
			<Tabs bind:value={activeTab} class="w-full">
				<TabsList class="grid w-full grid-cols-3">
					<TabsTrigger value="battle" class="gap-2">
						<Play class="h-4 w-4" />
						Battle
					</TabsTrigger>
					<TabsTrigger value="rounds" class="gap-2">
						<Clock class="h-4 w-4" />
						Rounds
					</TabsTrigger>
					<TabsTrigger value="proof" class="gap-2">
						<CheckCircle class="h-4 w-4" />
						Proof
					</TabsTrigger>
				</TabsList>

				<!-- Battle Tab -->
				<TabsContent value="battle" class="space-y-6">
					<!-- Current Round -->
					<Card>
						<CardHeader>
							<CardTitle class="flex items-center justify-between">
								<span class="flex items-center gap-2">
									<Flame class="text-primary h-5 w-5" />
									Current Round
								</span>
								{#if !isRoundComplete && battle.status === 'in_progress'}
									<Button onclick={revealRound} disabled={isRevealing} class="gap-2">
										{#if isRevealing}
											<RefreshCw class="h-4 w-4 animate-spin" />
											Revealing...
										{:else}
											<Play class="h-4 w-4" />
											Reveal Items
										{/if}
									</Button>
								{/if}
							</CardTitle>
							<CardDescription>
								{#if isRoundComplete}
									All items have been revealed for this round
								{:else if isRevealing}
									Revealing items...
								{:else if battle.status === 'in_progress'}
									Click "Reveal Items" to see the results
								{:else}
									Waiting for battle to start...
								{/if}
							</CardDescription>
						</CardHeader>
						<CardContent>
							<BattlePullReel
								{battle}
								{currentRound}
								{currentPulls}
								{isRevealing}
								{isRoundComplete}
							/>
						</CardContent>
					</Card>

					<!-- Running Totals -->
					<BattleTotals {battle} {runningTotals} {winner} {isBattleComplete} />
				</TabsContent>

				<!-- Rounds Tab -->
				<TabsContent value="rounds" class="space-y-4">
					{#each rounds as round (round.id)}
						<Card class={currentRoundData?.id === round.id ? 'border-primary/50' : ''}>
							<CardHeader>
								<CardTitle class="flex items-center justify-between">
									<span class="flex items-center gap-2">
										Round {round.round_index + 1}
										{#if currentRoundData?.id === round.id}
											<Badge variant="default" class="gap-1">
												<Play class="h-3 w-3" />
												Current
											</Badge>
										{/if}
									</span>
									<div class="text-muted-foreground text-sm">
										{pulls.get(round.id)?.length || 0} pulls
									</div>
								</CardTitle>
								<CardDescription>
									Case: {battle.case?.name}
								</CardDescription>
							</CardHeader>
							<CardContent>
								{#if pulls.get(round.id)?.length}
									<div class="grid gap-3 md:grid-cols-2">
										{#each pulls.get(round.id) || [] as pull (pull.id)}
											<div
												class="bg-surface border-border/40 flex items-center gap-3 rounded-lg border p-3"
											>
												<span class="text-muted-foreground text-sm font-bold">
													#{pull.participant?.position}
												</span>
												{#if pull.item?.image_url}
													<img
														src={pull.item.image_url}
														alt={pull.item.name}
														class="h-12 w-12 rounded-lg object-cover"
													/>
												{/if}
												<div class="flex-1">
													<p class="text-foreground font-semibold">{pull.item?.name}</p>
													<div class="mt-1 flex items-center gap-2">
														<Badge
															variant="outline"
															class={getRarityColor(pull.item?.rarity || 'Common')}
														>
															{pull.item?.rarity}
														</Badge>
														<span class="text-muted-foreground text-sm">
															Roll: #{pull.mapped_roll}
														</span>
													</div>
												</div>
												<div class="text-right">
													<p class="font-bold text-emerald-400">
														{formatCurrency(pull.item?.market_value || 0)}
													</p>
												</div>
											</div>
										{/each}
									</div>
								{:else}
									<div class="text-muted-foreground py-8 text-center">
										<Clock class="mx-auto mb-2 h-8 w-8" />
										<p>No pulls yet for this round</p>
									</div>
								{/if}
							</CardContent>
						</Card>
					{/each}
				</TabsContent>

				<!-- Proof Tab -->
				<TabsContent value="proof" class="space-y-6">
					<Card>
						<CardHeader>
							<CardTitle class="flex items-center gap-2">
								<Shield class="h-5 w-5" />
								Provably Fair Information
							</CardTitle>
							<CardDescription>Verify the fairness of this battle</CardDescription>
						</CardHeader>
						<CardContent class="space-y-4">
							{#each rounds as round (round.id)}
								<div class="bg-surface border-border/40 rounded-lg border p-4">
									<h4 class="text-foreground mb-2 font-semibold">Round {round.round_index + 1}</h4>
									<div class="space-y-2 text-sm">
										<div class="flex justify-between">
											<span class="text-muted-foreground">Server Seed Hash:</span>
											<span class="text-foreground font-mono">{round.server_seed_hash}</span>
										</div>
										{#if round.revealed_server_seed}
											<div class="flex justify-between">
												<span class="text-muted-foreground">Server Seed:</span>
												<span class="text-foreground font-mono">{round.revealed_server_seed}</span>
											</div>
										{/if}
									</div>
									{#if !round.revealed_server_seed}
										<p class="text-muted-foreground mt-2 text-xs">
											Server seed will be revealed when the battle completes
										</p>
									{/if}
								</div>
							{/each}
						</CardContent>
					</Card>
				</TabsContent>
			</Tabs>
		</div>

		<!-- Chat Sidebar -->
		<div class="lg:col-span-1">
			<Card class="flex h-[600px] flex-col">
				<CardHeader class="pb-3">
					<CardTitle class="flex items-center gap-2">
						<Eye class="h-4 w-4" />
						Live Chat
					</CardTitle>
				</CardHeader>
				<CardContent class="flex-1 p-0">
					<ChatPanel />
				</CardContent>
			</Card>
		</div>
	</div>
{:else}
	<div class="py-12 text-center">
		<AlertCircle class="text-muted-foreground mx-auto mb-4 h-12 w-12" />
		<h3 class="text-foreground mb-2 text-xl font-semibold">Battle Not Found</h3>
		<p class="text-muted-foreground">
			The battle you're looking for doesn't exist or has been removed.
		</p>
	</div>
{/if}
