<script lang="ts">
	import { Gift, Users, Zap, ChevronLeft, ChevronRight } from '@lucide/svelte';

	let currentIndex = $state(0);
	let interval: ReturnType<typeof setInterval>;

	const slides = [
		{
			id: 'rain-pot',
			title: 'Rain Pot Active',
			subtitle: '312 contributors · 08:19 remaining',
			badge: 'Live',
			highlight: '$12,400 pool',
			cta: 'Join Rain Pot',
			icon: Gift,
			background: 'linear-gradient(135deg, #10b981 0%, #2dd4bf 100%)'
		},
		{
			id: 'skin-giveaway',
			title: '★ Karambit | Fade Giveaway',
			subtitle: 'Premium knife giveaway · 50 slots remaining',
			badge: 'Giveaway',
			highlight: 'Free Entry',
			cta: 'Enter Now',
			icon: Users,
			background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)'
		},
		{
			id: 'flash-rain',
			title: 'Flash Rain Boost',
			subtitle: 'Limited time · 6 slots left · 2x multiplier',
			badge: 'Flash',
			highlight: '2x Multiplier',
			cta: 'Secure Slot',
			icon: Zap,
			background: 'linear-gradient(135deg, #22c55e 0%, #10b981 100%)'
		}
	];

	function nextSlide() {
		currentIndex = (currentIndex + 1) % slides.length;
	}

	function prevSlide() {
		currentIndex = (currentIndex - 1 + slides.length) % slides.length;
	}

	function goToSlide(index: number) {
		currentIndex = index;
	}

	function startAutoplay() {
		stopAutoplay();
		interval = setInterval(nextSlide, 4000);
	}

	function stopAutoplay() {
		if (interval) clearInterval(interval);
	}

	$effect(() => {
		startAutoplay();
		return stopAutoplay;
	});
</script>

<div class="relative w-full">
	<div class="relative overflow-hidden rounded-2xl">
		<!-- Main container -->
		<div
			class="flex h-full transition-transform duration-500 ease-in-out"
			style="transform: translateX(-{currentIndex * 100}%)"
		>
			{#each slides as slide, index}
				{@const SlideIcon = slide.icon}
				<div class="w-full flex-shrink-0" style="background: {slide.background}">
					<div class="relative flex min-h-[180px] flex-col justify-between p-6">
						<!-- Glass effect -->
						<div class="absolute inset-0 rounded-2xl bg-white/10 backdrop-blur-sm"></div>

						<div class="relative space-y-4">
							<!-- Badge -->
							<div class="inline-flex">
								<span
									class="rounded-lg border border-white/30 bg-white/20 px-3 py-1 text-[10px] font-semibold tracking-wider text-white uppercase backdrop-blur-sm"
								>
									{slide.badge}
								</span>
							</div>

							<!-- Title and subtitle -->
							<div class="space-y-2">
								<h3 class="text-2xl leading-tight font-bold text-white">
									{slide.title}
								</h3>
								<p class="text-sm leading-relaxed text-white/90">
									{slide.subtitle}
								</p>
							</div>

							<!-- CTA section -->
							<div class="flex items-center justify-between gap-4">
								<div class="flex items-center gap-2">
									<SlideIcon class="h-5 w-5 text-white/90" />
									<span class="text-sm font-semibold text-white">
										{slide.highlight}
									</span>
								</div>
								<button
									class="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-gray-900 shadow-lg transition-colors hover:bg-white/90"
								>
									{slide.cta}
								</button>
							</div>
						</div>
					</div>
				</div>
			{/each}
		</div>

		<!-- Navigation buttons -->
		<button
			type="button"
			onclick={prevSlide}
			onmouseenter={stopAutoplay}
			onmouseleave={startAutoplay}
			class="absolute top-1/2 left-4 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-gray-900 shadow-lg transition-all duration-200 hover:bg-white"
			aria-label="Previous slide"
		>
			<ChevronLeft class="h-5 w-5" />
		</button>

		<button
			type="button"
			onclick={nextSlide}
			onmouseenter={stopAutoplay}
			onmouseleave={startAutoplay}
			class="absolute top-1/2 right-4 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-gray-900 shadow-lg transition-all duration-200 hover:bg-white"
			aria-label="Next slide"
		>
			<ChevronRight class="h-5 w-5" />
		</button>

		<!-- Dots indicator -->
		<div class="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2">
			{#each slides as _, index}
				<button
					type="button"
					onclick={() => goToSlide(index)}
					class="h-2 rounded-full transition-all duration-300 {index === currentIndex
						? 'w-8 bg-white'
						: 'w-2 bg-white/40 hover:bg-white/60'}"
					aria-label={`Go to slide ${index + 1}`}
				></button>
			{/each}
		</div>
	</div>
</div>
