<script lang="ts">
        import { useDropdownContext } from './context';
        import { cn } from '$lib/utils';
        import type { Snippet } from 'svelte';

        const props = $props<{ class?: string; children?: Snippet }>();
        const className = $derived(() => props.class ?? '');
        const children = $derived(() => props.children);
        const { open, setOpen } = useDropdownContext();
        const isOpen = $derived(() => $open);

        const handleClick = (event: MouseEvent) => {
                event.stopPropagation();
                setOpen(!isOpen);
        };
</script>

<button
	type="button"
	aria-haspopup="menu"
        aria-expanded={$open}
        class={cn('inline-flex items-center justify-center', className)}
        onclick={handleClick}
>
        {@render children?.({})}
</button>
