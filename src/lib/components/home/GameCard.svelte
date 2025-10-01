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
		class="group/card focus-visible:ring-ring focus-visible:ring-offset-background block h-full focus-visible:rounded-2xl focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
	>
		<div
			class="card-surface border-border/50 bg-surface/60 p-lg duration-default ease-snappy relative flex h-full min-h-[18.5rem] flex-col justify-between overflow-hidden rounded-2xl border transition-transform group-hover/card:-translate-y-1"
			style={`--card-background:${image}`}
		>
			{#if vendor}
				<div class="left-lg top-lg absolute z-10">
					<span
						class="border-primary/40 bg-primary/15 px-sm text-primary rounded-full border py-[0.35rem] text-[11px] font-semibold tracking-[0.3em] uppercase"
					>
						{vendor}
					</span>
				</div>
			{/if}
			<div class="space-y-sm relative z-10">
				<h4 class="text-foreground text-lg font-semibold">{title}</h4>
				{#if subtitle}
					<p class="text-foreground/80 text-sm leading-relaxed">{subtitle}</p>
				{/if}
				<span
					class="text-primary pt-sm relative inline-flex items-center text-sm font-semibold transition-opacity group-hover/card:opacity-100"
				>
					Play now
				</span>
			</div>
			<div aria-hidden="true" class="card-overlay"></div>
		</div>
	</a>
{:else}
	<div
		class="card-surface border-border/50 bg-surface/60 p-lg relative flex h-full min-h-[18.5rem] flex-col justify-between overflow-hidden rounded-2xl border"
		style={`--card-background:${image}`}
	>
		{#if vendor}
			<div class="left-lg top-lg absolute z-10">
				<span
					class="border-primary/40 bg-primary/15 px-sm text-primary rounded-full border py-[0.35rem] text-[11px] font-semibold tracking-[0.3em] uppercase"
				>
					{vendor}
				</span>
			</div>
		{/if}
		<div class="space-y-sm relative z-10">
			<h4 class="text-foreground text-lg font-semibold">{title}</h4>
			{#if subtitle}
				<p class="text-foreground/80 text-sm leading-relaxed">{subtitle}</p>
			{/if}
		</div>
		<div aria-hidden="true" class="card-overlay"></div>
	</div>
{/if}

<style lang="postcss">
	.card-surface {
		background: var(--card-background);
		isolation: isolate;
	}

	.card-overlay {
		position: absolute;
		inset: 0;
		border-radius: inherit;
		background: linear-gradient(
			to top,
			oklch(var(--color-background) / 0.85),
			oklch(var(--color-background) / 0.2) 45%,
			transparent
		);
		mix-blend-mode: normal;
		pointer-events: none;
		z-index: 0;
	}

	.group\/card:hover .card-overlay,
	.group\/card:focus-visible .card-overlay {
		background: linear-gradient(
			to top,
			oklch(var(--color-background) / 0.78),
			oklch(var(--color-accent-400) / 0.25) 55%,
			transparent
		);
	}
</style>
