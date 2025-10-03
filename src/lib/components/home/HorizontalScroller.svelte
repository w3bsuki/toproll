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

<section class={cn('space-y-6', className)}>
	<div class="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
		<div class="space-y-2">
			<h3 class="text-2xl font-bold tracking-tight">{title}</h3>
			{#if caption}
				<p class="text-muted-foreground text-base">{caption}</p>
			{/if}
		</div>
		<Button
			variant="ghost"
			class="text-muted-foreground w-full justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold md:w-auto"
		>
			{actionLabel}
		</Button>
	</div>

	<div class="marketplace-scrollbar -mx-1 flex snap-x gap-5 overflow-x-auto px-1 pb-2">
		{#each items as item}
			<article
				class="border-border/40 text-foreground shadow-marketplace-md shrink-0 basis-[88%] snap-start rounded-[28px] border bg-cover bg-center bg-no-repeat p-6 sm:basis-[58%] lg:basis-[38%] xl:basis-[28%]"
				style={`background:${item.background}`}
			>
				<div class="flex flex-col gap-4">
					<div class="space-y-3">
						<Badge
							variant="outline"
							class="border-border/50 bg-surface/40 text-foreground/80 text-[10px] tracking-[0.4em] uppercase backdrop-blur-sm"
						>
							{item.meta ?? 'Featured'}
						</Badge>
						<div class="space-y-1">
							<h4 class="text-lg leading-snug font-semibold">{item.title}</h4>
							<p class="text-foreground/70 text-sm leading-relaxed">{item.subtitle}</p>
						</div>
						{#if item.highlight}
							<p class="text-foreground/80 text-xs tracking-[0.35em] uppercase">{item.highlight}</p>
						{/if}
					</div>
					{#if item.cta}
						<Button class="bg-card text-card-foreground  w-full rounded-2xl text-sm font-semibold">
							{item.cta}
						</Button>
					{/if}
				</div>
			</article>
		{/each}
	</div>
</section>
