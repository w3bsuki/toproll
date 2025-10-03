<script lang="ts">
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import BattleRoom from '$lib/components/battles/BattleRoom.svelte';
	import { Button } from '$lib/components/ui/button';
	import { ArrowLeft, Users, Trophy } from '@lucide/svelte';
	import { createBattleRoom } from '$lib/realtime';
	import type { Battle } from '$lib/types';

	// Get battle ID from URL params
	let battleId = $state($page.params.id as string);
	let battle = $state<Battle | null>(null);
	let isLoading = $state(true);
	let error = $state<string | null>(null);

	// Create battle room with realtime
	let battleRoom = createBattleRoom(battleId!);

	// Navigate back to lobby
	function goBack() {
		window.location.href = '/battles';
	}

	// Load battle data
	onMount(async () => {
		try {
			// TODO: Replace with actual API call
			// const response = await fetch(`/api/battles/${battleId}`);
			// battle = await response.json();

			// Mock data for now
			setTimeout(() => {
				battle = {
					id: battleId!,
					case_id: 'case-1',
					status: 'in_progress',
					mode: 'standard',
					max_participants: 2,
					current_participants: 2,
					total_pot: 15.5,
					entry_fee: 7.75,
					rounds_count: 3,
					current_round: 2,
					created_by: 'user-1',
					created_at: new Date(Date.now() - 600000).toISOString(),
					case: {
						id: 'case-1',
						name: 'Dreams & Nightmares',
						price: 7.75,
						item_count: 17,
						image_url: '/cases/dreams-nightmares.jpg',
						created_at: new Date().toISOString(),
						updated_at: new Date().toISOString()
					},
					participants: [
						{
							id: 'p1',
							battle_id: battleId!,
							user_id: 'user-1',
							position: 1,
							joined_at: new Date(Date.now() - 600000).toISOString(),
							user: {
								id: 'user-1',
								username: 'Shaddy',
								avatar_url: '/avatars/shaddy.jpg'
							}
						},
						{
							id: 'p2',
							battle_id: battleId!,
							user_id: 'user-2',
							position: 2,
							joined_at: new Date(Date.now() - 550000).toISOString(),
							user: {
								id: 'user-2',
								username: 'PartyBoy69',
								avatar_url: '/avatars/partyboy.jpg'
							}
						}
					]
				};
				isLoading = false;
			}, 1000);
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to load battle';
			isLoading = false;
		}
	});
</script>

<svelte:head>
	<title>Battle #{battleId} - TopRoll</title>
	<meta name="description" content="Watch live case battles and epic skin reveals" />
</svelte:head>

<!-- Loading State -->
{#if isLoading}
	<div class="bg-background flex min-h-screen items-center justify-center">
		<div class="text-center">
			<div
				class="border-primary mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-t-transparent"
			></div>
			<p class="text-muted-foreground">Loading battle...</p>
		</div>
	</div>
{:else if error}
	<div class="bg-background flex min-h-screen items-center justify-center">
		<div class="max-w-md text-center">
			<h2 class="text-foreground mb-2 text-2xl font-bold">Battle Not Found</h2>
			<p class="text-muted-foreground mb-4">{error}</p>
			<Button onclick={goBack} class="gap-2">
				<ArrowLeft class="h-4 w-4" />
				Back to Battles
			</Button>
		</div>
	</div>
{:else if battle}
	<div class="bg-background min-h-screen">
		<!-- Battle Header -->
		<header class="border-border/40 bg-surface/50 sticky top-0 z-40 border-b backdrop-blur-sm">
			<div class="container mx-auto px-4 py-4">
				<div class="flex items-center justify-between">
					<div class="flex items-center gap-4">
						<Button variant="ghost" size="sm" onclick={goBack} class="gap-2">
							<ArrowLeft class="h-4 w-4" />
							Back
						</Button>
						<div class="flex items-center gap-3">
							{#if battle.case?.image_url}
								<img
									src={battle.case.image_url}
									alt={battle.case.name}
									class="border-border/40 h-10 w-10 rounded-lg border object-cover"
								/>
							{/if}
							<div>
								<h1 class="text-foreground text-xl font-bold">
									Battle #{battle.id}
								</h1>
								<p class="text-muted-foreground text-sm">
									{battle.case?.name} • {battle.mode} mode
								</p>
							</div>
						</div>
					</div>
					<div class="flex items-center gap-6">
						<div class="flex items-center gap-2">
							<Users class="text-muted-foreground h-4 w-4" />
							<span class="text-muted-foreground text-sm">Players:</span>
							<span class="text-foreground font-semibold">
								{battle.current_participants}/{battle.max_participants}
							</span>
						</div>
						<div class="flex items-center gap-2">
							<Trophy class="text-muted-foreground h-4 w-4" />
							<span class="text-muted-foreground text-sm">Pot:</span>
							<span class="font-bold text-emerald-400">
								${battle.total_pot.toFixed(2)}
							</span>
						</div>
						{#if battle?.status === 'in_progress'}
							<div class="flex items-center gap-2">
								<div class="h-2 w-2 animate-pulse rounded-full bg-emerald-500"></div>
								<span class="text-sm font-medium text-emerald-400">LIVE</span>
							</div>
						{/if}
					</div>
				</div>
			</div>
		</header>

		<!-- Battle Room -->
		<main class="container mx-auto px-4 py-6">
			<BattleRoom battleId={battleId!} {battle} {battleRoom} />
		</main>
	</div>
{/if}
