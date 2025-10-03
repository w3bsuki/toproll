<script lang="ts">
	import { marketplaceItems } from '$lib/stores/homepage';
	import { Badge, Button } from '$lib/components/ui';
	import { Eye, TrendingUp } from '@lucide/svelte';

	const items = $derived($marketplaceItems);
</script>

<section class="space-y-8">
	<div class="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
		<div class="space-y-2">
			<h2 class="text-3xl font-bold tracking-tight">Live Marketplace</h2>
			<p class="text-muted-foreground text-base">
				Curated skins with instant liquidity and transparent asks
			</p>
		</div>
		<Button variant="outline" class="w-full gap-2 rounded-2xl px-5 py-3 text-sm md:w-auto">
			<TrendingUp class="h-4 w-4" />
			View analytics
		</Button>
	</div>

	<div class="marketplace-scrollbar grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
		{#each items as item}
			<article
				class="border-border/60 bg-surface/80 shadow-2xl relative flex h-full flex-col overflow-hidden rounded-3xl border-2"
			>
				<div class="relative w-full overflow-hidden">
					<div class="aspect-[16/10] w-full" style={`background:${item.image}`}></div>
					<div
						class="from-background/90 via-background/30 absolute inset-0 bg-gradient-to-t to-transparent"
					></div>
					<div class="absolute top-6 left-6 flex items-center gap-2">
						<Badge
							variant="outline"
							class="border-white/30 bg-white/20 text-white text-xs tracking-wider uppercase backdrop-blur-md font-semibold"
						>
							{item.rarity}
						</Badge>
					</div>
				</div>
				<div class="flex flex-1 flex-col gap-5 p-6">
					<div class="space-y-2">
						<h3 class="text-2xl leading-snug font-bold">{item.name}</h3>
						<p class="text-muted-foreground text-xs tracking-wider uppercase">
							Volatility · {item.volatility}
						</p>
					</div>
					<div class="flex items-center justify-between">
						<div>
							<p class="text-muted-foreground text-[11px] tracking-wider uppercase">
								Current ask
							</p>
							<p class="text-3xl font-bold">{item.price}</p>
						</div>
						<div
							class="border-border/60 bg-surface-muted/60 text-muted-foreground flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium"
						>
							<Eye class="h-4 w-4" />
							{item.watching}
						</div>
					</div>
					<Button variant="secondary" class="mt-auto w-full rounded-2xl text-sm font-semibold">
						Open details
					</Button>
				</div>
			</article>
		{/each}
	</div>
</section>
