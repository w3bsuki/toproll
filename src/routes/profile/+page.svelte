<script lang="ts">
	import ProfileCard from '$lib/components/ProfileCard.svelte';
	import { Trophy, Target, TrendingUp, DollarSign } from '@lucide/svelte';
	import type { PageData } from './$types';
	import {
		Card,
		CardContent,
		CardHeader,
		CardTitle,
		CardDescription,
		Badge
	} from '$lib/components/ui';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>Profile - TopRoll</title>
</svelte:head>

<div class="space-y-8">
	<div class="flex flex-wrap items-center justify-between gap-4">
		<div>
			<h1 class="text-foreground text-3xl font-semibold">Trader dossier</h1>
			<p class="text-muted-foreground text-sm">
				Performance metrics, risk exposure, and battle history at a glance.
			</p>
		</div>
		<Badge variant="outline">Tier 2 verified</Badge>
	</div>

	<div class="grid gap-6 lg:grid-cols-[320px,1fr]">
		<ProfileCard user={data.profile} status="online" />
		<div class="grid gap-5 md:grid-cols-2">
			<Card class="border-border/60 bg-surface/70 flex h-full flex-col border">
				<CardContent class="space-y-2 p-5">
					<div
						class="text-muted-foreground flex items-center gap-2 text-xs tracking-wide uppercase"
					>
						<DollarSign class="h-4 w-4" /> Total wagered
					</div>
					<p class="text-foreground text-2xl font-semibold">
						${data.profile?.total_wagered?.toLocaleString() || '0'}
					</p>
				</CardContent>
			</Card>
			<Card class="border-border/60 bg-surface/70 flex h-full flex-col border">
				<CardContent class="space-y-2 p-5">
					<div
						class="text-muted-foreground flex items-center gap-2 text-xs tracking-wide uppercase"
					>
						<TrendingUp class="h-4 w-4" /> Total profit
					</div>
					<p
						class={`text-2xl font-semibold ${data.profile?.total_profit && data.profile.total_profit >= 0 ? 'text-success' : 'text-destructive'}`}
					>
						${data.profile?.total_profit?.toLocaleString() || '0'}
					</p>
				</CardContent>
			</Card>
			<Card class="border-border/60 bg-surface/70 flex h-full flex-col border">
				<CardContent class="space-y-2 p-5">
					<div
						class="text-muted-foreground flex items-center gap-2 text-xs tracking-wide uppercase"
					>
						<Target class="h-4 w-4" /> Win rate
					</div>
					<p class="text-foreground text-2xl font-semibold">{data.profile?.win_rate || 0}%</p>
				</CardContent>
			</Card>
			<Card class="border-border/60 bg-surface/70 flex h-full flex-col border">
				<CardContent class="space-y-2 p-5">
					<div
						class="text-muted-foreground flex items-center gap-2 text-xs tracking-wide uppercase"
					>
						<Trophy class="h-4 w-4" /> Biggest win
					</div>
					<p class="text-foreground text-2xl font-semibold">
						${data.profile?.biggest_win?.toLocaleString() || '0'}
					</p>
				</CardContent>
			</Card>
			<Card class="border-border/60 bg-surface/70 flex h-full flex-col border md:col-span-2">
				<CardHeader class="border-0 pb-2">
					<CardTitle class="text-muted-foreground text-sm font-medium">Case battle wins</CardTitle>
					<CardDescription>Lifetime victories secured across all battle types.</CardDescription>
				</CardHeader>
				<CardContent class="flex items-center justify-between p-5">
					<p class="text-foreground text-3xl font-semibold">
						{data.profile?.case_battle_wins || 0}
					</p>
					<Badge variant="outline">Top 12%</Badge>
				</CardContent>
			</Card>
		</div>
	</div>
</div>
