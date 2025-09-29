<script lang="ts">
	import { cn } from '$lib/utils';
	import { initDropdownContext } from './context';
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

	initDropdownContext({ open: () => isOpen, setOpen });
</script>

<div class={cn('relative inline-block text-left', className)}>
	{@render children?.()}
</div>
