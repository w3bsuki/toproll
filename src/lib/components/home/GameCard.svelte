<script lang="ts">
	type Props = {
		title: string;
		subtitle?: string;
		vendor?: string;
		image: string;
		href?: string;
	};

	const props = $props<Props>();
	const title = $derived(props.title);
	const subtitle = $derived(props.subtitle ?? '');
	const vendor = $derived(props.vendor ?? '');
	const image = $derived(props.image);
	const href = $derived(props.href);
</script>

{#if href}
	<a
		{href}
		class="group focus-visible:ring-ring focus-visible:ring-offset-background block focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
	>
		<div
			class="border-border/50 bg-surface-subdued/80 p-md duration-default ease-snappy relative flex h-full flex-col justify-end overflow-hidden rounded-xl border transition-transform group-hover:-translate-y-1"
			style={`background:${image}`}
		>
			<div
				class="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"
				aria-hidden="true"
			></div>
			{#if vendor}
				<div class="left-md top-md absolute">
					<span
						class="border-primary/30 bg-primary/20 px-sm text-primary rounded-full border py-[0.2rem] text-xs font-medium tracking-[0.25em] uppercase"
					>
						{vendor}
					</span>
				</div>
			{/if}
			<div class="space-y-xs relative z-10">
				<h4 class="text-foreground text-lg font-semibold">{title}</h4>
				{#if subtitle}
					<p class="text-foreground/80 text-sm">{subtitle}</p>
				{/if}
				<span
					class="text-primary inline-flex items-center text-xs font-medium transition-opacity group-hover:opacity-100"
				>
					Play now
				</span>
			</div>
		</div>
	</a>
{:else}
	<div
		class="border-border/50 bg-surface-subdued/80 p-md relative flex h-full flex-col justify-end overflow-hidden rounded-xl border"
		style={`background:${image}`}
	>
		<div
			class="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"
			aria-hidden="true"
		></div>
		{#if vendor}
			<div class="left-md top-md absolute">
				<span
					class="border-primary/30 bg-primary/20 px-sm text-primary rounded-full border py-[0.2rem] text-xs font-medium tracking-[0.25em] uppercase"
				>
					{vendor}
				</span>
			</div>
		{/if}
		<div class="space-y-xs relative z-10">
			<h4 class="text-foreground text-lg font-semibold">{title}</h4>
			{#if subtitle}
				<p class="text-foreground/80 text-sm">{subtitle}</p>
			{/if}
		</div>
	</div>
{/if}
