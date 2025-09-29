<script lang="ts">
	import { page } from '$app/stores';
	import { openChat } from '$lib/stores/ui';
	import {
		Package,
		MessageCircle,
		TrendingUp,
		Shield,
		Zap,
		Crown,
		Users,
		ArrowRight,
		Play,
		AlertCircle,
		RefreshCw
	} from 'lucide-svelte';
	import {
		Button,
		Card,
		CardHeader,
		CardContent,
		CardFooter,
		CardTitle,
		CardDescription,
		Badge,
		Alert,
		Tabs,
		TabsList,
		TabsTrigger,
		TabsContent
	} from '$lib/components/ui';

	interface Props {
		data: any;
	}

	let { data }: Props = $props();

	const error = $page.url.searchParams.get('error');

	const errorMessages: Record<string, { title: string; description: string; action?: string }> = {
		auth_required: {
			title: 'Authentication Required',
			description: 'Please sign in with Steam to access your profile and inventory.',
			action: 'Sign In'
		},
		steam_auth_failed: {
			title: 'Steam Authentication Failed',
			description: 'There was a problem authenticating with Steam. Please try again.',
			action: 'Try Again'
		},
		steam_profile_not_found: {
			title: 'Steam Profile Not Found',
			description: "We couldn't find your Steam profile. Please make sure your profile is public.",
			action: 'Try Again'
		},
		config_error: {
			title: 'Configuration Error',
			description: "There's a temporary issue with our Steam integration. Please try again later.",
			action: 'Try Later'
		},
		auth_failed: {
			title: 'Authentication Failed',
			description: 'Something went wrong during authentication. Please try signing in again.',
			action: 'Try Again'
		}
	};

	const currentError = error ? errorMessages[error] : null;

	const featuredCases = [
		{
			name: 'Chroma 3 Case',
			description: '17 finishes including rare covert knives and premium assault rifles.',
			price: '$2.49',
			items: 17,
			winRate: '18% premium odds',
			status: 'Hot streak',
			accent: 'primary'
		},
		{
			name: 'Spectrum 2 Case',
			description: 'High volatility case with covert M4 skins and neon classics.',
			price: '$3.10',
			items: 18,
			winRate: '22% high tier',
			status: 'High demand',
			accent: 'secondary'
		},
		{
			name: 'Revolution Case',
			description: 'Marketplace exclusive drop featuring rare Doppler finishes.',
			price: '$4.05',
			items: 19,
			winRate: '12% legendary',
			status: 'Limited',
			accent: 'accent'
		}
	];

	const marketplaceMetrics = [
		{ label: 'Cases opened today', value: '1,247', trend: '+6.2%', icon: Package },
		{ label: 'Active players', value: '3,482', trend: '+18%', icon: Users },
		{ label: 'Total payouts 24h', value: '$128,440', trend: '+12%', icon: TrendingUp }
	];
</script>

<svelte:head>
	<title>TopRoll - CS2 Marketplace</title>
</svelte:head>

<div class="space-y-12">
	{#if currentError}
		<Alert variant="destructive" class="items-start">
			<AlertCircle class="h-5 w-5" />
			<div class="space-y-2">
				<p class="text-sm font-semibold">{currentError.title}</p>
				<p class="text-muted-foreground text-sm">{currentError.description}</p>
				{#if currentError.action === 'Sign In'}
					<form method="POST" action="/api/auth/steam/login">
						<Button type="submit" size="sm" class="mt-1">
							<Shield class="h-4 w-4" />
							Sign in with Steam
						</Button>
					</form>
				{:else if currentError.action === 'Try Again'}
					<form method="POST" action="/api/auth/steam/login">
						<Button type="submit" variant="outline" size="sm" class="mt-1">
							<RefreshCw class="h-4 w-4" />
							Retry authentication
						</Button>
					</form>
				{/if}
			</div>
		</Alert>
	{/if}

	<section class="grid gap-8 lg:grid-cols-[2fr,1fr]">
		<Card class="border-border/70 bg-surface/70 flex flex-col border">
			<CardHeader class="border-0 pb-6">
				<Badge variant="outline" class="w-fit">Phase 1 access</Badge>
				<CardTitle class="text-3xl leading-tight font-semibold md:text-4xl">
					Trust-first CS2 marketplace
				</CardTitle>
				<CardDescription class="max-w-2xl text-base leading-relaxed">
					Trade, open cases, and compete in battles on a desk built for transparency. Deep audit
					trails, instant settlement, and live risk analytics keep high rollers in control.
				</CardDescription>
			</CardHeader>
			<CardContent class="grid gap-6 lg:grid-cols-2">
				<div class="space-y-4">
					<div
						class="border-border/60 bg-surface-muted/40 rounded-lg border p-4 text-sm leading-relaxed"
					>
						<p class="text-muted-foreground">Marketplace status</p>
						<p class="text-foreground mt-2 text-lg font-semibold">Online · Liquidity stable</p>
						<p class="text-muted-foreground text-xs">Realtime treasury coverage 104%</p>
					</div>
					<div class="grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
						<div class="border-border/60 bg-surface-muted/40 rounded-md border p-3 text-center">
							<p class="text-muted-foreground text-xs tracking-wide uppercase">Top win</p>
							<p class="text-success mt-1 text-lg font-semibold">$24,860</p>
						</div>
						<div class="border-border/60 bg-surface-muted/40 rounded-md border p-3 text-center">
							<p class="text-muted-foreground text-xs tracking-wide uppercase">Avg ROI</p>
							<p class="text-primary mt-1 text-lg font-semibold">+14.2%</p>
						</div>
						<div class="border-border/60 bg-surface-muted/40 rounded-md border p-3 text-center">
							<p class="text-muted-foreground text-xs tracking-wide uppercase">Battles</p>
							<p class="text-warning-foreground mt-1 text-lg font-semibold">23 live</p>
						</div>
					</div>
				</div>
				<div class="space-y-4">
					<div class="border-border/60 bg-surface-muted/30 rounded-lg border p-4 text-sm">
						<div class="flex items-center justify-between">
							<div>
								<p class="text-muted-foreground text-xs tracking-wide uppercase">Case explorer</p>
								<p class="text-foreground mt-1 text-base font-medium">
									Filtered by volatility index
								</p>
							</div>
							<Button size="sm" variant="outline" onclick={openChat}>
								<MessageCircle class="h-4 w-4" />
								Talk to traders
							</Button>
						</div>
						<ul class="text-muted-foreground mt-4 space-y-2 text-sm">
							<li>
								<button
									type="button"
									class="duration-subtle ease-market-ease hover:border-border/60 hover:text-foreground focus-visible:ring-ring/70 focus-visible:ring-offset-background flex w-full items-center justify-between rounded-md border border-transparent px-2 py-2 text-left transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
								>
									<span class="flex items-center gap-2"
										><Zap class="text-primary h-4 w-4" />Instant drops</span
									>
									<ArrowRight class="h-4 w-4" />
								</button>
							</li>
							<li>
								<button
									type="button"
									class="duration-subtle ease-market-ease hover:border-border/60 hover:text-foreground focus-visible:ring-ring/70 focus-visible:ring-offset-background flex w-full items-center justify-between rounded-md border border-transparent px-2 py-2 text-left transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
								>
									<span class="flex items-center gap-2"
										><Shield class="text-secondary h-4 w-4" />Escrow protected</span
									>
									<ArrowRight class="h-4 w-4" />
								</button>
							</li>
							<li>
								<button
									type="button"
									class="duration-subtle ease-market-ease hover:border-border/60 hover:text-foreground focus-visible:ring-ring/70 focus-visible:ring-offset-background flex w-full items-center justify-between rounded-md border border-transparent px-2 py-2 text-left transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
								>
									<span class="flex items-center gap-2"
										><Crown class="text-warning-foreground h-4 w-4" />VIP whitelist</span
									>
									<ArrowRight class="h-4 w-4" />
								</button>
							</li>
						</ul>
					</div>
					<div class="flex flex-wrap gap-3">
						<Button as="a" href="/cases" class="gap-2">
							<Package class="h-4 w-4" />
							Open cases
						</Button>
						<Button as="a" href="/battles" variant="secondary" class="gap-2">
							<TrendingUp class="h-4 w-4" />
							Start battle
						</Button>
						<Button variant="outline" class="gap-2" onclick={openChat}>
							<MessageCircle class="h-4 w-4" />
							Live support
						</Button>
					</div>
				</div>
			</CardContent>
		</Card>

		<Card class="border-border/70 bg-surface/70 flex h-full flex-col border">
			<CardHeader class="border-0 pb-4">
				<CardTitle class="text-xl font-semibold">Market depth</CardTitle>
				<CardDescription>How the desk is performing in the last 24 hours</CardDescription>
			</CardHeader>
			<CardContent class="space-y-4">
				{#each marketplaceMetrics as metric}
					<div class="border-border/60 bg-surface-muted/40 rounded-lg border p-3">
						<div class="flex items-center justify-between">
							<div class="flex items-center gap-3">
								<span
									class="border-border/60 bg-surface-muted/60 flex h-10 w-10 items-center justify-center rounded-md border"
								>
									<metric.icon class="h-4 w-4" />
								</span>
								<div>
									<p class="text-muted-foreground text-xs tracking-wide uppercase">
										{metric.label}
									</p>
									<p class="text-foreground text-lg font-semibold">{metric.value}</p>
								</div>
							</div>
							<Badge variant="outline" class="text-success">{metric.trend}</Badge>
						</div>
					</div>
				{/each}
			</CardContent>
			<CardFooter class="border-border/60 bg-surface-muted/30 mt-auto border-t">
				<div>
					<p class="text-muted-foreground text-xs tracking-wide uppercase">Counterparty coverage</p>
					<p class="text-foreground text-sm font-medium">Tier 1 banks · Instant settlement rails</p>
				</div>
			</CardFooter>
		</Card>
	</section>

	<section class="space-y-6">
		<div class="flex flex-wrap items-center justify-between gap-4">
			<div>
				<h2 class="text-foreground text-2xl font-semibold">Featured cases</h2>
				<p class="text-muted-foreground text-sm">Curated drops monitored by our risk desk</p>
			</div>
			<Button as="a" href="/cases" variant="outline" class="gap-2">
				View case catalog
				<ArrowRight class="h-4 w-4" />
			</Button>
		</div>
		<div class="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
			{#each featuredCases as featuredCase}
				<Card class="border-border/60 bg-surface/80 flex h-full flex-col border">
					<CardHeader class="border-0 pb-4">
						<div class="flex items-center justify-between">
							<div>
								<CardTitle>{featuredCase.name}</CardTitle>
								<CardDescription>{featuredCase.description}</CardDescription>
							</div>
							<Badge
								variant={featuredCase.accent === 'primary'
									? 'default'
									: featuredCase.accent === 'secondary'
										? 'success'
										: 'info'}
							>
								{featuredCase.status}
							</Badge>
						</div>
					</CardHeader>
					<CardContent class="space-y-4">
						<div class="border-border/60 bg-surface-muted/40 rounded-lg border p-4 text-sm">
							<div class="flex items-center justify-between">
								<span class="text-muted-foreground">Entry price</span>
								<span class="text-foreground font-semibold">{featuredCase.price}</span>
							</div>
							<div class="text-muted-foreground mt-2 flex items-center justify-between text-xs">
								<span>{featuredCase.items} items in pool</span>
								<span>{featuredCase.winRate}</span>
							</div>
						</div>
						<div class="text-muted-foreground flex items-center justify-between text-sm">
							<span>Desk hedged</span>
							<span class="text-success font-medium">Yes</span>
						</div>
					</CardContent>
					<CardFooter class="bg-surface-muted/30 mt-auto">
						<Button as="a" href="/cases" class="w-full gap-2">
							<Play class="h-4 w-4" />
							Open case
						</Button>
					</CardFooter>
				</Card>
			{/each}
		</div>
	</section>

	<section class="space-y-6">
		<div class="flex flex-wrap items-center justify-between gap-4">
			<div>
				<h2 class="text-foreground text-2xl font-semibold">Live trading desk</h2>
				<p class="text-muted-foreground text-sm">Track battles and instant matches in real time</p>
			</div>
			<Button as="a" href="/battles" variant="outline" class="gap-2">
				View battle lobby
				<ArrowRight class="h-4 w-4" />
			</Button>
		</div>
		<Tabs value="battles">
			<TabsList class="flex flex-wrap gap-2">
				<TabsTrigger value="battles">Case battles</TabsTrigger>
				<TabsTrigger value="upgrades">Upgrades</TabsTrigger>
				<TabsTrigger value="drops">Recent drops</TabsTrigger>
			</TabsList>
			<TabsContent value="battles" class="bg-surface/60 border-border/60 rounded-xl border p-5">
				<div class="grid gap-4 md:grid-cols-2">
					<div class="border-border/60 bg-surface-muted/40 rounded-lg border p-4">
						<div class="text-muted-foreground flex items-center justify-between text-sm">
							<span>High roller battle · 4 players</span>
							<Badge variant="outline" class="text-warning-foreground">Entry $120</Badge>
						</div>
						<div class="mt-3 space-y-2 text-sm">
							<p class="text-foreground font-medium">Spectrum vs. Revolution bundle</p>
							<p class="text-muted-foreground">Avg payout $460 · Hedge coverage 92%</p>
						</div>
						<div class="mt-4 flex items-center justify-between">
							<div class="flex -space-x-2">
								<span class="border-border/60 bg-surface-muted/60 h-8 w-8 rounded-full border"
								></span>
								<span class="border-border/60 bg-surface-muted/60 h-8 w-8 rounded-full border"
								></span>
								<span class="border-border/60 bg-surface-muted/60 h-8 w-8 rounded-full border"
								></span>
								<span class="border-border/60 bg-surface-muted/60 h-8 w-8 rounded-full border"
								></span>
							</div>
							<Button size="sm">Join battle</Button>
						</div>
					</div>
					<div class="border-border/60 bg-surface-muted/40 rounded-lg border p-4">
						<div class="text-muted-foreground flex items-center justify-between text-sm">
							<span>Flash duel · 2 players</span>
							<Badge variant="success">Filling</Badge>
						</div>
						<div class="mt-3 space-y-2 text-sm">
							<p class="text-foreground font-medium">Chroma 3 back-to-back</p>
							<p class="text-muted-foreground">Win bonus 1.4× · Risk-managed pool</p>
						</div>
						<div class="mt-4 flex items-center justify-between">
							<div class="flex -space-x-2">
								<span class="border-border/60 bg-surface-muted/60 h-8 w-8 rounded-full border"
								></span>
								<span class="border-border/60 bg-surface-muted/60 h-8 w-8 rounded-full border"
								></span>
							</div>
							<Button size="sm" variant="secondary">Watch</Button>
						</div>
					</div>
				</div>
			</TabsContent>
			<TabsContent value="upgrades" class="bg-surface/60 border-border/60 rounded-xl border p-5">
				<div class="grid gap-4 md:grid-cols-2">
					<div class="border-border/60 bg-surface-muted/40 rounded-lg border p-4 text-sm">
						<p class="text-muted-foreground">
							No upgrades have been logged in the past hour. Check back shortly for premium
							conversions.
						</p>
					</div>
					<div class="border-border/60 bg-surface-muted/40 rounded-lg border p-4 text-sm">
						<p class="text-muted-foreground">
							Enable upgrade alerts to receive realtime notifications when liquidity spikes.
						</p>
					</div>
				</div>
			</TabsContent>
			<TabsContent value="drops" class="bg-surface/60 border-border/60 rounded-xl border p-5">
				<div class="grid gap-4 md:grid-cols-2">
					<div class="border-border/60 bg-surface-muted/40 rounded-lg border p-4 text-sm">
						<p class="text-foreground font-medium">★ Karambit | Doppler</p>
						<p class="text-muted-foreground">Won by Trader#248 · Profit $1,920 · 2m ago</p>
					</div>
					<div class="border-border/60 bg-surface-muted/40 rounded-lg border p-4 text-sm">
						<p class="text-foreground font-medium">M4A4 | Temukau (Factory New)</p>
						<p class="text-muted-foreground">Won by Rina · Profit $320 · 5m ago</p>
					</div>
				</div>
			</TabsContent>
		</Tabs>
	</section>
</div>
