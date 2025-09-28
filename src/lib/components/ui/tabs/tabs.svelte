<script lang="ts">
	import { cn } from '$lib/utils';
	import { writable } from 'svelte/store';
	import { initTabsContext } from './context';

	let {
		value = '',
		class: className = '',
		onValueChange
	}: {
		value?: string;
		class?: string;
		onValueChange?: (value: string) => void;
	} = $props();

	const internal = writable(value);

	$effect(() => {
		internal.set(value);
	});

	function setValue(next: string) {
		internal.set(next);
		onValueChange?.(next);
	}

	initTabsContext({ value: internal, setValue });
</script>

<div class={cn('grid gap-4', className)}>
	<slot />
</div>
