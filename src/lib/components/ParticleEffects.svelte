<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';

	let { trigger = false, color = '#ffd700', intensity = 'medium' }: {
		trigger: boolean,
		color: string,
		intensity: 'low' | 'medium' | 'high'
	} = $props();

	let containerRef: HTMLDivElement;
	let gsap = $state<any>(null);

	function createParticle(x: number, y: number, particleColor: string = color) {
		if (!containerRef) return;

		const particle = document.createElement('div');
		particle.className = 'absolute w-1.5 h-1.5 rounded-full pointer-events-none';
		particle.style.backgroundColor = particleColor;
		particle.style.left = `${x}px`;
		particle.style.top = `${y}px`;
		particle.style.boxShadow = `0 0 4px ${particleColor}`;

		containerRef.appendChild(particle);

		// Physics-based movement
		const angle = Math.random() * Math.PI * 2;
		const velocity = 40 + Math.random() * 60;
		const gravity = 20;

		const endX = x + Math.cos(angle) * velocity;
		const endY = y + Math.sin(angle) * velocity + gravity;

		// Realistic particle animation
		if (gsap) {
			gsap.to(particle, {
				x: endX - x,
				y: endY - y,
				scale: 0,
				opacity: 0,
				duration: 0.6 + Math.random() * 0.4,
				ease: 'power2.out',
				onComplete: () => particle.remove()
			});
		}
	}

	function createBurst() {
		if (!containerRef) return;

		const rect = containerRef.getBoundingClientRect();
		const centerX = rect.width / 2;
		const centerY = rect.height / 2;

		const particleCount = intensity === 'low' ? 12 : intensity === 'medium' ? 25 : 40;

		// Staggered particle creation
		for (let i = 0; i < particleCount; i++) {
			setTimeout(() => {
				const offsetX = (Math.random() - 0.5) * 30;
				const offsetY = (Math.random() - 0.5) * 30;
				createParticle(centerX + offsetX, centerY + offsetY);
			}, i * 15);
		}
	}

	function createConfetti() {
		if (!containerRef) return;

		const rect = containerRef.getBoundingClientRect();
		const colors = ['#ffd700', '#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', '#f0932b'];

		for (let i = 0; i < 15; i++) {
			setTimeout(() => {
				const confetti = document.createElement('div');
				confetti.className = 'absolute w-2 h-4 pointer-events-none rounded-sm';
				confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
				confetti.style.left = `${Math.random() * rect.width}px`;
				confetti.style.top = '-8px';

				containerRef?.appendChild(confetti);

				if (gsap) {
					gsap.to(confetti, {
						y: rect.height + 20,
						rotation: 360 + Math.random() * 720,
						x: (Math.random() - 0.5) * 150,
						duration: 1.5 + Math.random() * 1.5,
						ease: 'power2.out',
						onComplete: () => confetti.remove()
					});
				}
			}, i * 80);
		}
	}

	onMount(async () => {
		if (browser) {
			try {
				const gsapModule = await import('gsap');
				gsap = gsapModule.gsap;
			} catch (error) {
				console.error('Failed to load GSAP:', error);
			}
		}
	});

	$effect(() => {
		if (trigger && gsap) {
			createBurst();
			setTimeout(createConfetti, 400);
		}
	});
</script>

<div bind:this={containerRef} class="pointer-events-none absolute inset-0 overflow-hidden"></div>
