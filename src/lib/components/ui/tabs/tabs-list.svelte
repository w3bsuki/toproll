<script lang="ts">
	import { cn } from '$lib/utils';
	import { useTabsContext } from './context';
	import { derived } from 'svelte/store';

	let { class: className = '' } = $props();

	const { value } = useTabsContext();
	const active = derived(value, ($value) => $value);
</script>

<div
	role="tablist"
	aria-orientation="horizontal"
	class={cn(
		'border-border/70 bg-surface-muted/40 inline-flex items-center gap-1 rounded-md border p-1 text-sm',
		className
	)}
	data-active={$active}
>
	<slot />
</div>
