<script lang="ts">
        import { cn } from '$lib/utils';
        import { useTabsContext } from './context';
        import { derived } from 'svelte/store';
        import type { Snippet } from 'svelte';

        const props = $props<{ class?: string; children?: Snippet }>();

        const className = $derived(() => props.class ?? '');
        const children = $derived(() => props.children);

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
        {@render children?.({})}
</div>
