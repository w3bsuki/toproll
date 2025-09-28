<script lang="ts">
	import { Users, Clock, Trophy } from 'lucide-svelte';
	import type { CS2Item } from '$lib/types';

	interface BattlePlayer {
		id: string;
		name: string;
		avatar?: string;
		items: CS2Item[];
		totalValue: number;
		ready: boolean;
	}

	interface CaseBattleProps {
		battleId?: string;
		maxPlayers?: number;
		entryFee?: number;
		onJoin?: (battleId: string) => void;
		onLeave?: (battleId: string) => void;
		class?: string;
	}

	let {
		battleId = 'battle_001',
		maxPlayers = 2,
		entryFee = 2.49,
		onJoin,
		onLeave,
		class: className
	}: CaseBattleProps = $props();

	let players = $state<BattlePlayer[]>([
		{
			id: '1',
			name: 'ProGamer123',
			avatar: 'https://avatars.steamstatic.com/fef49e7fa7e1997310d705b2a6158ff8dc1cdfeb_medium.jpg',
			items: [],
			totalValue: 0,
			ready: true
		},
		{
			id: '2',
			name: 'CS2Legend',
			avatar: 'https://avatars.steamstatic.com/fef49e7fa7e1997310d705b2a6158ff8dc1cdfeb_medium.jpg',
			items: [],
			totalValue: 0,
			ready: false
		}
	]);

	let isJoined = $state(false);
	let isStarting = $state(false);
	let countdown = $state(0);
	let battleStarted = $state(false);

	function getRarityColor(rarity: string): string {
		const colors = {
			Consumer: 'bg-muted text-muted-foreground',
			Industrial: 'bg-info text-foreground',
			'Mil-Spec': 'bg-primary text-primary-foreground',
			Restricted: 'bg-warning text-foreground',
			Classified: 'bg-accent text-accent-foreground',
			Covert: 'bg-destructive text-destructive-foreground',
			Contraband: 'bg-success text-foreground'
		};
		return colors[rarity as keyof typeof colors] || 'bg-muted text-muted-foreground';
	}

	function joinBattle() {
		if (players.length >= maxPlayers) return;

		const newPlayer: BattlePlayer = {
			id: 'current_user',
			name: 'You',
			items: [],
			totalValue: 0,
			ready: false
		};

		players = [...players, newPlayer];
		isJoined = true;

		if (onJoin) onJoin(battleId);
	}

	function leaveBattle() {
		players = players.filter((p) => p.id !== 'current_user');
		isJoined = false;

		if (onLeave) onLeave(battleId);
	}

	function toggleReady() {
		const currentPlayer = players.find((p) => p.id === 'current_user');
		if (currentPlayer) {
			currentPlayer.ready = !currentPlayer.ready;
		}

		// Start battle if all players ready
		if (players.length >= maxPlayers && players.every((p) => p.ready)) {
			startBattle();
		}
	}

	async function startBattle() {
		isStarting = true;
		countdown = 3;

		// Countdown
		for (let i = 3; i > 0; i--) {
			countdown = i;
			await new Promise((resolve) => setTimeout(resolve, 1000));
		}

		battleStarted = true;
		isStarting = false;

		// Simulate battle results
		simulateBattle();
	}

	function simulateBattle() {
		// Mock battle simulation - in real app this would come from backend
		players = players.map((player) => ({
			...player,
			items: [
				{
					assetid: Math.random().toString(),
					classid: Math.random().toString(),
					instanceid: Math.random().toString(),
					name: 'AK-47 | Redline',
					market_name: 'AK-47 | Redline (Field-Tested)',
					icon_url:
						'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpot7HxfDhjxszJemkV09-5gZKKkuXLPr7Vn35cpsx2g_zH94n6ilO3_0o5N2n3J4eUd1A4Yl_Tq1G_yLrqgZq5vM7Pz3Fj6yIl5CvD2w',
					tradable: true,
					marketable: true,
					market_value: Math.random() * 100 + 10,
					rarity: 'Classified',
					type: 'Rifle',
					wear: 'Field-Tested'
				}
			]
		}));

		// Calculate total values
		players = players.map((player) => ({
			...player,
			totalValue: player.items.reduce((sum, item) => sum + item.market_value, 0)
		}));
	}

	function getWinner(): BattlePlayer | null {
		if (!battleStarted || players.length === 0) return null;
		return players.reduce((winner, player) =>
			player.totalValue > winner.totalValue ? player : winner
		);
	}

	const allPlayersReady = $derived(players.length >= maxPlayers && players.every((p) => p.ready));
	const winner = $derived(getWinner());
</script>

<Card class={cn('p-6', className)}>
	<div class="space-y-6">
		<!-- Battle Header -->
		<div class="flex items-center justify-between">
			<div class="flex items-center gap-3">
				<div class="bg-accent/10 flex h-12 w-12 items-center justify-center rounded-lg">
					<Users class="text-accent h-6 w-6" />
				</div>
				<div>
					<h3 class="text-lg font-semibold">Case Battle</h3>
					<p class="text-muted-foreground text-sm">Entry: ${entryFee}</p>
				</div>
			</div>

			<div class="flex items-center gap-2">
				<Badge variant="outline">
					{players.length}/{maxPlayers} Players
				</Badge>
				{#if battleStarted}
					<Badge class="text-success-foreground bg-success">
						<Trophy class="mr-1 h-3 w-3" />
						Finished
					</Badge>
				{:else if isStarting}
					<Badge class="text-warning-foreground bg-warning">
						<Clock class="mr-1 h-3 w-3" />
						Starting
					</Badge>
				{:else}
					<Badge variant="outline">Waiting</Badge>
				{/if}
			</div>
		</div>

		<!-- Countdown -->
		{#if isStarting}
			<div class="text-center">
				<div class="text-primary mb-4 text-6xl font-bold">{countdown}</div>
				<p class="text-lg">Battle starting...</p>
			</div>
		{/if}

		<!-- Battle Results -->
		{#if battleStarted && winner}
			<div class="space-y-4">
				<div class="text-center">
					<h4 class="text-success text-xl font-bold">
						🎉 {winner.name} Wins!
					</h4>
					<p class="text-muted-foreground">Total Value: ${winner.totalValue.toFixed(2)}</p>
				</div>

				<!-- Results Grid -->
				<div class="grid gap-4">
					{#each players.sort((a, b) => b.totalValue - a.totalValue) as player, index (player.id)}
						<Card class={cn('p-4', index === 0 ? 'ring-success ring-2' : '')}>
							<div class="flex items-center justify-between">
								<div class="flex items-center gap-3">
									{#if index === 0}
										<Trophy class="text-success h-5 w-5" />
									{:else}
										<span class="text-lg font-bold">#{index + 1}</span>
									{/if}

									{#if player.avatar}
										<img src={player.avatar} alt={player.name} class="h-8 w-8 rounded-full" />
									{:else}
										<div class="bg-muted h-8 w-8 rounded-full"></div>
									{/if}

									<div>
										<p class="font-medium">{player.name}</p>
										<p class="text-muted-foreground text-sm">
											{player.items.length} item{player.items.length !== 1 ? 's' : ''}
										</p>
									</div>
								</div>

								<div class="text-right">
									<p class="font-bold">${player.totalValue.toFixed(2)}</p>
									{#if player.items.length > 0}
										<Badge class={getRarityColor(player.items[0].rarity)}>
											{player.items[0].rarity}
										</Badge>
									{/if}
								</div>
							</div>
						</Card>
					{/each}
				</div>
			</div>
		{/if}

		<!-- Lobby -->
		{#if !battleStarted && !isStarting}
			<div class="space-y-4">
				<!-- Players List -->
				<div class="space-y-2">
					<h4 class="font-medium">Players ({players.length}/{maxPlayers})</h4>
					{#each players as player (player.id)}
						<div class="flex items-center justify-between rounded-lg border p-3">
							<div class="flex items-center gap-3">
								{#if player.avatar}
									<img src={player.avatar} alt={player.name} class="h-8 w-8 rounded-full" />
								{:else}
									<div class="bg-muted h-8 w-8 rounded-full"></div>
								{/if}
								<span class="font-medium">{player.name}</span>
							</div>
							<Badge variant={player.ready ? 'default' : 'outline'}>
								{player.ready ? 'Ready' : 'Waiting'}
							</Badge>
						</div>
					{/each}
				</div>

				<!-- Action Buttons -->
				<div class="flex gap-3">
					{#if !isJoined}
						<Button onclick={joinBattle} disabled={players.length >= maxPlayers} class="flex-1">
							Join Battle
						</Button>
					{:else}
						<Button
							onclick={toggleReady}
							variant={players.find((p) => p.id === 'current_user')?.ready ? 'default' : 'outline'}
							class="flex-1"
						>
							{players.find((p) => p.id === 'current_user')?.ready ? 'Ready!' : 'Mark Ready'}
						</Button>
						<Button onclick={leaveBattle} variant="outline" class="flex-1">Leave</Button>
					{/if}
				</div>

				{#if allPlayersReady}
					<div class="text-center">
						<p class="text-muted-foreground text-sm">
							All players ready! Battle will start automatically...
						</p>
					</div>
				{/if}
			</div>
		{/if}
	</div>
</Card>
