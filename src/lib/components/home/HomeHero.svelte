<script lang="ts">
	import { heroPromotions } from '$lib/stores/homepage';
	import { Button, Badge } from '$lib/components/ui';
	import { ChevronLeft, ChevronRight, Flame, Sparkles, Timer } from 'lucide-svelte';
	import { onMount } from 'svelte';

	const promotions = $derived($heroPromotions);
	let activeIndex = $state(0);
	let rotation: ReturnType<typeof setInterval> | null = null;

	function startRotation() {
		stopRotation();
		rotation = setInterval(() => {
			activeIndex = (activeIndex + 1) % promotions.length;
		}, 7000);
	}

	function stopRotation() {
		if (rotation) {
			clearInterval(rotation);
			rotation = null;
		}
	}

	function setActive(index: number) {
		activeIndex = index;
		startRotation();
	}

	onMount(() => {
		startRotation();
		return () => stopRotation();
	});

	const highlightIcon = $derived(() => {
		switch (promotions[activeIndex]?.tag) {
			case 'Battles':
				return Flame;
			case 'Flash drop':
				return Timer;
			default:
				return Sparkles;
		}
	});
</script>

{#if promotions.length}
	<section
		class="border-border/70 bg-surface/80 relative overflow-hidden rounded-3xl border shadow-[0_18px_60px_rgba(15,23,42,0.35)]"
	>
		<div class="grid gap-8 lg:grid-cols-[7fr,5fr]">
			<div
				class="relative flex min-h-[420px] flex-col justify-between p-8 sm:p-10"
				style={`background:${promotions[activeIndex]?.background}`}
			>
				<div class="space-y-6">
					<div class="flex items-center gap-3">
						<Badge
							variant="outline"
							class="border-white/40 bg-white/10 text-xs tracking-[0.35em] uppercase"
						>
							{promotions[activeIndex].tag}
						</Badge>
						<span class="text-xs text-white/70">{promotions[activeIndex].subtitle}</span>
					</div>
					<div class="space-y-3">
						<h1 class="text-4xl leading-tight font-semibold sm:text-5xl">
							{promotions[activeIndex].title}
						</h1>
						<p class="max-w-2xl text-base leading-relaxed text-white/75">
							{promotions[activeIndex].description}
						</p>
					</div>
					<div class="flex flex-wrap items-center gap-3">
						{#each promotions[activeIndex].ctas as cta, ctaIndex}
							<Button
								variant={cta.variant ?? 'default'}
								class={`backdrop-blur-sm ${cta.variant === 'outline' ? 'border-white/60 text-white/80 hover:text-white' : 'bg-white/95 text-slate-900 hover:bg-white'}`}
							>
								{cta.label}
							</Button>
						{/each}
					</div>
				</div>

				<div
					class="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/15 bg-black/20 px-6 py-5 backdrop-blur"
				>
					<div class="flex items-center gap-3 text-white/80">
						<span
							class="flex h-11 w-11 items-center justify-center rounded-xl border border-white/30 bg-white/10"
						>
							<svelte:component this={highlightIcon} class="h-5 w-5" />
						</span>
						<div>
							<p class="text-xs tracking-[0.35em] text-white/60 uppercase">Highlight</p>
							<p class="text-lg font-semibold">{promotions[activeIndex].highlight}</p>
						</div>
					</div>
					<div class="grid flex-1 grid-cols-3 gap-4 text-white/80">
						{#each promotions[activeIndex].stats as stat}
							<div class="rounded-xl border border-white/10 bg-black/10 px-4 py-2 text-center">
								<p class="text-[11px] tracking-[0.3em] text-white/50 uppercase">{stat.label}</p>
								<p class="mt-1 text-base font-semibold">{stat.value}</p>
							</div>
						{/each}
					</div>
				</div>
			</div>

			<aside class="flex flex-col gap-4 border-l border-white/10 p-6">
				<div class="flex items-center justify-between">
					<p class="text-muted-foreground text-sm tracking-[0.3em] uppercase">Now trending</p>
					<div class="flex gap-2">
						<button
							type="button"
							class="border-border/60 text-muted-foreground hover:text-foreground focus-visible:ring-ring/70 duration-subtle ease-market-ease flex h-9 w-9 items-center justify-center rounded-full border transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
							onclick={() => setActive((activeIndex - 1 + promotions.length) % promotions.length)}
							aria-label="Previous promotion"
						>
							<ChevronLeft class="h-4 w-4" />
						</button>
						<button
							type="button"
							class="border-border/60 text-muted-foreground hover:text-foreground focus-visible:ring-ring/70 duration-subtle ease-market-ease flex h-9 w-9 items-center justify-center rounded-full border transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
							onclick={() => setActive((activeIndex + 1) % promotions.length)}
							aria-label="Next promotion"
						>
							<ChevronRight class="h-4 w-4" />
						</button>
					</div>
				</div>

				<div class="marketplace-scrollbar grid flex-1 gap-3 overflow-y-auto pr-1">
					{#each promotions as promo, index}
						<button
							type="button"
							class={`border-border/70 text-left transition-all duration-300 ease-out ${
								index === activeIndex
									? 'bg-surface/80 text-foreground shadow-marketplace-sm border'
									: 'bg-surface-muted/30 text-muted-foreground hover:border-border/60 hover:text-foreground border border-transparent'
							} rounded-2xl p-4`}
							onclick={() => setActive(index)}
						>
							<p class="text-xs tracking-[0.3em] uppercase">{promo.tag}</p>
							<p class="mt-2 text-sm font-semibold">{promo.title}</p>
							<p class="text-muted-foreground mt-2 text-xs leading-relaxed">{promo.description}</p>
						</button>
					{/each}
				</div>

				<div class="flex items-center justify-center gap-2">
					{#each promotions as _, index}
						<span
							class={`h-1.5 rounded-full transition-all ${
								index === activeIndex ? 'bg-primary w-8' : 'bg-border w-3'
							}`}
							aria-hidden="true"
						/>
					{/each}
				</div>
			</aside>
		</div>
	</section>
{/if}
