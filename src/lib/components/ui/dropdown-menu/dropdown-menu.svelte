<script lang="ts">
        import { cn } from '$lib/utils';
        import { writable } from 'svelte/store';
        import type { Snippet } from 'svelte';
        import { initDropdownContext } from './context';

        const props = $props<{ open?: boolean; class?: string; onOpenChange?: (open: boolean) => void; children?: Snippet }>();

        const open = $derived(() => props.open ?? false);
        const className = $derived(() => props.class ?? '');
        const onOpenChange = $derived(() => props.onOpenChange);
        const children = $derived(() => props.children);

        const internal = writable(false);

        $effect(() => {
                internal.set(open);
        });

        function setOpen(next: boolean) {
                internal.set(next);
                onOpenChange?.(next);
        }

        initDropdownContext({ open: internal, setOpen });
</script>

<div class={cn('relative inline-block text-left', className)}>
        {@render children?.({})}
</div>
