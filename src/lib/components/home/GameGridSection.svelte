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

<section class="space-y-6">
	<div class="flex items-center justify-between">
		<h3 class="text-2xl font-black tracking-wider text-foreground uppercase drop-shadow-sm">
			{title}
		</h3>
		<a
			href="/cases"
			class="group duration-accent ease-market-ease rounded-full border border-accent/30 bg-surface-accent px-6 py-3 text-sm font-bold tracking-wider text-surface-accent-foreground uppercase transition-all hover:border-accent/60 hover:bg-accent hover:text-accent-foreground hover:shadow-marketplace-md"
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
	<slot />
</section>
