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
		class="hero-shell border-border/60 bg-surface-raised/80 shadow-elevated-lg relative overflow-hidden rounded-3xl border"
		style={`--hero-background:${slides[activeIndex]?.background ?? 'radial-gradient(circle at 20% 20%, oklch(var(--color-accent-400)/0.45), transparent 55%), rgba(15,23,42,0.92)'};`}
	>
		<div class="hero-grid">
			<div class="hero-primary">
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
						<h1 class="text-4xl font-semibold sm:text-5xl">
							{slides[activeIndex].title}
						</h1>
						<p class="text-foreground/85 max-w-2xl text-base leading-relaxed">
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
					class="hero-stats border-border/50 bg-surface/70 p-lg shadow-elevated-sm rounded-2xl border backdrop-blur"
				>
					<div
						class="divide-border/60 grid grid-cols-1 divide-y sm:grid-cols-3 sm:divide-x sm:divide-y-0"
					>
						{#each slides[activeIndex].stats as stat}
							<div class="stat-tile">
								<p
									class="text-muted-foreground text-[11px] font-semibold tracking-[0.3em] uppercase"
								>
									{stat.label}
								</p>
								<p class="mt-xs text-foreground text-xl font-semibold">{stat.value}</p>
							</div>
						{/each}
					</div>
				</div>
			</div>

			<aside class="hero-rail">
				<div class="hero-rail__header">
					<p>Now trending</p>
					<div class="flex gap-2">
						<button
							class="hero-rail__control"
							type="button"
							onclick={() => step(-1)}
							aria-label="Previous slide"
						>
							<ChevronLeft class="h-4 w-4" />
						</button>
						<button
							class="hero-rail__control"
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

			<div class="hero-mobile-controls">
				<button
					class="hero-rail__control"
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
					class="hero-rail__control"
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

<style lang="postcss">
	.hero-shell {
		position: relative;
		isolation: isolate;
	}

	.hero-shell::before {
		content: '';
		position: absolute;
		inset: 0;
		background: var(--hero-background);
		z-index: 0;
	}

	.hero-shell::after {
		content: '';
		position: absolute;
		inset: 0;
		border-radius: inherit;
		background:
			radial-gradient(circle at 20% 20%, oklch(var(--color-accent-300) / 0.28), transparent 65%),
			radial-gradient(circle at 80% 30%, oklch(var(--color-accent-500) / 0.22), transparent 60%),
			linear-gradient(
				135deg,
				oklch(var(--color-background) / 0.92),
				oklch(var(--color-background) / 0.35)
			);
		mix-blend-mode: normal;
		pointer-events: none;
	}

	.hero-grid {
		position: relative;
		display: grid;
		min-height: 26rem;
		gap: var(--space-xl);
		padding: var(--space-xl);
		z-index: 1;
	}

	@media (min-width: 1024px) {
		.hero-grid {
			grid-template-columns: 1.25fr 0.75fr;
		}
	}

	.hero-primary {
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		gap: var(--space-xl);
	}

	.hero-stats .stat-tile {
		padding: var(--space-sm) var(--space-md);
		text-align: left;
	}

	@media (min-width: 640px) {
		.hero-stats .stat-tile {
			text-align: center;
		}
	}

	.hero-rail {
		display: none;
	}

	@media (min-width: 1024px) {
		.hero-rail {
			display: flex;
			flex-direction: column;
			gap: var(--space-md);
			padding: var(--space-lg);
			border-left: 1px solid oklch(var(--color-border) / 0.6);
			background: oklch(var(--color-background) / 0.3);
			backdrop-filter: blur(16px);
		}
	}

	.hero-rail__header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		color: oklch(var(--color-muted));
		font-size: var(--font-size-xs);
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.3em;
	}

	.hero-rail__control {
		display: inline-flex;
		height: 2.5rem;
		width: 2.5rem;
		align-items: center;
		justify-content: center;
		border-radius: 999px;
		border: 1px solid oklch(var(--color-border) / 0.6);
		background: oklch(var(--color-surface) / 0.6);
		color: oklch(var(--color-muted));
		transition:
			color var(--duration-default) var(--easing-snappy),
			border-color var(--duration-default) var(--easing-snappy),
			background-color var(--duration-default) var(--easing-snappy);
	}

	.hero-rail__control:hover {
		color: oklch(var(--color-foreground));
		border-color: oklch(var(--color-primary) / 0.5);
	}

	.hero-rail__control:focus-visible {
		outline: 2px solid oklch(var(--color-ring));
		outline-offset: 2px;
	}

	.hero-mobile-controls {
		position: absolute;
		inset-inline: 0;
		bottom: 0;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-sm);
		padding: var(--space-md);
		background: linear-gradient(to top, oklch(var(--color-background) / 0.85), transparent);
	}

	@media (min-width: 1024px) {
		.hero-mobile-controls {
			display: none;
		}
	}
</style>
