<script lang="ts">
        import GameCard from './GameCard.svelte';
        import type { Snippet } from 'svelte';

	export type GameItem = {
		id: string;
		title: string;
		vendor?: string;
		subtitle?: string;
		image: string; // CSS background value
		href?: string;
	};

        type Props = {
                title: string;
                items?: GameItem[];
                actionLabel?: string;
                children?: Snippet;
        };

        const props: Props = $props();
        const title = $derived(props.title);
        const items = $derived(props.items ?? []);
        const actionLabel = $derived(props.actionLabel ?? 'view all');
        const children = $derived(props.children);
</script>

<section class="space-y-6">
	<div class="flex items-center justify-between">
		<h3 class="text-foreground text-2xl font-black tracking-wider uppercase drop-shadow-sm">
			{title}
		</h3>
		<a
			href="/cases"
			class="group duration-accent ease-market-ease border-accent/30 bg-surface-accent text-surface-accent-foreground hover:border-accent/60 hover:bg-accent hover:text-accent-foreground hover:shadow-marketplace-md rounded-full border px-6 py-3 text-sm font-bold tracking-wider uppercase transition-all"
		>
			{actionLabel}
		</a>
	</div>
	<div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
		{#each items as item (item.id)}
			<GameCard
				title={item.title}
				vendor={item.vendor ?? ''}
				subtitle={item.subtitle ?? ''}
				image={item.image}
				href={item.href}
			/>
		{/each}
	</div>
        {@render children?.()}
</section>
