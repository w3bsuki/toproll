<script lang="ts">
	import { onMount } from 'svelte';
	import { Gamepad2, Loader2, Shield } from 'lucide-svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import MicroInteractions from './MicroInteractions.svelte';

	interface AuthButtonProps extends HTMLAttributes<HTMLButtonElement> {
		loading?: boolean;
		disabled?: boolean;
		children?: Snippet;
		type?: 'button' | 'submit' | 'reset';
		variant?: 'primary' | 'secondary' | 'steam';
		size?: 'sm' | 'md' | 'lg';
		withRipple?: boolean;
	}

	let {
		loading = false,
		disabled,
		children,
		class: className,
		type = 'button',
		variant = 'primary',
		size = 'md',
		withRipple = true,
		...restProps
	}: AuthButtonProps = $props();

	// Button element reference for micro-interactions
	let buttonElement: HTMLButtonElement;

	// Enhanced disabled state
	const isDisabled = $derived(loading || disabled);

	// Variant classes for different button styles
	const variantClasses = {
		primary: 'btn-primary',
		secondary: 'btn-secondary',
		steam:
			'bg-gradient-to-r from-[#1b2838] via-[#2a475e] to-[#c7d5e0] text-white border-0 hover:from-[#2a475e] hover:via-[#c7d5e0] hover:to-[#1b2838]'
	};

	const sizeClasses = {
		sm: 'btn-sm text-sm px-4',
		md: 'btn-md text-base px-6',
		lg: 'btn-lg text-lg px-8'
	};

	// Haptic feedback for interactions
	function triggerHaptic(intensity: 'light' | 'medium' | 'heavy' = 'light') {
		if ('vibrate' in navigator) {
			const patterns = { light: 10, medium: 50, heavy: 100 };
			navigator.vibrate(patterns[intensity]);
		}
	}

	// Handle button interactions
	function handleClick(event: MouseEvent) {
		if (!isDisabled) {
			triggerHaptic('medium');
			// Call original onclick if provided
			if (restProps.onclick) {
				restProps.onclick(event);
			}
		}
	}

	onMount(() => {
		// Add additional gaming-themed classes
		if (buttonElement) {
			buttonElement.classList.add('gaming-button', 'relative', 'overflow-hidden');
		}
	});
</script>

<button
	bind:this={buttonElement}
	class="btn {variantClasses[variant]} {sizeClasses[size]} {className || ''}
		group relative overflow-hidden transition-all duration-300 ease-out
		{loading ? 'cursor-wait' : ''}
		{isDisabled ? 'cursor-not-allowed opacity-60' : 'hover:scale-[1.02] hover:shadow-xl'}"
	disabled={isDisabled}
	{type}
	onclick={handleClick}
	{...restProps}
>
	<!-- Ripple Effect Component -->
	{#if withRipple && !isDisabled}
		<MicroInteractions type="ripple" trigger="click" element={buttonElement} />
	{/if}

	<!-- Button Content -->
	<div class="relative z-10 flex items-center gap-3">
		{#if loading}
			<!-- Enhanced Loading State -->
			<div class="relative">
				<Loader2 class="h-5 w-5 animate-spin text-current" />
				<div
					class="absolute inset-0 h-5 w-5 animate-ping rounded-full border-2 border-current opacity-20"
				></div>
			</div>
		{:else if variant === 'steam'}
			<!-- Steam Icon for Steam Auth -->
			<Gamepad2 class="h-5 w-5" />
		{:else}
			<!-- Security Icon for Other Auth -->
			<Shield class="h-4 w-4 transition-transform group-hover:scale-110" />
		{/if}

		<!-- Button Text -->
		<span class="font-semibold">
			{#if loading}
				<span class="animate-pulse">
					{variant === 'steam' ? 'Connecting to Steam...' : 'Authenticating...'}
				</span>
			{:else}
				{@render children?.()}
			{/if}
		</span>

		<!-- Success/Loading Indicator -->
		{#if !loading && !isDisabled}
			<div
				class="pointer-events-none absolute inset-0 rounded-[inherit] bg-success/20 opacity-0 transition-opacity group-hover:opacity-100"
			></div>
		{/if}
	</div>

	<!-- Gaming Glow Effect -->
	{#if !isDisabled && !loading}
		<div
			class="pointer-events-none absolute -inset-px rounded-[inherit] bg-gradient-to-r from-primary/50 via-accent/50 to-secondary/50 opacity-0 blur-sm transition-opacity group-hover:opacity-100"
		></div>
	{/if}

	<!-- Loading Progress Bar -->
	{#if loading}
		<div
			class="absolute right-0 bottom-0 left-0 h-1 overflow-hidden rounded-b-[inherit] bg-base-300"
		>
			<div class="h-full animate-pulse bg-gradient-to-r from-primary via-accent to-secondary"></div>
		</div>
	{/if}
</button>

<style>
	.gaming-button {
		box-shadow:
			0 4px 8px -2px rgb(from var(--color-primary) r g b / 0.1),
			0 2px 4px -2px rgb(from var(--color-primary) r g b / 0.06);
	}

	.gaming-button:hover:not(:disabled) {
		box-shadow:
			0 12px 24px -4px rgb(from var(--color-primary) r g b / 0.25),
			0 8px 16px -4px rgb(from var(--color-primary) r g b / 0.1);
	}

	.gaming-button:active:not(:disabled) {
		transform: scale(0.98);
	}

	.gaming-button:focus-visible {
		outline: 2px solid var(--color-primary);
		outline-offset: 2px;
	}

	/* Steam-specific styling */
	.btn.bg-gradient-to-r.from-\[1b2838\] {
		position: relative;
		overflow: hidden;
	}

	.btn.bg-gradient-to-r.from-\[1b2838\]:before {
		content: '';
		position: absolute;
		inset: 0;
		background: linear-gradient(
			45deg,
			transparent 30%,
			rgba(255, 255, 255, 0.1) 50%,
			transparent 70%
		);
		transform: translateX(-100%);
		transition: transform 0.6s;
	}

	.btn.bg-gradient-to-r.from-\[1b2838\]:hover:before {
		transform: translateX(100%);
	}

	/* Accessibility improvements */
	@media (prefers-reduced-motion: reduce) {
		.gaming-button {
			transition: none !important;
		}

		.gaming-button:hover {
			transform: none !important;
		}
	}

	/* Touch device optimizations */
	@media (hover: none) and (pointer: coarse) {
		.gaming-button:hover {
			transform: none;
			box-shadow:
				0 4px 8px -2px rgb(from var(--color-primary) r g b / 0.1),
				0 2px 4px -2px rgb(from var(--color-primary) r g b / 0.06);
		}

		.gaming-button:active {
			transform: scale(0.95);
			box-shadow: 0 12px 24px -4px rgb(from var(--color-primary) r g b / 0.25);
		}
	}
</style>
