<script lang="ts">
	import GameCard from './GameCard.svelte';

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
	};

	const props: Props = $props();
	const title = $derived(props.title);
	const items = $derived(props.items ?? []);
	const actionLabel = $derived(props.actionLabel ?? 'view all');
</script>

<section class="space-y-lg">
	<div class="gap-sm flex flex-wrap items-center justify-between">
		<h3 class="text-foreground text-2xl font-semibold">
			{title}
		</h3>
		<a
			href="/cases"
			class="border-primary/40 bg-primary/15 px-md py-xs text-primary hover:bg-primary hover:text-primary-foreground rounded-full border text-sm font-medium transition-colors"
		>
			{actionLabel}
		</a>
	</div>
	<div class="gap-md grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
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
	<slot />
</section>
