<script lang="ts">
	import { CaseOpeningRoulette } from '$lib/features/cases';
	import { ParticleEffects, LoadingSkeleton, ErrorBoundary } from '$lib/components/shared';
	import { Package, Users, TrendingUp, Zap, Sword, Sparkles } from '@lucide/svelte';
	import type { CaseItem } from '$lib/types/index';
	import type { PageData } from './$types';
	import {
		Button,
		Card,
		CardHeader,
		CardContent,
		CardFooter,
		CardTitle,
		CardDescription,
		Badge
	} from '$lib/components/ui';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();
	let isLoading = $state(false);
	let error = $state<Error | null>(null);
	let showParticles = $state(false);
	let lastWin: any = $state(null);

	const cases = $derived(data.cases || []);

	const battles = [
		{
			id: 'battle_001',
			maxPlayers: 2,
			entryFee: 2.49,
			currentPlayers: 1,
			status: 'Filling'
		},
		{
			id: 'battle_002',
			maxPlayers: 4,
			entryFee: 5,
			currentPlayers: 3,
			status: 'Waiting'
		}
	];

	function handleCaseOpen(caseId: string, item: CaseItem) {
		console.log(`Opened case ${caseId}, got item:`, item);
	}

	function handleCaseComplete(item: any) {
		lastWin = item;
		showParticles = true;
		setTimeout(() => (showParticles = false), 2500);
	}

	const rouletteItems = $derived(
		cases[0]?.case_items?.map((item: CaseItem) => {
			const rarityMap: Record<
				string,
				'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'mythical'
			> = {
				Common: 'common',
				Uncommon: 'uncommon',
				Rare: 'rare',
				Epic: 'epic',
				Legendary: 'legendary',
				Contraband: 'mythical'
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

	function handleBattleJoin(battleId: string) {
		console.log(`Joined battle ${battleId}`);
	}

	function handleBattleLeave(battleId: string) {
		console.log(`Left battle ${battleId}`);
	}

	function rarityLabel(rarity: string) {
		return rarity.replace('-', ' ');
	}
</script>

<svelte:head>
	<title>Cases - TopRoll</title>
</svelte:head>

<ErrorBoundary {error}>
	<div class="space-y-12">
		<header class="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
			<div class="space-y-3">
				<Badge variant="outline" class="w-fit">Live liquidity</Badge>
				<h1 class="text-foreground text-3xl font-semibold md:text-4xl">Strategic case openings</h1>
				<p class="text-muted-foreground max-w-2xl text-sm">
					Audit every case before you spin it. Market makers hedge odds in real time so you can open
					with confidence. Monitor volatility, view return history, and queue battles against other
					traders.
				</p>
			</div>
			<div class="flex flex-wrap gap-3">
				<Button as="a" href="/cases" class="gap-2">
					<Package class="h-4 w-4" />
					Open featured case
				</Button>
				<Button as="a" href="/battles" variant="secondary" class="gap-2">
					<Zap class="h-4 w-4" />
					Launch battle
				</Button>
			</div>
		</header>

		<section class="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
			<Card class="border-border/60 bg-surface/70 border">
				<CardContent class="flex items-center gap-3 p-5">
					<span
						class="border-primary/50 bg-primary/15 text-primary flex h-10 w-10 items-center justify-center rounded-md border"
					>
						<Package class="h-5 w-5" />
					</span>
					<div>
						<p class="text-muted-foreground text-xs tracking-wide uppercase">Cases opened today</p>
						<p class="text-foreground text-xl font-semibold">1,247</p>
					</div>
				</CardContent>
			</Card>
			<Card class="border-border/60 bg-surface/70 border">
				<CardContent class="flex items-center gap-3 p-5">
					<span
						class="border-secondary/50 bg-secondary/15 text-secondary flex h-10 w-10 items-center justify-center rounded-md border"
					>
						<Users class="h-5 w-5" />
					</span>
					<div>
						<p class="text-muted-foreground text-xs tracking-wide uppercase">Active battles</p>
						<p class="text-foreground text-xl font-semibold">23</p>
					</div>
				</CardContent>
			</Card>
			<Card class="border-border/60 bg-surface/70 border">
				<CardContent class="flex items-center gap-3 p-5">
					<span
						class="border-success/50 bg-success/15 text-success flex h-10 w-10 items-center justify-center rounded-md border"
					>
						<TrendingUp class="h-5 w-5" />
					</span>
					<div>
						<p class="text-muted-foreground text-xs tracking-wide uppercase">Biggest win 24h</p>
						<p class="text-foreground text-xl font-semibold">$2,450</p>
					</div>
				</CardContent>
			</Card>
		</section>

		<section class="space-y-6">
			<div class="space-y-3 text-center">
				<h2 class="text-foreground text-2xl font-semibold">Live roulette preview</h2>
				<p class="text-muted-foreground text-sm">
					Preview the motion engine before committing to a spin.
				</p>
			</div>
			<div
				class="border-border/60 bg-surface/70 shadow-marketplace-lg relative rounded-2xl border p-6"
			>
				<ParticleEffects trigger={showParticles} color="#ffd700" intensity="high" />
				{#if rouletteItems.length > 0}
					<CaseOpeningRoulette items={rouletteItems} onComplete={handleCaseComplete} />
				{:else if isLoading}
					<LoadingSkeleton />
				{/if}
				{#if lastWin}
					<div class="border-border/60 bg-surface-muted/50 mt-6 rounded-lg border p-4">
						<div class="flex items-center gap-3">
							<img
								src={lastWin.image}
								alt={lastWin.name}
								class="border-border/60 h-12 w-12 rounded-md border object-cover"
							/>
							<div>
								<p class="text-foreground text-sm font-medium">{lastWin.name}</p>
								<p class="text-muted-foreground text-sm">{rarityLabel(lastWin.rarity)}</p>
								<p class="text-success text-base font-semibold">${lastWin.value}</p>
							</div>
						</div>
					</div>
				{/if}
			</div>
		</section>

		<section class="grid gap-10 xl:grid-cols-[2fr,1fr]">
			<div class="space-y-6">
				<div class="flex flex-wrap items-center justify-between gap-3">
					<div>
						<h3 class="text-foreground text-xl font-semibold">Case catalog</h3>
						<p class="text-muted-foreground text-sm">
							Every drop monitored by our desk risk engine.
						</p>
					</div>
					<Button variant="outline" class="gap-2">
						Export list
						<Sparkles class="h-4 w-4" />
					</Button>
				</div>
				<div class="grid gap-5 md:grid-cols-2">
					{#each cases as caseData}
						<Card class="border-border/60 bg-surface/70 flex h-full flex-col border">
							<CardHeader class="border-0 pb-3">
								<CardTitle>{caseData.name}</CardTitle>
								<CardDescription>{caseData.description}</CardDescription>
							</CardHeader>
							<CardContent class="space-y-4">
								<div class="flex items-center justify-between text-sm">
									<span class="text-muted-foreground">Market price</span>
									<span class="text-foreground font-semibold">${caseData.price.toFixed(2)}</span>
								</div>
								<div class="text-muted-foreground space-y-2 text-xs">
									<p>Volatility index: {caseData.volatility ?? 'Moderate'}</p>
									<p>Available items: {caseData.case_items?.length ?? 0}</p>
								</div>
								<div class="space-y-2">
									{#each caseData.case_items?.slice(0, 3) ?? [] as item}
										<div
											class="border-border/50 bg-surface-muted/40 text-muted-foreground flex items-center justify-between rounded-md border px-3 py-2 text-xs"
										>
											<span class="text-foreground font-medium">{item.name}</span>
											<span>${item.market_value}</span>
										</div>
									{/each}
								</div>
							</CardContent>
							<CardFooter class="border-border/60 bg-surface-muted/30 mt-auto border-t">
								<div class="flex w-full flex-wrap items-center justify-between gap-2">
									<Button size="sm" class="gap-2">
										<Package class="h-4 w-4" />
										Open now
									</Button>
									<Button size="sm" variant="secondary" class="gap-2">
										<Sword class="h-4 w-4" />
										Queue battle
									</Button>
								</div>
							</CardFooter>
						</Card>
					{/each}
				</div>
			</div>
			<div class="space-y-5">
				<div class="flex flex-wrap items-center justify-between gap-2">
					<h3 class="text-foreground text-lg font-semibold">Battle lobby</h3>
					<Badge variant="outline">Live</Badge>
				</div>
				<div class="space-y-4">
					{#each battles as battle}
						<Card class="border-border/60 bg-surface/70 border">
							<CardContent class="space-y-3 p-4 text-sm">
								<div
									class="text-muted-foreground flex items-center justify-between text-xs tracking-wide uppercase"
								>
									<span>Entry ${battle.entryFee.toFixed(2)}</span>
									<span>{battle.currentPlayers}/{battle.maxPlayers} players</span>
								</div>
								<p class="text-foreground text-sm font-medium">Multi-case bundle</p>
								<p class="text-muted-foreground text-xs">Instant settlement · Hedge coverage 90%</p>
								<div class="flex items-center justify-between">
									<Badge variant={battle.status === 'Filling' ? 'success' : 'outline'}
										>{battle.status}</Badge
									>
									<div class="flex gap-2">
										<Button
											size="sm"
											variant="secondary"
											onclick={() => handleBattleJoin(battle.id)}
										>
											Join
										</Button>
										<Button
											size="sm"
											variant="outline"
											onclick={() => handleBattleLeave(battle.id)}
										>
											Watch
										</Button>
									</div>
								</div>
							</CardContent>
						</Card>
					{/each}
				</div>
			</div>
		</section>
	</div>
</ErrorBoundary>
