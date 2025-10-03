<script lang="ts">
	import { Badge, Button, Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui';
	import { ExternalLink, Wallet, Trophy, TrendingUp, Copy } from '@lucide/svelte';

	export interface SteamProfile {
		steamId: string;
		username: string;
		avatarUrl?: string;
		profileUrl?: string;
		totalWagered?: number;
		totalProfit?: number;
		winRate?: number;
		biggestWin?: number;
		caseBattleWins?: number;
		created_at?: string;
	}

	export interface SteamProfileCardProps {
		profile: SteamProfile;
		compact?: boolean;
		showStats?: boolean;
		class?: string;
	}

	let {
		profile,
		compact = false,
		showStats = true,
		class: className = ''
	}: SteamProfileCardProps = $props();

	const copySteamId = async () => {
		try {
			await navigator.clipboard.writeText(profile.steamId);
			// TODO: Add toast notification
		} catch (err) {
			console.error('Failed to copy Steam ID:', err);
		}
	};

	const formatCurrency = (amount: number) => {
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: 'USD'
		}).format(amount);
	};

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric'
		});
	};
</script>

<Card class={className}>
	<CardHeader class="pb-4">
		<div class="flex items-center gap-4">
			<div class="relative">
				{#if profile.avatarUrl}
					<img
						src={profile.avatarUrl}
						alt={profile.username}
						class="border-primary/30 h-16 w-16 rounded-2xl border-2 object-cover"
					/>
				{:else}
					<div
						class="bg-primary/20 text-primary border-primary/30 flex h-16 w-16 items-center justify-center rounded-2xl border-2 text-2xl font-bold"
					>
						{profile.username.slice(0, 1).toUpperCase()}
					</div>
				{/if}
				<div class="absolute -right-1 -bottom-1">
					<Badge class="bg-primary text-primary-foreground px-2 text-xs font-bold">
						LVL {Math.floor((profile.totalWagered || 0) / 1000) + 1}
					</Badge>
				</div>
			</div>

			<div class="flex-1">
				<CardTitle class="mb-1 text-xl text-white">{profile.username}</CardTitle>
				<div class="text-muted-foreground flex items-center gap-2 text-sm">
					<span class="font-mono text-xs">{profile.steamId}</span>
					<Button
						variant="ghost"
						size="sm"
						class="text-muted-foreground h-auto p-1"
						onclick={copySteamId}
					>
						<Copy class="h-3 w-3" />
					</Button>
				</div>
				{#if profile.created_at}
					<p class="text-muted-foreground text-xs">
						Joined {formatDate(profile.created_at)}
					</p>
				{/if}
			</div>

			{#if profile.profileUrl}
				<Button variant="outline" size="sm" class="gap-2" asChild>
					<a href={profile.profileUrl} target="_blank" rel="noopener noreferrer">
						<ExternalLink class="h-4 w-4" />
						Steam
					</a>
				</Button>
			{/if}
		</div>
	</CardHeader>

	{#if showStats && !compact}
		<CardContent class="space-y-6">
			<!-- Quick Stats -->
			<div class="grid grid-cols-2 gap-4">
				<div class="bg-surface/50 border-border/40 rounded-2xl border p-4">
					<div class="text-muted-foreground mb-1 flex items-center gap-2 text-sm">
						<Wallet class="h-4 w-4" />
						Total Wagered
					</div>
					<p class="text-2xl font-bold text-white">
						{formatCurrency(profile.totalWagered || 0)}
					</p>
				</div>

				<div class="bg-surface/50 border-border/40 rounded-2xl border p-4">
					<div class="text-muted-foreground mb-1 flex items-center gap-2 text-sm">
						<TrendingUp class="h-4 w-4" />
						Total Profit
					</div>
					<p class="text-2xl font-bold text-green-400">
						{formatCurrency(profile.totalProfit || 0)}
					</p>
				</div>
			</div>

			<!-- Performance Metrics -->
			<div class="grid grid-cols-3 gap-3">
				<div class="text-center">
					<div class="text-xl font-bold text-white">{profile.winRate || 0}%</div>
					<div class="text-muted-foreground text-xs">Win Rate</div>
				</div>
				<div class="text-center">
					<div class="text-xl font-bold text-yellow-400">
						{formatCurrency(profile.biggestWin || 0)}
					</div>
					<div class="text-muted-foreground text-xs">Biggest Win</div>
				</div>
				<div class="text-center">
					<div class="text-xl font-bold text-purple-400">
						{profile.caseBattleWins || 0}
					</div>
					<div class="text-muted-foreground text-xs">Battle Wins</div>
				</div>
			</div>

			<!-- Action Buttons -->
			<div class="flex gap-3">
				<Button class="flex-1 gap-2">
					<Trophy class="h-4 w-4" />
					View Inventory
				</Button>
				<Button variant="outline" class="flex-1">Edit Profile</Button>
			</div>
		</CardContent>
	{/if}
</Card>
