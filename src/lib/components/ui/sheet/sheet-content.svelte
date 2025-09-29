<script lang="ts">
	import { cn } from '$lib/utils';
	import { useSheetContext } from './context';
	import { derived } from 'svelte/store';
	import { onDestroy, tick } from 'svelte';

	type SheetSide = 'left' | 'right' | 'bottom';

	let {
		side = 'right' as SheetSide,
		class: className = '',
		labelledby
	}: { side?: SheetSide; class?: string; labelledby?: string } = $props();

	const { open, close } = useSheetContext();
	const visible = derived(open, ($open) => $open);

	let contentEl: HTMLDivElement | null = null;
	let previouslyFocused: HTMLElement | null = null;

	const focusableSelectors =
		'a[href], button:not([disabled]), textarea:not([disabled]), input:not([type="hidden"]):not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

	const getFocusableElements = () => {
		if (!contentEl) return [] as HTMLElement[];
		return Array.from(contentEl.querySelectorAll<HTMLElement>(focusableSelectors)).filter(
			(element) => !element.hasAttribute('aria-hidden') && !element.closest('[aria-hidden="true"]')
		);
	};

	const trapFocus = (event: KeyboardEvent) => {
		if (event.key !== 'Tab') return;

		const focusable = getFocusableElements();
		if (focusable.length === 0) {
			event.preventDefault();
			return;
		}

		const first = focusable[0];
		const last = focusable[focusable.length - 1];
		const active = document.activeElement as HTMLElement | null;

		if (event.shiftKey) {
			if (active === first || !active) {
				event.preventDefault();
				last.focus();
			}
			return;
		}

		if (active === last) {
			event.preventDefault();
			first.focus();
		}
	};

	const handleKeydown = (event: KeyboardEvent) => {
		if (event.key === 'Escape') {
			event.preventDefault();
			close();
			return;
		}

		trapFocus(event);
	};

	const visibleUnsubscribe = visible.subscribe(async ($visible) => {
		if ($visible) {
			previouslyFocused =
				document.activeElement instanceof HTMLElement ? document.activeElement : null;
			await tick();
			const focusable = getFocusableElements();
			if (focusable.length) {
				focusable[0].focus();
			} else if (contentEl) {
				contentEl.focus();
			}
		} else if (previouslyFocused) {
			previouslyFocused.focus();
			previouslyFocused = null;
		}
	});

	onDestroy(() => {
		visibleUnsubscribe();
	});

	const sideClasses: Record<SheetSide, string> = {
		left: 'inset-y-0 left-0 w-full max-w-md',
		right: 'inset-y-0 right-0 w-full max-w-md',
		bottom: 'inset-x-0 bottom-0 w-full rounded-t-xl'
	};
</script>

{#if $visible}
	<div class="fixed inset-0 z-40 flex" role="dialog" aria-modal="true" aria-labelledby={labelledby}>
		<div
			class="absolute inset-0 bg-black/60 backdrop-blur-sm"
			aria-hidden="true"
			onclick={() => close()}
		></div>
		<div
			class={cn(
				'bg-surface text-surface-foreground shadow-marketplace-lg border-border/60 relative z-10 border',
				side === 'bottom' ? 'mx-auto max-h-[90vh] overflow-y-auto' : 'h-full overflow-y-auto',
				sideClasses[side],
				className
			)}
			tabindex="-1"
			bind:this={contentEl}
			on:keydown={handleKeydown}
		>
			<slot />
		</div>
	</div>
{/if}
