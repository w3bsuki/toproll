<script lang="ts">
	import { Badge, Button, Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui';
	import {
		ArrowLeft,
		ExternalLink,
		Heart,
		Share2,
		Eye,
		TrendingUp,
		TrendingDown,
		Star,
		Shield,
		Truck,
		RefreshCw
	} from '@lucide/svelte';
	import { MarketplaceItemCard } from '$lib/features/marketplace';

	// Mock item data - in a real app this would come from an API
	const item = {
		id: 'ak-47-redline-fn',
		name: 'AK-47 | Redline',
		wear: 'Factory New',
		rarity: 'Classified',
		price: 285.5,
		image: '/static/images/skins/ak47-redline.png',
		category: 'Rifles',
		weapon: 'AK-47',
		statTrak: false,
		souvenir: false,
		float: 0.0023,
		pattern: undefined,
		priceChange: 2.5,
		volume: 147,
		watching: 892,
		likes: 234,
		description:
			'The AK-47 has been painted with a hydrographic in a red and black design over a metallic base coat.',
		collection: 'The Bravo Collection',
		releaseDate: '2013-09-19',
		minWear: 0.06,
		maxWear: 0.8
	};

	const relatedItems = [
		{
			id: 'ak-47-redline-mw',
			name: 'AK-47 | Redline',
			wear: 'Minimal Wear',
			rarity: 'Classified',
			price: 245.0,
			image: '/static/images/skins/ak47-redline.png',
			category: 'Rifles',
			weapon: 'AK-47',
			statTrak: false,
			souvenir: false,
			float: 0.0723,
			pattern: undefined,
			priceChange: 1.8,
			volume: 89,
			watching: 456,
			likes: 123
		},
		{
			id: 'ak-47-redline-ft',
			name: 'AK-47 | Redline',
			wear: 'Field-Tested',
			rarity: 'Classified',
			price: 195.0,
			image: '/static/images/skins/ak47-redline.png',
			category: 'Rifles',
			weapon: 'AK-47',
			statTrak: false,
			souvenir: false,
			float: 0.1523,
			pattern: undefined,
			priceChange: 0.5,
			volume: 234,
			watching: 234,
			likes: 89
		}
	];

	const priceHistory = [
		{ date: '2024-01-01', price: 265.0 },
		{ date: '2024-01-15', price: 272.5 },
		{ date: '2024-02-01', price: 278.0 },
		{ date: '2024-02-15', price: 285.5 }
	];

	const formatCurrency = (amount: number) => {
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: 'USD',
			minimumFractionDigits: 2,
			maximumFractionDigits: 2
		}).format(amount);
	};

	const getRarityColor = (rarity: string) => {
		switch (rarity.toLowerCase()) {
			case 'classified':
				return 'bg-pink-500/20 text-pink-300 border-pink-500/30';
			default:
				return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
		}
	};

	const getFloatColor = (float: number) => {
		if (float <= 0.07) return 'text-green-400';
		if (float <= 0.15) return 'text-blue-400';
		if (float <= 0.38) return 'text-purple-400';
		if (float <= 0.45) return 'text-pink-400';
		return 'text-red-400';
	};

	const isPositive = item.priceChange >= 0;
</script>

<svelte:head>
	<title>{item.name} ({item.wear}) - TopRoll Marketplace</title>
	<meta
		name="description"
		content={`Buy ${item.name} ({item.wear}) for ${formatCurrency(item.price)} on TopRoll marketplace`}
	/>
</svelte:head>

<div class="space-y-8">
	<!-- Back Navigation -->
	<div class="flex items-center gap-4">
		<Button variant="ghost" size="sm" class="gap-2" href="/marketplace">
			<ArrowLeft class="h-4 w-4" />
			Back to Marketplace
		</Button>
	</div>

	<!-- Main Content Grid -->
	<div class="grid gap-8 lg:grid-cols-[1fr,400px]">
		<!-- Left Column - Item Details -->
		<div class="space-y-6">
			<!-- Item Header -->
			<Card class="border-border/60 bg-surface/70">
				<CardContent class="p-6">
					<div class="flex flex-col gap-6 lg:flex-row">
						<!-- Item Image -->
						<div
							class="border-border/60 relative aspect-[4/3] w-full max-w-md overflow-hidden rounded-xl border lg:aspect-square"
						>
							<img src={item.image} alt={item.name} class="h-full w-full object-cover" />
							<div
								class="from-background/90 via-background/30 absolute inset-0 bg-gradient-to-t to-transparent"
							></div>

							<!-- Rarity Badge -->
							<div class="absolute top-4 left-4">
								<Badge class={`text-sm font-semibold ${getRarityColor(item.rarity)} border`}>
									{item.rarity}
								</Badge>
							</div>
						</div>

						<!-- Item Info -->
						<div class="flex-1 space-y-4">
							<div>
								<h1 class="text-foreground text-3xl font-bold">{item.name}</h1>
								<p class="text-muted-foreground text-lg">{item.weapon} • {item.wear}</p>
								{#if item.pattern}
									<p class="text-muted-foreground text-sm">Pattern: {item.pattern}</p>
								{/if}
								<p class={`text-sm ${getFloatColor(item.float)}`}>Float: {item.float.toFixed(4)}</p>
							</div>

							<!-- Price -->
							<div class="space-y-2">
								<div class="flex items-baseline gap-3">
									<span class="text-foreground text-4xl font-bold"
										>{formatCurrency(item.price)}</span
									>
									<div class="flex items-center gap-1 text-sm">
										{#if isPositive}
											<TrendingUp class="text-success h-4 w-4" />
											<span class="text-success">+{item.priceChange}%</span>
										{:else}
											<TrendingDown class="text-destructive h-4 w-4" />
											<span class="text-destructive">{item.priceChange}%</span>
										{/if}
										<span class="text-muted-foreground">(24h)</span>
									</div>
								</div>
								<p class="text-muted-foreground text-sm">24h Volume: {item.volume} trades</p>
							</div>

							<!-- Actions -->
							<div class="flex flex-wrap gap-3">
								<Button size="lg" class="gap-2">
									<ExternalLink class="h-4 w-4" />
									Buy Now
								</Button>
								<Button variant="outline" size="lg" class="gap-2">
									<Heart class="h-4 w-4" />
									Watch
								</Button>
								<Button variant="outline" size="lg" class="gap-2">
									<Share2 class="h-4 w-4" />
									Share
								</Button>
							</div>

							<!-- Stats -->
							<div class="border-border/40 grid grid-cols-3 gap-4 border-t pt-4">
								<div class="text-center">
									<p class="text-foreground text-lg font-semibold">{item.watching}</p>
									<p class="text-muted-foreground text-xs">Watching</p>
								</div>
								<div class="text-center">
									<p class="text-foreground text-lg font-semibold">{item.likes}</p>
									<p class="text-muted-foreground text-xs">Likes</p>
								</div>
								<div class="text-center">
									<p class="text-foreground text-lg font-semibold">{item.volume}</p>
									<p class="text-muted-foreground text-xs">24h Volume</p>
								</div>
							</div>
						</div>
					</div>
				</CardContent>
			</Card>

			<!-- Description -->
			<Card class="border-border/60 bg-surface/70">
				<CardHeader>
					<CardTitle>Description</CardTitle>
				</CardHeader>
				<CardContent>
					<p class="text-muted-foreground">{item.description}</p>
					<div class="mt-4 space-y-2 text-sm">
						<div class="flex justify-between">
							<span class="text-muted-foreground">Collection:</span>
							<span class="text-foreground">{item.collection}</span>
						</div>
						<div class="flex justify-between">
							<span class="text-muted-foreground">Release Date:</span>
							<span class="text-foreground">{item.releaseDate}</span>
						</div>
						<div class="flex justify-between">
							<span class="text-muted-foreground">Wear Range:</span>
							<span class="text-foreground">{item.minWear} - {item.maxWear}</span>
						</div>
					</div>
				</CardContent>
			</Card>

			<!-- Price History -->
			<Card class="border-border/60 bg-surface/70">
				<CardHeader>
					<CardTitle>Price History</CardTitle>
				</CardHeader>
				<CardContent>
					<div class="space-y-4">
						<div class="bg-surface-muted/30 flex h-48 items-center justify-center rounded-lg">
							<p class="text-muted-foreground">Price chart would go here</p>
						</div>
						<div class="space-y-2">
							{#each priceHistory as point}
								<div class="flex justify-between text-sm">
									<span class="text-muted-foreground">{point.date}</span>
									<span class="text-foreground">{formatCurrency(point.price)}</span>
								</div>
							{/each}
						</div>
					</div>
				</CardContent>
			</Card>
		</div>

		<!-- Right Column - Additional Info -->
		<div class="space-y-6">
			<!-- Security & Delivery -->
			<Card class="border-border/60 bg-surface/70">
				<CardHeader>
					<CardTitle class="text-lg">Security & Delivery</CardTitle>
				</CardHeader>
				<CardContent class="space-y-4">
					<div class="flex items-center gap-3">
						<Shield class="text-success h-5 w-5" />
						<div>
							<p class="text-foreground text-sm font-medium">Secure Trading</p>
							<p class="text-muted-foreground text-xs">Escrow protection</p>
						</div>
					</div>
					<div class="flex items-center gap-3">
						<Truck class="text-primary h-5 w-5" />
						<div>
							<p class="text-foreground text-sm font-medium">Instant Delivery</p>
							<p class="text-muted-foreground text-xs">Automated transfer</p>
						</div>
					</div>
					<div class="flex items-center gap-3">
						<RefreshCw class="text-secondary h-5 w-5" />
						<div>
							<p class="text-foreground text-sm font-medium">7-Day Returns</p>
							<p class="text-muted-foreground text-xs">Satisfaction guaranteed</p>
						</div>
					</div>
				</CardContent>
			</Card>

			<!-- Market Stats -->
			<Card class="border-border/60 bg-surface/70">
				<CardHeader>
					<CardTitle class="text-lg">Market Statistics</CardTitle>
				</CardHeader>
				<CardContent class="space-y-3">
					<div class="flex justify-between">
						<span class="text-muted-foreground text-sm">Current Ask:</span>
						<span class="text-foreground font-medium">{formatCurrency(item.price)}</span>
					</div>
					<div class="flex justify-between">
						<span class="text-muted-foreground text-sm">Current Bid:</span>
						<span class="text-foreground font-medium">{formatCurrency(item.price * 0.95)}</span>
					</div>
					<div class="flex justify-between">
						<span class="text-muted-foreground text-sm">24h High:</span>
						<span class="text-foreground font-medium">{formatCurrency(item.price * 1.05)}</span>
					</div>
					<div class="flex justify-between">
						<span class="text-muted-foreground text-sm">24h Low:</span>
						<span class="text-foreground font-medium">{formatCurrency(item.price * 0.92)}</span>
					</div>
					<div class="flex justify-between">
						<span class="text-muted-foreground text-sm">7-Day Volume:</span>
						<span class="text-foreground font-medium">{item.volume * 7}</span>
					</div>
				</CardContent>
			</Card>

			<!-- Seller Info -->
			<Card class="border-border/60 bg-surface/70">
				<CardHeader>
					<CardTitle class="text-lg">Seller Information</CardTitle>
				</CardHeader>
				<CardContent class="space-y-4">
					<div class="flex items-center gap-3">
						<div class="bg-primary/20 flex h-10 w-10 items-center justify-center rounded-full">
							<Star class="text-primary h-5 w-5" />
						</div>
						<div>
							<p class="text-foreground font-medium">Verified Seller</p>
							<p class="text-muted-foreground text-xs">4.8★ • 1,247 trades</p>
						</div>
					</div>
					<div class="space-y-2 text-sm">
						<div class="flex justify-between">
							<span class="text-muted-foreground">Response Time:</span>
							<span class="text-foreground">&lt; 5 minutes</span>
						</div>
						<div class="flex justify-between">
							<span class="text-muted-foreground">Success Rate:</span>
							<span class="text-foreground">99.2%</span>
						</div>
					</div>
					<Button variant="outline" class="w-full gap-2">
						<ExternalLink class="h-4 w-4" />
						Contact Seller
					</Button>
				</CardContent>
			</Card>
		</div>
	</div>

	<!-- Related Items -->
	<section class="space-y-6">
		<div>
			<h2 class="text-foreground text-2xl font-semibold">Related Items</h2>
			<p class="text-muted-foreground">Similar items you might be interested in</p>
		</div>
		<div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
			{#each relatedItems as relatedItem}
				<MarketplaceItemCard item={relatedItem} />
			{/each}
		</div>
	</section>
</div>
