<script lang="ts">
        import { useSheetContext } from './context';
        import { cn } from '$lib/utils';
        import type { Snippet } from 'svelte';

        const props = $props<{ class?: string; children?: Snippet }>();
        const className = $derived(() => props.class ?? '');
        const children = $derived(() => props.children);
        const { openSheet } = useSheetContext();
</script>

<button
	type="button"
        class={cn('inline-flex items-center justify-center', className)}
        onclick={() => openSheet()}
>
        {@render children?.({})}
</button>
