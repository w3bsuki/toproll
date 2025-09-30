<script lang="ts">
        import { cn } from '$lib/utils';
        import type { Snippet } from 'svelte';

        const props = $props<{ class?: string; children?: Snippet }>();
        const className = $derived(() => props.class ?? '');
        const children = $derived(() => props.children);
</script>

<div class={cn('px-6 py-5', className)}>
        {@render children?.({})}
</div>
