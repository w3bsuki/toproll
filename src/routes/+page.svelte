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
		Trophy,
		Users,
		Star,
		ArrowRight,
		Play,
		AlertCircle,
		RefreshCw
	} from 'lucide-svelte';

	interface Props {
		data: any;
	}

	let { data }: Props = $props();

	const error = $page.url.searchParams.get('error');

	// Error messages mapping
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
</script>

<svelte:head>
	<title>TopRoll - CS2 Gambling Platform</title>
</svelte:head>

<div class="space-y-16">
	<!-- Error Alert -->
	{#if currentError}
		<div class="alert alert-error">
			<AlertCircle class="h-4 w-4" />
			<div class="space-y-3">
				<div class="font-semibold">{currentError.title}</div>
				<div>{currentError.description}</div>
				{#if currentError.action === 'Sign In'}
					<form method="POST" action="/api/auth/steam/login">
						<button type="submit" class="btn mt-2 btn-sm btn-neutral"> Sign in with Steam </button>
					</form>
				{:else if currentError.action === 'Try Again'}
					<form method="POST" action="/api/auth/steam/login">
						<button type="submit" class="btn mt-2 btn-outline btn-sm">
							<RefreshCw class="mr-2 h-4 w-4" />
							Try Again
						</button>
					</form>
				{/if}
			</div>
		</div>
	{/if}

	<!-- Hero Section -->
	<section class="text-center">
		<div class="space-y-8">
			<div class="space-y-4">
				<h1 class="text-foreground text-5xl font-bold tracking-tight">Welcome to TopRoll</h1>
				<p class="text-muted-foreground mx-auto max-w-3xl text-xl">
					The ultimate CS2 gambling platform. Open cases, battle players, win big with the best odds
					in the industry.
				</p>
			</div>

			<div class="flex flex-col gap-4 sm:flex-row sm:justify-center">
				<button class="btn px-8 py-4 text-lg btn-lg btn-primary">
					<Package class="mr-3 h-5 w-5" />
					Start Gambling
					<ArrowRight class="ml-2 h-4 w-4" />
				</button>
				<button class="btn px-8 py-4 text-lg btn-outline btn-lg" onclick={openChat}>
					<MessageCircle class="mr-3 h-5 w-5" />
					Join Community
				</button>
			</div>

			<!-- Stats Row -->
			<div class="flex justify-center gap-8 pt-8">
				<div class="text-center">
					<div class="text-2xl font-bold text-primary">1,247</div>
					<div class="text-muted-foreground text-sm">Cases Opened Today</div>
				</div>
				<div class="text-center">
					<div class="text-2xl font-bold text-success">$2,450</div>
					<div class="text-muted-foreground text-sm">Biggest Win Today</div>
				</div>
				<div class="text-center">
					<div class="text-2xl font-bold text-warning">23</div>
					<div class="text-muted-foreground text-sm">Active Battles</div>
				</div>
			</div>
		</div>
	</section>

	<!-- Featured Games/Cases -->
	<section class="space-y-8">
		<div class="flex items-center justify-between">
			<div>
				<h2 class="text-foreground text-3xl font-bold">Featured Cases</h2>
				<p class="text-muted-foreground">Open the hottest cases with the best rewards</p>
			</div>
			<button class="btn btn-outline">View All Cases</button>
		</div>

		<div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
			<!-- Enhanced Gaming Case Card 1 -->
			<div
				class="card-compact group card-hover-glow card border border-base-300 bg-base-100 shadow-xl transition-all duration-300 hover:border-primary/50 hover:shadow-2xl"
			>
				<!-- Card Image/Header with Gradient -->
				<figure
					class="relative h-32 overflow-hidden bg-gradient-to-br from-primary/20 to-primary/5"
				>
					<div class="absolute inset-0 flex items-center justify-center">
						<div class="relative">
							<Package
								class="h-16 w-16 text-primary drop-shadow-lg transition-transform group-hover:scale-110"
							/>
							<div class="absolute -inset-4 animate-pulse rounded-full bg-primary/20 blur-xl"></div>
						</div>
					</div>
					<!-- Hot Badge with Animation -->
					<div
						class="absolute top-3 right-3 badge animate-bounce gap-2 text-xs font-bold badge-success"
					>
						🔥 Hot
					</div>
				</figure>

				<div class="card-body p-4">
					<div
						class="card-title text-lg font-bold text-base-content transition-colors group-hover:text-primary"
					>
						Chroma 3 Case
					</div>
					<p class="text-sm leading-relaxed text-base-content/70">
						Contains 17 community-designed weapon finishes with rare skins and valuable items.
					</p>

					<!-- Stats Row -->
					<div class="stats my-3 stats-horizontal rounded-lg bg-base-200/50 shadow-sm">
						<div class="stat px-3 py-2">
							<div class="stat-value text-lg text-primary">$2.49</div>
							<div class="stat-title text-xs">Price</div>
						</div>
						<div class="stat px-3 py-2">
							<div class="stat-value text-lg text-warning">17</div>
							<div class="stat-title text-xs">Items</div>
						</div>
					</div>

					<div class="mt-4 card-actions justify-end">
						<button class="group/btn btn btn-block gap-2 btn-primary">
							<Play class="h-4 w-4 transition-transform group-hover/btn:scale-110" />
							Open Case
						</button>
					</div>
				</div>
			</div>

			<!-- Enhanced Gaming Case Card 2 -->
			<div
				class="card-compact group card-hover-glow card border border-base-300 bg-base-100 shadow-xl transition-all duration-300 hover:border-warning/50 hover:shadow-2xl"
			>
				<!-- Card Image/Header with Gradient -->
				<figure
					class="relative h-32 overflow-hidden bg-gradient-to-br from-warning/20 to-accent/10"
				>
					<div class="absolute inset-0 flex items-center justify-center">
						<div class="relative">
							<Trophy
								class="h-16 w-16 text-accent drop-shadow-lg transition-all group-hover:scale-110 group-hover:rotate-12"
							/>
							<div class="absolute -inset-4 animate-pulse rounded-full bg-accent/20 blur-xl"></div>
						</div>
					</div>
					<!-- New Badge -->
					<div class="absolute top-3 right-3 badge gap-2 text-xs font-bold badge-warning">
						✨ New
					</div>
				</figure>

				<div class="card-body p-4">
					<div
						class="card-title text-lg font-bold text-base-content transition-colors group-hover:text-accent"
					>
						Operation Bravo
					</div>
					<p class="text-sm leading-relaxed text-base-content/70">
						Features weapons from Operation Bravo collection with exclusive skins.
					</p>

					<!-- Stats Row -->
					<div class="stats my-3 stats-horizontal rounded-lg bg-base-200/50 shadow-sm">
						<div class="stat px-3 py-2">
							<div class="stat-value text-lg text-success">$1.99</div>
							<div class="stat-title text-xs">Price</div>
						</div>
						<div class="stat px-3 py-2">
							<div class="stat-value text-lg text-info">12</div>
							<div class="stat-title text-xs">Items</div>
						</div>
					</div>

					<div class="mt-4 card-actions justify-end">
						<button class="group/btn btn btn-block gap-2 btn-outline btn-accent hover:btn-accent">
							<Play class="h-4 w-4 transition-transform group-hover/btn:scale-110" />
							Open Case
						</button>
					</div>
				</div>
			</div>

			<!-- Enhanced Premium Gaming Case Card 3 -->
			<div
				class="card-compact group card-hover-glow card relative overflow-hidden border-2 border-error/30 bg-base-100 shadow-xl transition-all duration-300 hover:border-error/70 hover:shadow-2xl"
			>
				<!-- Premium Glow Effect -->
				<div
					class="pointer-events-none absolute inset-0 bg-gradient-to-br from-error/5 to-warning/5"
				></div>

				<!-- Card Image/Header with Premium Gradient -->
				<figure
					class="relative h-32 overflow-hidden bg-gradient-to-br from-error/20 via-warning/15 to-success/10"
				>
					<div class="absolute inset-0 flex items-center justify-center">
						<div class="relative">
							<Crown
								class="h-16 w-16 animate-pulse text-warning drop-shadow-lg group-hover:scale-110"
							/>
							<div
								class="animate-glow absolute -inset-6 rounded-full bg-gradient-to-r from-error/30 via-warning/30 to-success/30 blur-2xl"
							></div>
						</div>
					</div>
					<!-- Premium Badge with Special Styling -->
					<div
						class="absolute top-3 right-3 badge gap-2 border-0 bg-gradient-to-r from-error to-warning text-xs font-bold text-error-content shadow-lg"
					>
						👑 Premium
					</div>
				</figure>

				<div class="card-body p-4">
					<div
						class="card-title bg-gradient-to-r from-error via-warning to-success bg-clip-text text-lg font-bold text-transparent transition-transform group-hover:scale-105"
					>
						Dragon Lore
					</div>
					<p class="text-sm leading-relaxed text-base-content/70">
						Ultra-rare case with legendary skins and massive jackpot potential.
					</p>

					<!-- Premium Stats Row -->
					<div
						class="stats my-3 stats-horizontal rounded-lg border border-warning/20 bg-gradient-to-r from-base-200/80 to-base-300/50 shadow-lg"
					>
						<div class="stat px-3 py-2">
							<div class="stat-value text-lg font-bold text-success">$9.99</div>
							<div class="stat-title text-xs">Price</div>
						</div>
						<div class="stat px-3 py-2">
							<div class="stat-value text-lg text-error">5</div>
							<div class="stat-title text-xs">Elite Items</div>
						</div>
					</div>

					<div class="mt-4 card-actions justify-end">
						<button
							class="group/btn btn btn-block gap-2 border-0 bg-gradient-to-r from-error via-warning to-success text-base-100 hover:shadow-lg hover:shadow-warning/25"
						>
							<Play
								class="h-4 w-4 transition-all group-hover/btn:scale-110 group-hover/btn:rotate-12"
							/>
							Open Premium Case
						</button>
					</div>
				</div>
			</div>
		</div>
	</section>

	<!-- Features Grid -->
	<section class="space-y-8">
		<div class="text-center">
			<h2 class="text-foreground mb-4 text-3xl font-bold">Why Choose TopRoll?</h2>
			<p class="text-muted-foreground mx-auto max-w-2xl">
				Experience the best CS2 gambling platform with provably fair systems, instant withdrawals,
				and the largest community.
			</p>
		</div>

		<div class="grid gap-8 sm:grid-cols-1 lg:grid-cols-3">
			<!-- Enhanced Feature Card 1 -->
			<div
				class="group card border border-base-300 bg-base-100 shadow-xl transition-all duration-500 hover:border-primary/50 hover:shadow-2xl"
			>
				<div class="card-body p-6 text-center">
					<div class="mx-auto mb-6">
						<div class="relative inline-block">
							<div
								class="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary/70 shadow-lg transition-transform duration-300 group-hover:scale-110"
							>
								<Package class="h-10 w-10 text-primary-content drop-shadow-sm" />
							</div>
							<div
								class="absolute -inset-2 rounded-full bg-primary/20 opacity-0 blur-xl transition-opacity duration-300 group-hover:opacity-100"
							></div>
						</div>
					</div>
					<h3
						class="mb-4 text-2xl font-bold text-base-content transition-colors group-hover:text-primary"
					>
						CS2 Cases
					</h3>
					<p class="leading-relaxed text-base-content/70">
						Open exclusive CS2 cases with rare skins and valuable items. Better odds than Steam with
						instant delivery.
					</p>
					<div class="mt-6 card-actions justify-center">
						<div class="badge gap-2 badge-outline badge-primary">
							<Zap class="h-3 w-3" />
							Better Odds
						</div>
					</div>
				</div>
			</div>

			<!-- Enhanced Feature Card 2 -->
			<div
				class="group card border border-base-300 bg-base-100 shadow-xl transition-all duration-500 hover:border-success/50 hover:shadow-2xl"
			>
				<div class="card-body p-6 text-center">
					<div class="mx-auto mb-6">
						<div class="relative inline-block">
							<div
								class="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-success to-success/70 shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:rotate-6"
							>
								<TrendingUp class="h-10 w-10 text-success-content drop-shadow-sm" />
							</div>
							<div
								class="absolute -inset-2 rounded-full bg-success/20 opacity-0 blur-xl transition-opacity duration-300 group-hover:opacity-100"
							></div>
						</div>
					</div>
					<h3
						class="mb-4 text-2xl font-bold text-base-content transition-colors group-hover:text-success"
					>
						Case Battles
					</h3>
					<p class="leading-relaxed text-base-content/70">
						Battle other players in real-time case openings. Winner takes all the items with live
						streaming.
					</p>
					<div class="mt-6 card-actions justify-center">
						<div class="badge gap-2 badge-outline badge-success">
							<Users class="h-3 w-3" />
							Multiplayer
						</div>
					</div>
				</div>
			</div>

			<!-- Enhanced Feature Card 3 -->
			<div
				class="group card border border-base-300 bg-base-100 shadow-xl transition-all duration-500 hover:border-info/50 hover:shadow-2xl"
			>
				<div class="card-body p-6 text-center">
					<div class="mx-auto mb-6">
						<div class="relative inline-block">
							<div
								class="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-info to-info/70 shadow-lg transition-transform duration-300 group-hover:scale-110"
							>
								<Shield class="h-10 w-10 text-info-content drop-shadow-sm" />
							</div>
							<div
								class="absolute -inset-2 animate-pulse rounded-full bg-info/20 opacity-0 blur-xl transition-opacity duration-300 group-hover:opacity-100"
							></div>
						</div>
					</div>
					<h3
						class="mb-4 text-2xl font-bold text-base-content transition-colors group-hover:text-info"
					>
						Secure & Fair
					</h3>
					<p class="leading-relaxed text-base-content/70">
						Provably fair system with transparent algorithms. Your items and data are protected with
						enterprise-grade security.
					</p>
					<div class="mt-6 card-actions justify-center">
						<div class="badge gap-2 badge-outline badge-info">
							<Star class="h-3 w-3" />
							Provably Fair
						</div>
					</div>
				</div>
			</div>
		</div>
	</section>

	<!-- Recent Winners -->
	<section class="space-y-8">
		<div class="text-center">
			<h2 class="text-foreground mb-4 text-3xl font-bold">Recent Big Wins</h2>
			<p class="text-muted-foreground">See what our players are winning today</p>
		</div>

		<div class="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
			{#each [{ user: 'ProGamer123', item: 'AWP | Dragon Lore', value: 2450.0, rarity: 'Covert', time: '2m ago', color: 'from-warning to-error' }, { user: 'CS2Legend', item: 'AK-47 | Fire Serpent', value: 1200.0, rarity: 'Covert', time: '5m ago', color: 'from-error to-warning' }, { user: 'SkinHunter', item: 'M4A4 | Howl', value: 850.0, rarity: 'Contraband', time: '8m ago', color: 'from-success to-info' }] as win, index}
				<!-- Enhanced Winner Card with Animation -->
				<div
					class="group card relative overflow-hidden border border-base-300 bg-base-100 shadow-xl transition-all duration-300 hover:border-success/50 hover:shadow-2xl"
				>
					<!-- Winner Glow Effect -->
					<div class="absolute top-0 left-0 h-1 w-full bg-gradient-to-r {win.color}"></div>

					<div class="card-body p-4">
						<div class="flex items-center gap-4">
							<!-- Trophy with Gradient Background -->
							<div class="relative">
								<div
									class="flex h-14 w-14 items-center justify-center rounded-full border-2 border-success/30 bg-gradient-to-br from-warning/20 to-success/20"
								>
									<Trophy
										class="h-7 w-7 text-warning drop-shadow-sm transition-transform group-hover:scale-110"
									/>
								</div>
								<div
									class="absolute -inset-1 animate-pulse rounded-full bg-gradient-to-r from-warning/50 to-success/50 opacity-0 blur transition-opacity group-hover:opacity-100"
								></div>
							</div>

							<!-- User and Item Info -->
							<div class="min-w-0 flex-1">
								<p
									class="truncate font-bold text-base-content transition-colors group-hover:text-success"
								>
									{win.user}
								</p>
								<p class="truncate text-sm text-base-content/70">{win.item}</p>
								<div class="mt-1 flex items-center gap-2">
									<div class="badge bg-gradient-to-r badge-sm {win.color} border-0 text-base-100">
										{win.rarity}
									</div>
									<span class="text-xs text-base-content/50">{win.time}</span>
								</div>
							</div>

							<!-- Win Value with Enhanced Styling -->
							<div class="text-right">
								<div class="stat">
									<div
										class="stat-value bg-gradient-to-r from-success to-warning bg-clip-text text-lg font-bold text-transparent"
									>
										${win.value.toFixed(2)}
									</div>
								</div>
							</div>
						</div>

						<!-- Win Animation Effect -->
						{#if index === 0}
							<div class="absolute top-2 right-2 opacity-60">
								<div class="animate-bounce text-warning">🏆</div>
							</div>
						{/if}
					</div>
				</div>
			{/each}
		</div>
	</section>

	<!-- Enhanced CTA Section -->
	<section>
		<div
			class="card relative overflow-hidden border-2 border-primary/20 bg-gradient-to-br from-base-100 via-primary/5 to-accent/5 shadow-2xl"
		>
			<!-- Animated Background Elements -->
			<div
				class="absolute inset-0 animate-pulse bg-gradient-to-r from-primary/10 via-transparent to-accent/10"
			></div>
			<div class="absolute top-4 left-4 h-8 w-8 animate-ping rounded-full bg-primary/20"></div>
			<div
				class="absolute right-4 bottom-4 h-6 w-6 animate-ping rounded-full bg-accent/20"
				style="animation-delay: 1s;"
			></div>

			<div class="relative card-body p-8 text-center lg:p-12">
				<div class="space-y-8">
					<!-- Main Heading with Gaming Gradient -->
					<h2
						class="bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-4xl font-bold text-transparent lg:text-5xl"
					>
						Ready to Start Winning?
					</h2>

					<!-- Subtitle with Better Typography -->
					<p class="mx-auto max-w-3xl text-xl leading-relaxed text-base-content/80">
						Join thousands of players and start your CS2 gambling journey today. Sign in with Steam
						to access your inventory.
					</p>

					<!-- Stats Row -->
					<div
						class="stats mx-auto stats-vertical rounded-2xl bg-base-200/50 shadow-lg lg:stats-horizontal"
					>
						<div class="stat place-items-center">
							<div class="stat-value text-2xl text-primary">10,000+</div>
							<div class="stat-title">Active Players</div>
						</div>
						<div class="stat place-items-center">
							<div class="stat-value text-2xl text-success">$2M+</div>
							<div class="stat-title">Won Today</div>
						</div>
						<div class="stat place-items-center">
							<div class="stat-value text-2xl text-warning">99.9%</div>
							<div class="stat-title">Uptime</div>
						</div>
					</div>

					<!-- Enhanced CTA Button -->
					<div class="flex flex-col items-center justify-center gap-4 sm:flex-row">
						<button
							class="group btn border-0 bg-gradient-to-r from-primary via-accent to-secondary px-12 py-4 text-xl text-base-100 transition-all duration-300 btn-lg hover:shadow-xl hover:shadow-primary/25"
						>
							<Package class="mr-3 h-6 w-6 transition-transform group-hover:rotate-12" />
							Sign in with Steam
							<ArrowRight class="ml-3 h-5 w-5 transition-transform group-hover:translate-x-1" />
						</button>

						<button class="group btn px-8 py-4 btn-outline btn-lg">
							<MessageCircle class="mr-2 h-5 w-5 transition-transform group-hover:scale-110" />
							Join Community
						</button>
					</div>

					<!-- Trust Indicators -->
					<div class="flex flex-wrap items-center justify-center gap-6 pt-4">
						<div class="badge gap-2 badge-outline">
							<Shield class="h-3 w-3" />
							SSL Secured
						</div>
						<div class="badge gap-2 badge-outline">
							<Star class="h-3 w-3" />
							Provably Fair
						</div>
						<div class="badge gap-2 badge-outline">
							<Zap class="h-3 w-3" />
							Instant Withdrawals
						</div>
					</div>
				</div>
			</div>
		</div>
	</section>
</div>
