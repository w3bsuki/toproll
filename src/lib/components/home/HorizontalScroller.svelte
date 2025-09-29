<script lang="ts">
	import { Button, Badge } from '$lib/components/ui';
	import { cn } from '$lib/utils';

	export interface HorizontalItem {
		id: string;
		title: string;
		subtitle: string;
		meta?: string;
		highlight?: string;
		cta?: string;
		background: string;
	}

	interface HorizontalScrollerProps {
		title: string;
		caption?: string;
		actionLabel?: string;
		items: HorizontalItem[];
		class?: string;
	}

	let {
		title,
		caption,
		actionLabel = 'View all',
		items,
		class: className = ''
	}: HorizontalScrollerProps = $props();
</script>

<section class={cn('space-y-4', className)}>
	<div class="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
		<div class="space-y-1">
			<h3 class="text-xl font-semibold tracking-tight">{title}</h3>
			{#if caption}
				<p class="text-muted-foreground text-sm">{caption}</p>
			{/if}
		</div>
		<Button
			variant="ghost"
			class="text-muted-foreground hover:text-foreground w-full justify-center gap-2 rounded-2xl px-4 py-3 text-sm md:w-auto"
		>
			{actionLabel}
		</Button>
	</div>

	<div class="marketplace-scrollbar -mx-1 flex snap-x gap-4 overflow-x-auto px-1 pb-1">
		{#each items as item}
			<article
				class="border-border/40 shrink-0 basis-[88%] snap-start rounded-[28px] border bg-cover bg-center bg-no-repeat p-6 text-white shadow-[0_18px_65px_rgba(15,23,42,0.45)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_28px_80px_rgba(12,74,110,0.55)] sm:basis-[58%] lg:basis-[38%] xl:basis-[28%]"
				style={`background:${item.background}`}
			>
				<div class="flex flex-col gap-4">
					<div class="space-y-3">
						<Badge
							variant="outline"
							class="border-white/30 bg-white/10 text-[10px] tracking-[0.4em] text-white/80 uppercase"
						>
							{item.meta ?? 'Featured'}
						</Badge>
						<div class="space-y-1">
							<h4 class="text-lg leading-snug font-semibold">{item.title}</h4>
							<p class="text-sm leading-relaxed text-white/70">{item.subtitle}</p>
						</div>
						{#if item.highlight}
							<p class="text-xs tracking-[0.35em] text-white/80 uppercase">{item.highlight}</p>
						{/if}
					</div>
					{#if item.cta}
						<Button
							class="w-full rounded-2xl bg-white text-sm font-semibold text-slate-900 hover:bg-white/90"
						>
							{item.cta}
						</Button>
					{/if}
				</div>
			</article>
		{/each}
	</div>
</section>
