<script lang="ts">
	import { marketplaceItems } from '$lib/stores/homepage';
        import { Badge, Button } from '$lib/components/ui';
        import { Eye, TrendingUp } from 'lucide-svelte';

        const items = $derived($marketplaceItems);
        const galleries = $derived(() => [
                {
                        id: 'popular',
                        title: 'Popular',
                        description: 'Trending drops the community is opening right now.',
                        items: items.slice(0, 5)
                },
                {
                        id: 'megaways',
                        title: 'Megaways',
                        description: 'High-volatility multi-line slots with oversized jackpots.',
                        items: items.slice(5, 10)
                }
        ]);
</script>

<section class="space-y-10">
        <div class="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                <div class="space-y-1">
                        <p class="text-[12px] font-semibold uppercase tracking-[0.4em] text-primary/80">
                                Marketplace intel
                        </p>
                        <h2 class="text-3xl font-semibold tracking-tight">Live Marketplace</h2>
                        <p class="text-muted-foreground text-sm">
                                Curated skins and slots with instant liquidity, tailored for your active filters.
                        </p>
                </div>
                <Button variant="outline" class="w-full gap-2 rounded-2xl px-4 py-3 text-sm lg:w-auto">
                        <TrendingUp class="h-4 w-4" />
                        View analytics
                </Button>
        </div>

        <div class="space-y-12">
                {#each galleries as gallery (gallery.id)}
                        <div class="space-y-5">
                                <div class="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                                        <div class="space-y-1">
                                                <h3 class="text-2xl font-semibold tracking-tight">{gallery.title}</h3>
                                                <p class="text-muted-foreground text-sm">{gallery.description}</p>
                                        </div>
                                        <Button
                                                variant="ghost"
                                                class="text-muted-foreground hover:text-foreground gap-2 rounded-2xl px-3 py-2 text-sm"
                                        >
                                                Browse all
                                        </Button>
                                </div>

                                <div class="marketplace-scrollbar grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                                        {#each gallery.items as item (item.id)}
                                                <article
                                                        class="border-border/60 bg-surface/80 hover:border-primary/60 group relative flex h-full flex-col overflow-hidden rounded-[28px] border shadow-[0_18px_60px_rgba(15,23,42,0.4)] transition duration-300 hover:-translate-y-1"
                                                >
                                                        <div class="relative w-full overflow-hidden">
                                                                <div class="aspect-[16/10] w-full" style={`background:${item.image}`}></div>
                                                                <div
                                                                        class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent"
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
                                                        <div class="flex flex-1 flex-col gap-4 p-5">
                                                                <div class="space-y-2">
                                                                        <h4 class="text-base leading-snug font-semibold">{item.name}</h4>
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
                        </div>
                {/each}
        </div>
</section>
