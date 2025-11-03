<script lang="ts">
	import { cn } from '$lib/utils';
	import { writable } from 'svelte/store';
	import { initTabsContext } from './context';
	import type { Snippet } from 'svelte';

	let {
		value = $bindable(''),
		class: className = '',
		onValueChange,
		children
	}: {
		value?: string;
		class?: string;
		onValueChange?: (value: string) => void;
		children?: Snippet;
	} = $props();

	const internal = writable(value);

	$effect(() => {
		internal.set(value);
	});

	function setValue(next: string) {
		value = next;
		internal.set(next);
		onValueChange?.(next);
	}

	initTabsContext({ value: internal, setValue });
</script>

<div class={cn('grid gap-4', className)}>
	{@render children?.()}
</div>

