<script lang="ts">
        import { cn } from '$lib/utils';
        import { writable } from 'svelte/store';
        import type { Snippet } from 'svelte';
        import { initTabsContext } from './context';

        const props = $props<{
                value?: string;
                class?: string;
                onValueChange?: (value: string) => void;
                children?: Snippet;
        }>();

        const className = $derived(() => props.class ?? '');
        const controlledValue = $derived(() => props.value ?? '');
        const onValueChange = $derived(() => props.onValueChange);
        const children = $derived(() => props.children);

        const internal = writable('');

        $effect(() => {
                internal.set(controlledValue);
        });

        function setValue(next: string) {
                internal.set(next);
                onValueChange?.(next);
        }

        initTabsContext({ value: internal, setValue });
</script>

<div class={cn('grid gap-4', className)}>
        {@render children?.({})}
</div>
