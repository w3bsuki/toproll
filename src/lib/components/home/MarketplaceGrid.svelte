<script lang="ts">
	import { marketplaceItems } from '$lib/stores/homepage';
	import { Badge, Button } from '$lib/components/ui';
	import { Eye, TrendingUp } from '@lucide/svelte';

	const items = $derived($marketplaceItems);
</script>

<section class="space-y-5">
	<div class="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
		<div class="space-y-1">
			<h2 class="text-2xl font-semibold tracking-tight">Live Marketplace</h2>
			<p class="text-muted-foreground text-sm">
				Curated skins with instant liquidity and transparent asks.
			</p>
		</div>
		<Button variant="outline" class="w-full gap-2 rounded-2xl px-4 py-3 text-sm md:w-auto">
			<TrendingUp class="h-4 w-4" />
			View analytics
		</Button>
	</div>

	<div class="marketplace-scrollbar grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
		{#each items as item}
			<article
				class="border-border/60 bg-surface/80 hover:border-primary/60 group shadow-marketplace-lg relative flex h-full flex-col overflow-hidden rounded-[28px] border transition duration-300 hover:-translate-y-1"
			>
				<div class="relative w-full overflow-hidden">
					<div class="aspect-[16/10] w-full" style={`background:${item.image}`}></div>
					<div
						class="from-background/80 via-background/20 absolute inset-0 bg-gradient-to-t to-transparent"
					></div>
					<div class="absolute top-5 left-5 flex items-center gap-2">
						<Badge
							variant="outline"
							class="border-border/50 bg-surface/40 text-foreground/85 text-xs tracking-[0.35em] uppercase backdrop-blur-sm"
						>
							{item.rarity}
						</Badge>
					</div>
				</div>
				<div class="flex flex-1 flex-col gap-4 p-5">
					<div class="space-y-2">
						<h3 class="text-base leading-snug font-semibold">{item.name}</h3>
						<p class="text-muted-foreground text-xs tracking-[0.3em] uppercase">
							Volatility · {item.volatility}
						</p>
					</div>
					<div class="flex items-center justify-between">
						<div>
							<p class="text-muted-foreground text-[11px] tracking-[0.3em] uppercase">
								Current ask
							</p>
							<p class="text-xl font-semibold">{item.price}</p>
						</div>
						<div
							class="border-border/60 bg-surface-muted/60 text-muted-foreground flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium"
						>
							<Eye class="h-4 w-4" />
							{item.watching}
						</div>
					</div>
					<Button variant="secondary" class="mt-auto w-full rounded-2xl text-sm">
						Open details
					</Button>
				</div>
			</article>
		{/each}
	</div>
</section>
