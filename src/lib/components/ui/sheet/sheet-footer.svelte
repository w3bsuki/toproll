<script lang="ts">
        import { cn } from '$lib/utils';
        import type { Snippet } from 'svelte';

        const props = $props<{ class?: string; children?: Snippet }>();
        const className = $derived(() => props.class ?? '');
        const children = $derived(() => props.children);
</script>

<footer
	class={cn('border-border/60 flex items-center justify-end gap-3 border-t px-6 py-4', className)}
>
        {@render children?.({})}
</footer>
