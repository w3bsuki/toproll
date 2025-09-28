<script lang="ts">
	import { cn } from '$lib/utils';
	import { useTabsContext } from './context';
	import { derived } from 'svelte/store';

	let { value, class: className = '' } = $props<{ value: string; class?: string }>();

	const { value: store } = useTabsContext();
	const selected = derived(store, ($value) => $value === value);
</script>

<div
	role="tabpanel"
	class={cn(
		'border-border/60 bg-surface/40 shadow-marketplace-sm rounded-lg border p-6',
		!$selected && 'hidden',
		className
	)}
>
	<slot />
</div>
