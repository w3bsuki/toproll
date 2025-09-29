<script lang="ts">
	import { cn } from '$lib/utils';
	import { useTabsContext } from './context';
	import type { Snippet } from 'svelte';

	const {
		value,
		class: className = '',
		children
	} = $props<{
		value: string;
		class?: string;
		children?: Snippet;
	}>();

	const { value: getValue } = useTabsContext();
	const selected = $derived(getValue() === value);
</script>

<div
	role="tabpanel"
	class={cn(
		'border-border/60 bg-surface/40 shadow-marketplace-sm rounded-lg border p-6',
		!selected && 'hidden',
		className
	)}
>
	{@render children?.()}
</div>
