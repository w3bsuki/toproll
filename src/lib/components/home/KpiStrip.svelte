<script lang="ts">
	import { marketplaceKpis } from '$lib/stores/homepage';

	const kpis = $derived($marketplaceKpis);
</script>

<section class="space-y-3">
	<h2 class="text-lg font-semibold tracking-tight">Live marketplace KPIs</h2>
	<div
		class="marketplace-scrollbar -mx-1 flex snap-x gap-3 overflow-x-auto px-1 pb-1 md:grid md:snap-none md:grid-cols-3 md:gap-3 md:overflow-visible md:px-0 md:pb-0"
	>
		{#each kpis as kpi}
			<article
				class="border-border/50 bg-surface/80 shrink-0 basis-[70%] snap-start rounded-2xl border px-4 py-3 shadow-[0_12px_30px_rgba(15,23,42,0.25)] md:basis-auto"
			>
				<p class="text-muted-foreground text-[11px] tracking-[0.3em] uppercase">{kpi.label}</p>
				<div class="mt-2 flex items-baseline justify-between">
					<span class="text-xl font-semibold">{kpi.value}</span>
					<span
						class={`text-xs font-semibold tracking-[0.3em] uppercase ${
							kpi.tone === 'positive'
								? 'text-success'
								: kpi.tone === 'negative'
									? 'text-destructive'
									: 'text-muted-foreground'
						}`}
					>
						{kpi.trend}
					</span>
				</div>
			</article>
		{/each}
	</div>
</section>
