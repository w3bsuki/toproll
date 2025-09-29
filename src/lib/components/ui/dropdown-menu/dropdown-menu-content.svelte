<script lang="ts">
	import { onMount } from 'svelte';
	import { cn } from '$lib/utils';
	import { useDropdownContext } from './context';
	import type { Snippet } from 'svelte';

	const {
		align = 'end',
		class: className = '',
		labelledby,
		children
	} = $props<{
		align?: 'start' | 'end';
		class?: string;
		labelledby?: string;
		children?: Snippet<{ setOpen: (open: boolean) => void }>;
	}>();

	const { open, setOpen } = useDropdownContext();
	const visible = $derived(open());
	let container: HTMLDivElement | null = null;

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

	const handleContainerClick = (event: MouseEvent) => {
		event.stopPropagation();
	};
</script>

{#if visible}
	<div
		role="menu"
		tabindex="-1"
		aria-labelledby={labelledby}
		class={cn(
			'border-border/60 bg-popover shadow-marketplace-lg animate-slide-up absolute z-50 mt-2 min-w-[14rem] overflow-hidden rounded-lg border p-2 text-sm',
			align === 'end' ? 'right-0 origin-top-right' : 'left-0 origin-top-left',
			className
		)}
		bind:this={container}
		onclick={handleContainerClick}
	>
		{@render children?.({ setOpen })}
	</div>
{/if}
