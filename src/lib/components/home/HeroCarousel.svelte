<script lang="ts">
	import { onMount } from 'svelte';
	import { heroPromotions } from '$lib/stores/homepage';
	import { Button, Badge } from '$lib/components/ui';
	import { ChevronLeft, ChevronRight } from '@lucide/svelte';

	const slides = $derived($heroPromotions);
	let activeIndex = $state(0);
	let timer: ReturnType<typeof setInterval> | null = null;

	function goTo(index: number) {
		activeIndex = index;
		startTimer();
	}

	function step(direction: 1 | -1) {
		const nextIndex = (activeIndex + direction + slides.length) % slides.length;
		goTo(nextIndex);
	}

	function startTimer() {
		stopTimer();
		if (!slides.length) return;
		timer = setInterval(() => {
			activeIndex = (activeIndex + 1) % slides.length;
		}, 6500);
	}

	function stopTimer() {
		if (timer) {
			clearInterval(timer);
			timer = null;
		}
	}

	onMount(() => {
		startTimer();
		return () => stopTimer();
	});
</script>

{#if slides.length}
	<section
		class="border-border/70 bg-surface/70 shadow-marketplace-lg relative overflow-hidden rounded-[32px] border"
	>
		<div
			class="relative grid min-h-[420px] gap-10 overflow-hidden lg:grid-cols-[1.2fr,0.8fr]"
			style={`background:${slides[activeIndex]?.background ?? 'var(--surface)'}`}
		>
			<div class="relative flex flex-col justify-between p-8 sm:p-12">
				<div class="text-foreground space-y-6">
					<div class="flex flex-wrap items-center gap-3">
						<Badge
							variant="outline"
							class="border-border/50 bg-surface/40 text-foreground/80 text-xs tracking-[0.35em] uppercase backdrop-blur-sm"
						>
							{slides[activeIndex].tag}
						</Badge>
						<span class="text-foreground/70 text-xs sm:text-sm">{slides[activeIndex].subtitle}</span
						>
					</div>
					<div class="space-y-4">
						<h1 class="text-3xl leading-tight font-semibold sm:text-4xl lg:text-5xl">
							{slides[activeIndex].title}
						</h1>
						<p class="text-foreground/80 max-w-2xl text-sm leading-relaxed sm:text-base">
							{slides[activeIndex].description}
						</p>
					</div>
					<div class="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
						{#each slides[activeIndex].ctas as cta}
							<Button
								variant={cta.variant ?? 'default'}
								class={`${
									cta.variant === 'outline'
										? 'border-border/60 text-foreground hover:bg-surface/40 bg-transparent'
										: 'bg-card text-card-foreground hover:bg-card/90'
								} w-full sm:w-auto`}
							>
								{cta.label}
							</Button>
						{/each}
					</div>
				</div>

				<div
					class="border-border/40 bg-surface/60 text-foreground/80 grid gap-4 rounded-3xl border p-6 backdrop-blur"
				>
					<div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
						{#each slides[activeIndex].stats as stat}
							<div class="border-border/30 bg-surface/40 rounded-2xl border px-4 py-3 text-center">
								<p class="text-muted-foreground text-[11px] tracking-[0.3em] uppercase">
									{stat.label}
								</p>
								<p class="mt-1 text-lg font-semibold">{stat.value}</p>
							</div>
						{/each}
					</div>
				</div>
			</div>

			<aside class="border-border/40 relative hidden h-full flex-col gap-4 border-l p-6 lg:flex">
				<div class="text-foreground/80 flex items-center justify-between">
					<p class="text-xs tracking-[0.35em] uppercase">Now trending</p>
					<div class="flex gap-2">
						<button
							class="border-border/50 text-muted-foreground hover:border-border/60 hover:text-foreground focus-visible:ring-primary/40 h-10 w-10 rounded-full border transition focus-visible:ring-2 focus-visible:outline-none"
							type="button"
							onclick={() => step(-1)}
							aria-label="Previous slide"
						>
							<ChevronLeft class="h-4 w-4" />
						</button>
						<button
							class="border-border/50 text-muted-foreground hover:border-border/60 hover:text-foreground focus-visible:ring-primary/40 h-10 w-10 rounded-full border transition focus-visible:ring-2 focus-visible:outline-none"
							type="button"
							onclick={() => step(1)}
							aria-label="Next slide"
						>
							<ChevronRight class="h-4 w-4" />
						</button>
					</div>
				</div>
				<div class="marketplace-scrollbar flex-1 space-y-3 overflow-y-auto pr-1">
					{#each slides as slide, index}
						<button
							type="button"
							class={`w-full rounded-2xl border px-4 py-3 text-left transition ${
								index === activeIndex
									? 'border-border/50 bg-surface/40 text-foreground shadow-marketplace-sm'
									: 'bg-surface/30 text-muted-foreground hover:border-border/40 hover:text-foreground border-transparent'
							}`}
							onclick={() => goTo(index)}
						>
							<p class="text-[11px] tracking-[0.3em] uppercase">{slide.tag}</p>
							<p class="mt-2 text-sm font-semibold">{slide.title}</p>
							<p class="text-muted-foreground text-xs">{slide.subtitle}</p>
						</button>
					{/each}
				</div>
				<div class="flex items-center justify-center gap-2">
					{#each slides as _, index}
						<span
							class={`h-1.5 rounded-full transition-all ${
								index === activeIndex ? 'bg-foreground w-8' : 'bg-foreground/40 w-3'
							}`}
						/>
					{/each}
				</div>
			</aside>

			<div
				class="absolute inset-x-0 bottom-0 flex items-center justify-between gap-2 p-5 lg:hidden"
			>
				<button
					class="border-border/50 text-muted-foreground hover:border-border/60 hover:text-foreground focus-visible:ring-primary/40 h-10 w-10 rounded-full border transition focus-visible:ring-2 focus-visible:outline-none"
					type="button"
					onclick={() => step(-1)}
					aria-label="Previous slide"
				>
					<ChevronLeft class="h-4 w-4" />
				</button>
				<div class="flex flex-1 justify-center gap-2">
					{#each slides as _, index}
						<span
							class={`h-1.5 rounded-full transition-all ${
								index === activeIndex ? 'bg-foreground w-8' : 'bg-foreground/40 w-3'
							}`}
						/>
					{/each}
				</div>
				<button
					class="border-border/50 text-muted-foreground hover:border-border/60 hover:text-foreground focus-visible:ring-primary/40 h-10 w-10 rounded-full border transition focus-visible:ring-2 focus-visible:outline-none"
					type="button"
					onclick={() => step(1)}
					aria-label="Next slide"
				>
					<ChevronRight class="h-4 w-4" />
				</button>
			</div>
		</div>
	</section>
{/if}
