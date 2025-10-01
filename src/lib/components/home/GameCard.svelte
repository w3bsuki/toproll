<script lang="ts">
	type Props = {
		title: string;
		subtitle?: string;
		vendor?: string;
		image: string; // background css
		href?: string;
	};

	const p: Props = $props();
	const title = $derived(p.title);
	const subtitle = $derived(p.subtitle ?? '');
	const vendor = $derived(p.vendor ?? '');
	const image = $derived(p.image);
	const href = $derived(p.href);
</script>

{#if href}
	<a
		{href}
		class="group block rounded-[22px] focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
	>
		<div
			class="duration-accent ease-market-ease relative flex h-full flex-col justify-end overflow-hidden rounded-[22px] bg-cover bg-center transition-all hover:-translate-y-1"
			style={`background:${image}`}
		>
			<!-- Gradient Frame -->
			<div
				class="duration-accent ease-market-ease absolute inset-0 rounded-[22px] bg-gradient-to-br from-accent/20 via-transparent to-accent/10 opacity-0 transition-opacity group-hover:opacity-100"
			></div>

			<!-- Spotlight Effect -->
			<div
				class="duration-accent ease-market-ease absolute inset-0 rounded-[22px] bg-gradient-to-br from-white/5 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100"
			></div>

			<!-- Neon Border Glow -->
			<div
				class="duration-accent ease-market-ease absolute inset-0 rounded-[22px] opacity-0 ring-1 ring-accent/30 transition-opacity group-hover:opacity-100 group-hover:ring-accent/60"
			></div>

			<!-- Shadow Enhancement -->
			<div
				class="duration-accent ease-market-ease absolute inset-0 rounded-[22px] shadow-marketplace-md transition-shadow group-hover:shadow-marketplace-lg"
			></div>

			<!-- Content Overlay -->
			<div
				class="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"
			></div>

			<!-- Vendor Tag -->
			{#if vendor}
				<div class="absolute top-4 left-4 z-10">
					<div
						class="rounded-full border border-accent/30 bg-surface-accent/90 px-3 py-1 text-xs font-bold tracking-wider text-surface-accent-foreground uppercase backdrop-blur-sm"
					>
						{vendor}
					</div>
				</div>
			{/if}

			<!-- CTA Chip -->
			<div
				class="duration-accent ease-market-ease absolute top-4 right-4 z-10 translate-y-2 opacity-0 transition-all group-hover:translate-y-0 group-hover:opacity-100"
			>
				<div
					class="rounded-full bg-accent px-4 py-2 text-xs font-bold tracking-wider text-accent-foreground uppercase shadow-marketplace-sm backdrop-blur-sm"
				>
					Play Now
				</div>
			</div>

			<!-- Card Content -->
			<div class="relative z-10 p-6">
				<h4 class="mb-1 text-xl leading-tight font-black text-white uppercase drop-shadow-lg">
					{title}
				</h4>
				{#if subtitle}
					<p class="text-sm font-medium text-white/90">
						{subtitle}
					</p>
				{/if}
			</div>
		</div>
	</a>
{:else}
	<div
		class="relative flex h-full flex-col justify-end overflow-hidden rounded-[22px] bg-cover bg-center"
		style={`background:${image}`}
	>
		<!-- Content Overlay -->
		<div
			class="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"
		></div>

		<!-- Vendor Tag -->
		{#if vendor}
			<div class="absolute top-4 left-4 z-10">
				<div
					class="rounded-full border border-accent/30 bg-surface-accent/90 px-3 py-1 text-xs font-bold tracking-wider text-surface-accent-foreground uppercase backdrop-blur-sm"
				>
					{vendor}
				</div>
			</div>
		{/if}

		<!-- Card Content -->
		<div class="relative z-10 p-6">
			<h4 class="mb-1 text-xl leading-tight font-black text-white uppercase drop-shadow-lg">
				{title}
			</h4>
			{#if subtitle}
				<p class="text-sm font-medium text-white/90">
					{subtitle}
				</p>
			{/if}
		</div>
	</div>
{/if}
