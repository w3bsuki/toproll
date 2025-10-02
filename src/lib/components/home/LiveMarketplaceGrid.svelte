<script lang="ts">
	import { marketplaceItems } from '$lib/stores/homepage';
	import { Badge, Button } from '$lib/components/ui';
	import { ArrowRight, Users } from '@lucide/svelte';

	const items = $derived($marketplaceItems);

	const rarityStyles = {
		Common: 'border-border/60 bg-surface-muted/40 text-muted-foreground',
		Rare: 'border-accent/50 bg-accent/15 text-accent-foreground/80',
		Epic: 'border-secondary/60 bg-secondary/15 text-secondary-foreground/90',
		Legendary: 'border-primary/60 bg-primary/15 text-primary-foreground/80'
	} as const;
</script>

<section class="space-y-6">
	<div class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
		<div>
			<p class="text-muted-foreground text-xs tracking-[0.3em] uppercase">Live inventory</p>
			<h2 class="text-2xl font-semibold">Live Marketplace</h2>
			<p class="text-muted-foreground text-sm">
				High-liquidity skins updating in real time from the trading floor.
			</p>
		</div>
		<Button variant="outline" class="gap-2">
			View full marketplace
			<ArrowRight class="h-4 w-4" />
		</Button>
	</div>

	<div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
		{#each items as item}
			<article
				class="border-border/60 bg-surface/70 group hover:shadow-marketplace-lg flex flex-col justify-between rounded-2xl border p-4 transition-all duration-300 hover:-translate-y-1"
			>
				<div class="space-y-4">
					<div
						class="border-border/50 bg-surface/50 relative overflow-hidden rounded-2xl border p-5"
						style={`background:${item.image}`}
					>
						<div
							class="from-background/60 to-background/80 absolute inset-0 bg-gradient-to-br via-transparent"
							aria-hidden="true"
						></div>
						<div class="relative z-[1] flex items-start justify-between">
							<Badge class={`text-[10px] tracking-[0.2em] uppercase ${rarityStyles[item.rarity]}`}>
								{item.rarity}
							</Badge>
							<span
								class="border-border/50 bg-surface/60 text-muted-foreground rounded-full border px-2 py-1 text-[10px] tracking-[0.3em] uppercase"
							>
								{item.volatility}
							</span>
						</div>
						<div class="relative z-[1] mt-16 text-left">
							<p class="text-muted-foreground text-xs tracking-[0.3em] uppercase">
								{item.playersOnline} players
							</p>
							<p class="text-foreground text-lg font-semibold">{item.name}</p>
						</div>
					</div>

					<div class="space-y-1">
						<p class="text-muted-foreground text-xs tracking-[0.3em] uppercase">Current ask</p>
						<p class="text-xl font-semibold">{item.price}</p>
					</div>
				</div>

				<div class="mt-4 flex items-center justify-between">
					<div class="text-muted-foreground flex items-center gap-2">
						<span
							class="border-border/60 bg-surface-muted/40 flex h-9 w-9 items-center justify-center rounded-xl border"
						>
							<Users class="h-4 w-4" />
						</span>
						<div>
							<p class="text-[11px] tracking-[0.3em] uppercase">Watching</p>
							<p class="text-foreground text-sm font-medium">
								{item.playersOnline.toLocaleString()} live
							</p>
						</div>
					</div>
					<Button size="sm" class="gap-2">
						Open listing
						<ArrowRight class="h-4 w-4" />
					</Button>
				</div>
			</article>
		{/each}
	</div>
</section>
