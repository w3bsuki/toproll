<script lang="ts">
        import { derived } from 'svelte/store';
        import { onMount } from 'svelte';
        import { cn } from '$lib/utils';
        import { useDropdownContext } from './context';
        import type { Snippet } from 'svelte';

        const props = $props<{ align?: 'start' | 'end'; class?: string; labelledby?: string; children?: Snippet }>();

        const align = $derived(() => (props.align ?? 'end') as 'start' | 'end');
        const className = $derived(() => props.class ?? '');
        const labelledby = $derived(() => props.labelledby);
        const children = $derived(() => props.children);

        const { open, setOpen } = useDropdownContext();
        const visible = derived(open, ($open) => $open);
        let container = $state<HTMLDivElement | null>(null);

        onMount(() => {
                const handleClick = (event: MouseEvent) => {
                        if (!container) return;
                        if (!container.contains(event.target as Node)) {
                                setOpen(false);
                        }
                };
                window.addEventListener('click', handleClick);
                return () => window.removeEventListener('click', handleClick);
        });

        const handleKeydown = (event: KeyboardEvent) => {
                if (event.key === 'Escape') {
                        setOpen(false);
                        event.stopPropagation();
                }
        };
</script>

{#if $visible}
        <div
                role="menu"
                aria-labelledby={labelledby}
                class={cn(
                        'border-border/60 bg-popover shadow-marketplace-lg animate-slide-up absolute z-50 mt-2 min-w-[14rem] overflow-hidden rounded-lg border p-2 text-sm',
                        align === 'end' ? 'right-0 origin-top-right' : 'left-0 origin-top-left',
                        className
                )}
                bind:this={container}
                tabindex="-1"
                onclick={(event) => {
                        event.stopPropagation();
                }}
                onkeydown={handleKeydown}
        >
                {@render children?.({})}
        </div>
{/if}
