<script lang="ts">
	import { cn } from '$lib/utils';
	import { initSheetContext } from './context';
	import type { Snippet } from 'svelte';

	const {
		open = false,
		class: className = '',
		onOpenChange,
		children
	} = $props<{
		open?: boolean;
		class?: string;
		onOpenChange?: (open: boolean) => void;
		children?: Snippet;
	}>();

	let isOpen = $state(open);

	$effect(() => {
		isOpen = open;
	});

	const setOpen = (next: boolean) => {
		isOpen = next;
		onOpenChange?.(next);
	};

	initSheetContext({
		open: () => isOpen,
		close: () => setOpen(false),
		openSheet: () => setOpen(true)
	});
</script>

<div class={cn(className)}>
	{@render children?.()}
</div>
