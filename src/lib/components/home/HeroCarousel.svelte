<script lang="ts">
	import { onMount } from 'svelte';
	import { heroPromotions } from '$lib/stores/homepage';
	import { Button, Badge } from '$lib/components/ui';
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
                class="border-border/70 bg-surface/70 relative overflow-hidden rounded-[32px] border shadow-[0_28px_120px_rgba(15,23,42,0.35)]"
        >
                <div
                        class="relative grid min-h-[360px] gap-8 overflow-hidden sm:min-h-[400px] lg:min-h-[460px] lg:grid-cols-[1.2fr,0.8fr] xl:min-h-[500px]"
                        style={`background:${slides[activeIndex]?.background ?? 'var(--surface)'}`}
                >
			<div class="relative flex flex-col justify-between p-8 sm:p-12">
				<div class="space-y-6 text-white">
					<div class="flex flex-wrap items-center gap-3">
						<Badge
							variant="outline"
							class="border-white/40 bg-white/10 text-xs tracking-[0.35em] uppercase"
						>
							{slides[activeIndex].tag}
						</Badge>
						<span class="text-xs text-white/70 sm:text-sm">{slides[activeIndex].subtitle}</span>
					</div>
					<div class="space-y-4">
						<h1 class="text-3xl leading-tight font-semibold sm:text-4xl lg:text-5xl">
							{slides[activeIndex].title}
						</h1>
						<p class="max-w-2xl text-sm leading-relaxed text-white/80 sm:text-base">
							{slides[activeIndex].description}
						</p>
					</div>
					<div class="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
						{#each slides[activeIndex].ctas as cta}
							<Button
								variant={cta.variant ?? 'default'}
								class={`${
									cta.variant === 'outline'
										? 'border-white/70 bg-transparent text-white hover:bg-white/10'
										: 'bg-white text-slate-900 hover:bg-white/90'
								} w-full sm:w-auto`}
							>
								{cta.label}
							</Button>
						{/each}
					</div>
				</div>

				<div
					class="grid gap-4 rounded-3xl border border-white/20 bg-black/20 p-6 text-white/80 backdrop-blur"
				>
					<div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
						{#each slides[activeIndex].stats as stat}
							<div class="rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-center">
								<p class="text-[11px] tracking-[0.3em] text-white/60 uppercase">{stat.label}</p>
								<p class="mt-1 text-lg font-semibold">{stat.value}</p>
							</div>
						{/each}
					</div>
				</div>
			</div>

			<aside class="relative hidden h-full flex-col gap-4 border-l border-white/15 p-6 lg:flex">
				<div class="flex items-center justify-between text-white/80">
					<p class="text-xs tracking-[0.35em] uppercase">Now trending</p>
					<div class="flex gap-2">
						<button
							class="h-10 w-10 rounded-full border border-white/30 text-white/70 transition hover:border-white/60 hover:text-white/90 focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:outline-none"
							type="button"
							onclick={() => step(-1)}
							aria-label="Previous slide"
						>
							<ChevronLeft class="h-4 w-4" />
						</button>
						<button
							class="h-10 w-10 rounded-full border border-white/30 text-white/70 transition hover:border-white/60 hover:text-white/90 focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:outline-none"
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
									? 'border-white/40 bg-white/10 text-white shadow-lg'
									: 'border-transparent bg-white/5 text-white/70 hover:border-white/20 hover:text-white'
							}`}
							onclick={() => goTo(index)}
						>
							<p class="text-[11px] tracking-[0.3em] uppercase">{slide.tag}</p>
							<p class="mt-2 text-sm font-semibold">{slide.title}</p>
							<p class="text-xs text-white/60">{slide.subtitle}</p>
						</button>
					{/each}
				</div>
                                <div class="flex items-center justify-center gap-2">
                                        {#each slides as _, index}
                                                <span
                                                        class={`h-1.5 rounded-full transition-all ${
                                                                index === activeIndex ? 'w-8 bg-white' : 'w-3 bg-white/40'
                                                        }`}
                                                ></span>
                                        {/each}
                                </div>
			</aside>

			<div
				class="absolute inset-x-0 bottom-0 flex items-center justify-between gap-2 p-5 lg:hidden"
			>
				<button
					class="h-10 w-10 rounded-full border border-white/30 text-white/70 transition hover:border-white/60 hover:text-white/90 focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:outline-none"
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
                                                                index === activeIndex ? 'w-8 bg-white' : 'w-3 bg-white/40'
                                                        }`}
                                                ></span>
                                        {/each}
                                </div>
				<button
					class="h-10 w-10 rounded-full border border-white/30 text-white/70 transition hover:border-white/60 hover:text-white/90 focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:outline-none"
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
