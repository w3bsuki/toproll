<script lang="ts">
	import { cn } from '$lib/utils';
	import { initTabsContext } from './context';
	import type { Snippet } from 'svelte';

	const {
		value = '',
		class: className = '',
		onValueChange,
		children
	} = $props<{
		value?: string;
		class?: string;
		onValueChange?: (value: string) => void;
		children?: Snippet;
	}>();

	let selected = $state(value);

	$effect(() => {
		selected = value;
	});

	const setValue = (next: string) => {
		selected = next;
		onValueChange?.(next);
	};

	initTabsContext({ value: () => selected, setValue });
</script>

<div class={cn('grid gap-4', className)}>
	{@render children?.()}
</div>
