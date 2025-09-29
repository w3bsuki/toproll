<script lang="ts">
	import { marketplaceKpis } from '$lib/stores/homepage';

	const kpis = $derived($marketplaceKpis);
</script>

<section class="grid gap-3 sm:grid-cols-3">
	{#each kpis as kpi}
		<article
			class="border-border/70 bg-surface/70 flex flex-col gap-2 rounded-2xl border px-4 py-3 shadow-[0_12px_30px_rgba(15,23,42,0.25)]"
		>
			<p class="text-muted-foreground text-[11px] tracking-[0.3em] uppercase">{kpi.label}</p>
			<div class="flex items-baseline justify-between">
				<span class="text-foreground text-lg font-semibold">{kpi.value}</span>
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
</section>
