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
		class="group focus-visible:ring-ring/60 block rounded-[22px] focus:outline-none focus-visible:ring-2"
	>
		<div
			class="duration-accent ease-market-ease relative flex h-full flex-col justify-end overflow-hidden rounded-[22px] bg-cover bg-center transition-all"
			style={`background:${image}`}
		>
			<!-- Gradient Frame -->
			<div
				class="duration-accent ease-market-ease from-accent/20 to-accent/10 absolute inset-0 rounded-[22px] bg-gradient-to-br via-transparent opacity-0 transition-opacity group-hover:opacity-100"
			></div>

			<!-- Spotlight Effect -->
			<div
				class="duration-accent ease-market-ease from-foreground/10 absolute inset-0 rounded-[22px] bg-gradient-to-br via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100"
			></div>

			<!-- Neon Border Glow -->
			<div
				class="duration-accent ease-market-ease ring-accent/30 group-hover:ring-accent/60 absolute inset-0 rounded-[22px] opacity-0 ring-1 transition-opacity group-hover:opacity-100"
			></div>

			<!-- Shadow Enhancement -->
			<div
				class="duration-accent ease-market-ease shadow-marketplace-md group-hover:shadow-marketplace-lg absolute inset-0 rounded-[22px] transition-shadow"
			></div>

			<!-- Content Overlay -->
			<div
				class="from-background/85 via-background/25 pointer-events-none absolute inset-0 bg-gradient-to-t to-transparent"
			></div>

			<!-- Vendor Tag -->
			{#if vendor}
				<div class="absolute top-4 left-4 z-10">
					<div
						class="border-accent/30 bg-surface-accent/90 text-surface-accent-foreground rounded-full border px-3 py-1 text-xs font-bold tracking-wider uppercase backdrop-blur-sm"
					>
						{vendor}
					</div>
				</div>
			{/if}

			<!-- CTA Chip -->
			<div
				class="duration-accent ease-market-ease absolute top-4 right-4 z-10 opacity-0 transition-all group-hover:opacity-100"
			>
				<div
					class="bg-accent text-accent-foreground shadow-marketplace-sm rounded-full px-4 py-2 text-xs font-bold tracking-wider uppercase backdrop-blur-sm"
				>
					Play Now
				</div>
			</div>

			<!-- Card Content -->
			<div class="relative z-10 p-6">
				<h4 class="text-foreground mb-1 text-xl leading-tight font-black uppercase drop-shadow-lg">
					{title}
				</h4>
				{#if subtitle}
					<p class="text-foreground/90 text-sm font-medium">
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
			class="from-background/85 via-background/25 pointer-events-none absolute inset-0 bg-gradient-to-t to-transparent"
		></div>

		<!-- Vendor Tag -->
		{#if vendor}
			<div class="absolute top-4 left-4 z-10">
				<div
					class="border-accent/30 bg-surface-accent/90 text-surface-accent-foreground rounded-full border px-3 py-1 text-xs font-bold tracking-wider uppercase backdrop-blur-sm"
				>
					{vendor}
				</div>
			</div>
		{/if}

		<!-- Card Content -->
		<div class="relative z-10 p-6">
			<h4 class="text-foreground mb-1 text-xl leading-tight font-black uppercase drop-shadow-lg">
				{title}
			</h4>
			{#if subtitle}
				<p class="text-foreground/90 text-sm font-medium">
					{subtitle}
				</p>
			{/if}
		</div>
	</div>
{/if}
