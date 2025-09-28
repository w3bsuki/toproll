<script lang="ts">
	import { onMount } from 'svelte';
	import { spring } from 'svelte/motion';

	interface Props {
		type?: 'ripple' | 'pulse' | 'shake' | 'glow' | 'float' | 'rotate';
		trigger?: 'hover' | 'click' | 'focus' | 'always';
		intensity?: 'subtle' | 'normal' | 'strong';
		element?: HTMLElement | null;
		children?: any;
	}

	let {
		type = 'ripple',
		trigger = 'click',
		intensity = 'normal',
		element = null,
		children
	}: Props = $props();

	let isActive = $state(false);
	let ripples = $state<{ id: number; x: number; y: number }[]>([]);
	let rippleId = 0;

	// Spring animation for smooth micro-interactions
	const scale = spring(1, { stiffness: 0.3, damping: 0.8 });
	const rotation = spring(0, { stiffness: 0.2, damping: 0.6 });

	// Haptic feedback function
	function triggerHaptic(type: 'light' | 'medium' | 'heavy' = 'light') {
		if ('vibrate' in navigator) {
			const patterns = {
				light: 10,
				medium: 50,
				heavy: 100
			};
			navigator.vibrate(patterns[type]);
		}
	}

	// Ripple effect for buttons and cards
	function createRipple(event: MouseEvent | TouchEvent) {
		if (!element) return;

		const rect = element.getBoundingClientRect();
		const size = Math.max(rect.width, rect.height);

		let x, y;
		if (event instanceof MouseEvent) {
			x = event.clientX - rect.left - size / 2;
			y = event.clientY - rect.top - size / 2;
		} else {
			// Touch event
			const touch = event.touches[0] || event.changedTouches[0];
			x = touch.clientX - rect.left - size / 2;
			y = touch.clientY - rect.top - size / 2;
		}

		const newRipple = { id: rippleId++, x, y };
		ripples = [...ripples, newRipple];

		// Remove ripple after animation
		setTimeout(() => {
			ripples = ripples.filter((r) => r.id !== newRipple.id);
		}, 600);

		triggerHaptic('light');
	}

	// Enhanced button press effect
	function handlePress() {
		scale.set(0.95);
		triggerHaptic('medium');
		setTimeout(() => scale.set(1), 150);
	}

	// Smooth hover effects
	function handleHover(enter: boolean) {
		if (type === 'glow' || type === 'float') {
			isActive = enter;
		}
		if (type === 'pulse') {
			scale.set(enter ? 1.05 : 1);
		}
		if (type === 'rotate') {
			rotation.set(enter ? 12 : 0);
		}
	}

	// Set up event listeners based on trigger type
	onMount(() => {
		if (!element) return;

		const events: { [key: string]: (e: Event) => void } = {};

		if (trigger === 'click' && type === 'ripple') {
			events.click = createRipple as (e: Event) => void;
			events.touchstart = createRipple as (e: Event) => void;
		}

		if (trigger === 'click' && type === 'pulse') {
			events.mousedown = handlePress;
			events.touchstart = handlePress;
		}

		if (trigger === 'hover') {
			events.mouseenter = () => handleHover(true);
			events.mouseleave = () => handleHover(false);
		}

		if (trigger === 'focus') {
			events.focus = () => handleHover(true);
			events.blur = () => handleHover(false);
		}

		// Add event listeners
		Object.entries(events).forEach(([event, handler]) => {
			element?.addEventListener(event, handler);
		});

		// Cleanup
		return () => {
			Object.entries(events).forEach(([event, handler]) => {
				element?.removeEventListener(event, handler);
			});
		};
	});
</script>

<!-- Ripple Effect Overlay -->
{#if type === 'ripple' && ripples.length > 0}
	<div class="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]">
		{#each ripples as ripple (ripple.id)}
			<div
				class="animate-ripple absolute rounded-full bg-primary/30"
				style="
					left: {ripple.x}px;
					top: {ripple.y}px;
					width: {Math.max(element?.offsetWidth || 0, element?.offsetHeight || 0)}px;
					height: {Math.max(element?.offsetWidth || 0, element?.offsetHeight || 0)}px;
				"
			></div>
		{/each}
	</div>
{/if}

<!-- Glow Effect -->
{#if type === 'glow' && isActive}
	<div
		class="pointer-events-none absolute -inset-1 animate-pulse rounded-[inherit] bg-gradient-to-r from-primary/50 via-accent/50 to-secondary/50 opacity-75 blur-sm"
	></div>
{/if}

<!-- Float Effect -->
{#if type === 'float'}
	<div class="transition-transform duration-300 ease-out" class:float-up={isActive}>
		{@render children?.()}
	</div>
{/if}

<!-- Scale Effect -->
{#if type === 'pulse'}
	<div style="transform: scale({$scale})">
		{@render children?.()}
	</div>
{/if}

<!-- Rotation Effect -->
{#if type === 'rotate'}
	<div style="transform: rotate({$rotation}deg)">
		{@render children?.()}
	</div>
{/if}

<!-- Shake Effect -->
{#if type === 'shake'}
	<div class="shake-animation">
		{@render children?.()}
	</div>
{/if}

<style>
	@keyframes ripple {
		0% {
			transform: scale(0);
			opacity: 0.6;
		}
		100% {
			transform: scale(2);
			opacity: 0;
		}
	}

	.animate-ripple {
		animation: ripple 0.6s cubic-bezier(0.4, 0, 0.2, 1);
	}

	.float-up {
		transform: translateY(-4px);
	}

	@keyframes shake {
		0%,
		100% {
			transform: translateX(0);
		}
		25% {
			transform: translateX(-4px);
		}
		75% {
			transform: translateX(4px);
		}
	}

	.shake-animation {
		animation: shake 0.5s ease-in-out;
	}

	/* Enhanced button states for gaming theme */
	.gaming-button {
		position: relative;
		overflow: hidden;
		transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
	}

	.gaming-button:hover {
		box-shadow:
			0 0 20px rgb(from var(--color-primary) r g b / 0.4),
			0 8px 25px -5px rgb(from var(--color-primary) r g b / 0.2);
	}

	.gaming-button:active {
		transform: scale(0.98);
	}

	/* Custom focus states for accessibility */
	.gaming-button:focus-visible {
		outline: 2px solid var(--color-primary);
		outline-offset: 2px;
		box-shadow:
			0 0 0 4px rgb(from var(--color-primary) r g b / 0.1),
			0 0 20px rgb(from var(--color-primary) r g b / 0.4);
	}

	/* Loading state animations */
	@keyframes gaming-pulse {
		0%,
		100% {
			opacity: 1;
			transform: scale(1);
		}
		50% {
			opacity: 0.7;
			transform: scale(1.02);
		}
	}

	.gaming-pulse {
		animation: gaming-pulse 2s ease-in-out infinite;
	}

	/* Success/Error feedback animations */
	@keyframes success-flash {
		0% {
			background-color: var(--color-success);
		}
		100% {
			background-color: transparent;
		}
	}

	@keyframes error-flash {
		0% {
			background-color: var(--color-error);
		}
		100% {
			background-color: transparent;
		}
	}

	.success-flash {
		animation: success-flash 0.3s ease-out;
	}

	.error-flash {
		animation: error-flash 0.3s ease-out;
	}

	/* Responsive hover effects */
	@media (hover: none) and (pointer: coarse) {
		.gaming-button:hover {
			box-shadow: none;
		}

		.gaming-button:active {
			transform: scale(0.95);
			box-shadow: 0 0 20px rgb(from var(--color-primary) r g b / 0.4);
		}
	}

	/* Reduce motion for accessibility */
	@media (prefers-reduced-motion: reduce) {
		.animate-ripple,
		.float-up,
		.shake-animation,
		.gaming-pulse {
			animation: none !important;
		}

		.gaming-button {
			transition: none !important;
		}
	}
</style>
