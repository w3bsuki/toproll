<script lang="ts">
        import { marketplaceItems } from '$lib/stores/homepage';
        import { Badge, Button } from '$lib/components/ui';
        import { ArrowRight, Users } from 'lucide-svelte';

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
                        <p class="text-xs uppercase tracking-[0.3em] text-muted-foreground">Live inventory</p>
                        <h2 class="text-2xl font-semibold">Live Marketplace</h2>
                        <p class="text-muted-foreground text-sm">High-liquidity skins updating in real time from the trading floor.</p>
                </div>
                <Button variant="outline" class="gap-2">
                        View full marketplace
                        <ArrowRight class="h-4 w-4" />
                </Button>
        </div>

        <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                {#each items as item}
                        <article class="border-border/60 bg-surface/70 group flex flex-col justify-between rounded-2xl border p-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-marketplace-lg">
                                <div class="space-y-4">
                                        <div
                                                class="relative overflow-hidden rounded-2xl border border-white/10 bg-black/40 p-5"
                                                style={`background:${item.image}`}
                                        >
                                                <div class="absolute inset-0 bg-gradient-to-br from-black/40 via-transparent to-black/60" aria-hidden="true"></div>
                                                <div class="relative z-[1] flex items-start justify-between">
                                                        <Badge class={`uppercase tracking-[0.2em] text-[10px] ${rarityStyles[item.rarity]}`}>
                                                                {item.rarity}
                                                        </Badge>
                                                        <span class="border-white/40 bg-black/50 text-white/80 rounded-full border px-2 py-1 text-[10px] uppercase tracking-[0.3em]">
                                                                {item.volatility}
                                                        </span>
                                                </div>
                                                <div class="relative z-[1] mt-16 text-left">
                                                        <p class="text-xs uppercase tracking-[0.3em] text-white/60">{item.playersOnline} players</p>
                                                        <p class="text-lg font-semibold text-white">{item.name}</p>
                                                </div>
                                        </div>

                                        <div class="space-y-1">
                                                <p class="text-muted-foreground text-xs uppercase tracking-[0.3em]">Current ask</p>
                                                <p class="text-xl font-semibold">{item.price}</p>
                                        </div>
                                </div>

                                <div class="mt-4 flex items-center justify-between">
                                        <div class="flex items-center gap-2 text-muted-foreground">
                                                <span class="border-border/60 bg-surface-muted/40 flex h-9 w-9 items-center justify-center rounded-xl border">
                                                        <Users class="h-4 w-4" />
                                                </span>
                                                <div>
                                                        <p class="text-[11px] uppercase tracking-[0.3em]">Watching</p>
                                                        <p class="text-sm font-medium text-foreground">{item.playersOnline.toLocaleString()} live</p>
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
