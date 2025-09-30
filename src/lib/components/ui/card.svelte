<script lang="ts">
        import { cn } from '$lib/utils';
        import type { Snippet } from 'svelte';

        const props = $props<{ class?: string; children?: Snippet }>();
        const className = $derived(() => props.class ?? '');
        const children = $derived(() => props.children);
</script>

<div
        class={cn(
                'border-border/60 bg-card text-card-foreground shadow-marketplace-sm duration-subtle ease-market-ease hover:border-border/80 hover:shadow-marketplace-md rounded-lg border transition-colors',
                className
        )}
>
        {@render children?.({})}
</div>
