<script lang="ts">
	import { marketplaceItems } from '$lib/stores/homepage';
	import { Badge, Button } from '$lib/components/ui';
	import { Eye, TrendingUp } from 'lucide-svelte';

	const items = $derived($marketplaceItems);
</script>

<section class="space-y-5">
	<div class="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
		<div class="space-y-1">
			<h2 class="text-2xl font-semibold tracking-tight">Live Marketplace</h2>
			<p class="text-muted-foreground text-sm">
				Curated skins with instant liquidity and transparent asks.
			</p>
		</div>
		<Button variant="outline" class="w-full gap-2 sm:w-auto">
			<TrendingUp class="h-4 w-4" />
			View analytics
		</Button>
	</div>

	<div class="marketplace-scrollbar grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
		{#each items as item}
			<article
				class="border-border/70 bg-surface/70 hover:border-primary/60 relative overflow-hidden rounded-3xl border shadow-[0_18px_50px_rgba(15,23,42,0.35)] transition hover:-translate-y-1 hover:shadow-[0_28px_60px_rgba(12,74,110,0.45)]"
			>
				<div
					class="relative h-32 w-full overflow-hidden rounded-3xl"
					style={`background:${item.image}`}
				>
					<div
						class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"
					></div>
					<div class="absolute top-5 left-5 flex items-center gap-2">
						<Badge
							variant="outline"
							class="border-white/40 bg-white/10 text-xs tracking-[0.35em] text-white uppercase"
						>
							{item.rarity}
						</Badge>
					</div>
				</div>
				<div class="space-y-4 p-5">
					<div>
						<h3 class="text-base leading-snug font-semibold">{item.name}</h3>
						<p class="text-muted-foreground text-xs tracking-[0.3em] uppercase">
							Volatility · {item.volatility}
						</p>
					</div>
					<div class="flex items-center justify-between">
						<div>
							<p class="text-muted-foreground text-xs tracking-[0.3em] uppercase">Current ask</p>
							<p class="text-lg font-semibold">{item.price}</p>
						</div>
						<div
							class="border-border/60 bg-surface-muted/60 text-muted-foreground flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium tracking-[0.3em] uppercase"
						>
							<Eye class="h-4 w-4" />
							{item.watching}
						</div>
					</div>
					<Button variant="secondary" class="w-full">Open details</Button>
				</div>
			</article>
		{/each}
	</div>
</section>
