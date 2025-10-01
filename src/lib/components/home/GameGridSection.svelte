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

<section class="space-y-xl">
	<div class="gap-sm flex flex-wrap items-center justify-between">
		<h3 class="text-foreground text-2xl font-semibold">
			{title}
		</h3>
		<a
			href="/cases"
			class="border-primary/40 bg-primary/15 px-lg py-sm text-primary hover:bg-primary hover:text-primary-foreground focus-visible:ring-ring focus-visible:ring-offset-background rounded-full border text-sm font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
		>
			{actionLabel}
		</a>
	</div>
	<div class="gap-lg grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
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
