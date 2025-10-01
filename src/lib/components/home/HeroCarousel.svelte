<script lang="ts">
	import { onMount } from 'svelte';
	import { heroPromotions } from '$lib/stores/homepage';
	import { Button, Badge } from '$lib/components/ui';
	import { cn } from '$lib/utils';
	import { ChevronLeft, ChevronRight } from 'lucide-svelte';

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
		class="border-border/60 bg-surface-raised/80 shadow-elevated-lg relative overflow-hidden rounded-2xl border"
	>
		<div
			class="gap-xl relative grid min-h-[420px] overflow-hidden lg:grid-cols-[1.2fr,0.8fr]"
			style={`background:${slides[activeIndex]?.background ?? 'var(--color-surface)'}`}
		>
			<div class="p-lg sm:p-xl relative flex flex-col justify-between">
				<div class="space-y-lg text-foreground">
					<div class="gap-sm flex flex-wrap items-center">
						<Badge
							variant="outline"
							class="border-border/60 bg-surface-subdued/80 px-sm text-muted-foreground rounded-full py-1 text-xs font-medium tracking-[0.3em] uppercase"
						>
							{slides[activeIndex].tag}
						</Badge>
						<span class="text-muted-foreground text-xs sm:text-sm"
							>{slides[activeIndex].subtitle}</span
						>
					</div>
					<div class="space-y-sm">
						<h1 class="text-3xl leading-tight font-semibold sm:text-4xl lg:text-5xl">
							{slides[activeIndex].title}
						</h1>
						<p class="text-foreground/85 max-w-2xl text-sm leading-relaxed sm:text-base">
							{slides[activeIndex].description}
						</p>
					</div>
					<div class="gap-sm flex flex-col sm:flex-row sm:flex-wrap">
						{#each slides[activeIndex].ctas as cta}
							<Button
								variant={cta.variant ?? 'default'}
								class={cn(
									'w-full sm:w-auto',
									cta.variant === 'outline'
										? 'border-border/60 text-foreground hover:bg-surface-subdued/70 bg-transparent'
										: 'bg-primary text-primary-foreground hover:bg-primary/85'
								)}
							>
								{cta.label}
							</Button>
						{/each}
					</div>
				</div>

				<div
					class="border-border/50 bg-surface-subdued/80 p-md shadow-elevated-sm rounded-xl border"
				>
					<div class="gap-sm grid grid-cols-1 sm:grid-cols-3">
						{#each slides[activeIndex].stats as stat}
							<div class="border-border/40 bg-surface/80 px-sm py-sm rounded-lg border text-center">
								<p class="text-muted-foreground text-[11px] font-medium tracking-[0.3em] uppercase">
									{stat.label}
								</p>
								<p class="mt-xs text-lg font-semibold">{stat.value}</p>
							</div>
						{/each}
					</div>
				</div>
			</div>

			<aside class="gap-md border-border/50 p-lg relative hidden h-full flex-col border-l lg:flex">
				<div
					class="text-muted-foreground flex items-center justify-between text-xs font-medium tracking-[0.3em] uppercase"
				>
					<p>Now trending</p>
					<div class="gap-xs flex">
						<button
							class="border-border/60 text-muted-foreground hover:text-foreground focus-visible:ring-ring focus-visible:ring-offset-background flex h-9 w-9 items-center justify-center rounded-full border transition focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
							type="button"
							onclick={() => step(-1)}
							aria-label="Previous slide"
						>
							<ChevronLeft class="h-4 w-4" />
						</button>
						<button
							class="border-border/60 text-muted-foreground hover:text-foreground focus-visible:ring-ring focus-visible:ring-offset-background flex h-9 w-9 items-center justify-center rounded-full border transition focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
							type="button"
							onclick={() => step(1)}
							aria-label="Next slide"
						>
							<ChevronRight class="h-4 w-4" />
						</button>
					</div>
				</div>
				<div class="scrollbar-elevated space-y-sm flex-1 overflow-y-auto pr-1">
					{#each slides as slide, index}
						<button
							type="button"
							class={cn(
								'px-md py-sm w-full rounded-lg border text-left text-sm transition',
								index === activeIndex
									? 'border-border/60 bg-surface-subdued/80 text-foreground shadow-elevated-sm'
									: 'text-muted-foreground hover:border-border/40 hover:bg-surface-subdued/50 hover:text-foreground border-transparent bg-transparent'
							)}
							onclick={() => goTo(index)}
						>
							<p class="text-muted-foreground text-[11px] tracking-[0.3em] uppercase">
								{slide.tag}
							</p>
							<p class="mt-xs text-foreground font-semibold">{slide.title}</p>
							<p class="text-muted-foreground text-xs">{slide.subtitle}</p>
						</button>
					{/each}
				</div>
				<div class="gap-xs flex items-center justify-center">
					{#each slides as _, index}
						<span
							class={cn(
								'h-1.5 rounded-full transition-all',
								index === activeIndex ? 'bg-foreground w-8' : 'bg-foreground/40 w-3'
							)}
						/>
					{/each}
				</div>
			</aside>

			<div
				class="gap-sm p-md absolute inset-x-0 bottom-0 flex items-center justify-between lg:hidden"
			>
				<button
					class="border-border/60 text-muted-foreground hover:text-foreground focus-visible:ring-ring focus-visible:ring-offset-background flex h-9 w-9 items-center justify-center rounded-full border transition focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
					type="button"
					onclick={() => step(-1)}
					aria-label="Previous slide"
				>
					<ChevronLeft class="h-4 w-4" />
				</button>
				<div class="gap-xs flex flex-1 justify-center">
					{#each slides as _, index}
						<span
							class={cn(
								'h-1.5 rounded-full transition-all',
								index === activeIndex ? 'bg-foreground w-8' : 'bg-foreground/40 w-3'
							)}
						/>
					{/each}
				</div>
				<button
					class="border-border/60 text-muted-foreground hover:text-foreground focus-visible:ring-ring focus-visible:ring-offset-background flex h-9 w-9 items-center justify-center rounded-full border transition focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
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
