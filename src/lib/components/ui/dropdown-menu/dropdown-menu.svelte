<script lang="ts">
	import { cn } from '$lib/utils';
	import { writable } from 'svelte/store';
	import { initDropdownContext } from './context';

	let {
		open = false,
		class: className = '',
		onOpenChange
	}: { open?: boolean; class?: string; onOpenChange?: (open: boolean) => void } = $props();

	const internal = writable(open);

	$effect(() => {
		internal.set(open);
	});

	function setOpen(next: boolean) {
		internal.set(next);
		onOpenChange?.(next);
	}

	initDropdownContext({ open: internal, setOpen });
</script>

<div class={cn('relative inline-block text-left', className)}>
	<slot />
</div>
