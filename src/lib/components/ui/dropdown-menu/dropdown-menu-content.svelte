<script lang="ts">
	import { onMount } from 'svelte';
	import { cn } from '$lib/utils';
	import { useDropdownContext } from './context';
	import { derived } from 'svelte/store';

	let {
		align = 'end' as 'start' | 'end',
		class: className = '',
		labelledby
	}: { align?: 'start' | 'end'; class?: string; labelledby?: string } = $props();

	const { open, setOpen } = useDropdownContext();
	const visible = derived(open, ($open) => $open);
	let container = $state<HTMLDivElement | null>(null);
	const slots = $slots();
	type DropdownSlot = (props: { setOpen: (value: boolean) => void }) => unknown;
	const renderDefault = slots.default as DropdownSlot | undefined;

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
		onclick={(event) => {
			event.stopPropagation();
		}}
	>
		{@render renderDefault?.({ setOpen })}
	</div>
{/if}
