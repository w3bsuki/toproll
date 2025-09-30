<script lang="ts">
        import { cn } from '$lib/utils';
        import type { Snippet } from 'svelte';

        const props = $props<{ class?: string; children?: Snippet }>();
        const className = $derived(() => props.class ?? '');
        const children = $derived(() => props.children);
</script>

<h3 class={cn('text-card-foreground text-lg font-semibold', className)}>
        {@render children?.({})}
</h3>
