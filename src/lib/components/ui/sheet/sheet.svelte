<script lang="ts">
	import { cn } from '$lib/utils';
	import { writable } from 'svelte/store';
	import { initSheetContext } from './context';
	import type { Snippet } from 'svelte';

	let {
		open = false,
		class: className = '',
		onOpenChange,
		children
	}: {
		open?: boolean;
		class?: string;
		onOpenChange?: (open: boolean) => void;
		children?: Snippet;
	} = $props();

	const internal = writable(open);

	$effect(() => {
		internal.set(open);
	});

	function setOpen(next: boolean) {
		internal.set(next);
		onOpenChange?.(next);
	}

	initSheetContext({
		open: internal,
		close: () => setOpen(false),
		openSheet: () => setOpen(true)
	});
</script>

<div class={cn(className)}>
	{@render children?.()}
</div>
