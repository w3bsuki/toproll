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
			class="flex transition-transform duration-500 ease-in-out h-full"
			style="transform: translateX(-{currentIndex * 100}%)"
		>
                        {#each slides as slide, index}
                                {@const SlideIcon = slide.icon}
                                <div
                                        class="w-full flex-shrink-0"
                                        style="background: {slide.background}"
                                >
                                        <div class="relative p-6 min-h-[180px] flex flex-col justify-between">
                                                <!-- Glass effect -->
                                                <div class="absolute inset-0 bg-white/10 backdrop-blur-sm rounded-2xl"></div>

						<div class="relative space-y-4">
							<!-- Badge -->
							<div class="inline-flex">
								<span class="border-white/30 bg-white/20 text-white text-[10px] tracking-wider uppercase rounded-lg border px-3 py-1 font-semibold backdrop-blur-sm">
									{slide.badge}
								</span>
							</div>

							<!-- Title and subtitle -->
							<div class="space-y-2">
								<h3 class="text-2xl font-bold text-white leading-tight">
									{slide.title}
								</h3>
								<p class="text-white/90 text-sm leading-relaxed">
									{slide.subtitle}
								</p>
							</div>

							<!-- CTA section -->
							<div class="flex items-center justify-between gap-4">
                                                                <div class="flex items-center gap-2">
                                                                        <SlideIcon class="h-5 w-5 text-white/90" />
                                                                        <span class="text-white font-semibold text-sm">
                                                                                {slide.highlight}
									</span>
								</div>
								<button
									class="bg-white text-gray-900 hover:bg-white/90 font-semibold rounded-lg px-4 py-2 text-sm shadow-lg transition-colors"
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
			class="absolute left-4 top-1/2 -translate-y-1/2 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-gray-900 shadow-lg hover:bg-white transition-all duration-200"
			aria-label="Previous slide"
		>
			<ChevronLeft class="h-5 w-5" />
		</button>

		<button
			type="button"
			onclick={nextSlide}
			onmouseenter={stopAutoplay}
			onmouseleave={startAutoplay}
			class="absolute right-4 top-1/2 -translate-y-1/2 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-gray-900 shadow-lg hover:bg-white transition-all duration-200"
			aria-label="Next slide"
		>
			<ChevronRight class="h-5 w-5" />
		</button>

		<!-- Dots indicator -->
		<div class="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 z-10">
			{#each slides as _, index}
				<button
					type="button"
					onclick={() => goToSlide(index)}
					class="h-2 rounded-full transition-all duration-300 {index === currentIndex ? 'bg-white w-8' : 'bg-white/40 hover:bg-white/60 w-2'}"
					aria-label={`Go to slide ${index + 1}`}
				></button>
			{/each}
		</div>
	</div>
</div>