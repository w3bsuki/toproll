<script lang="ts">
	import { cn } from '$lib/utils';
	import { useSheetContext } from './context';
	import type { Snippet } from 'svelte';

	type SheetSide = 'left' | 'right' | 'bottom';

	const {
		side = 'right',
		class: className = '',
		labelledby,
		children
	} = $props<{
		side?: SheetSide;
		class?: string;
		labelledby?: string;
		children?: Snippet;
	}>();

	const { open, close } = useSheetContext();
	const visible = $derived(open());

	const sideClasses: Record<SheetSide, string> = {
		left: 'inset-y-0 left-0 w-full max-w-md',
		right: 'inset-y-0 right-0 w-full max-w-md',
		bottom: 'inset-x-0 bottom-0 w-full rounded-t-xl'
	};
</script>

{#if visible}
	<div class="fixed inset-0 z-40 flex" role="dialog" aria-modal="true" aria-labelledby={labelledby}>
		<button
			type="button"
			class="absolute inset-0 bg-black/60 backdrop-blur-sm"
			aria-label="Close sheet overlay"
			onclick={() => close()}
		></button>
		<div
			class={cn(
				'bg-surface text-surface-foreground shadow-marketplace-lg border-border/60 relative z-10 border',
				side === 'bottom' ? 'mx-auto max-h-[90vh] overflow-y-auto' : 'h-full overflow-y-auto',
				sideClasses[side],
				className
			)}
		>
			{@render children?.()}
		</div>
	</div>
{/if}
