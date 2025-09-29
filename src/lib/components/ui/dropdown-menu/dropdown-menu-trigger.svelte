<script lang="ts">
	import { useDropdownContext } from './context';
	import { cn } from '$lib/utils';
	import type { Snippet } from 'svelte';

	const { class: className = '', children } = $props<{
		class?: string;
		children?: Snippet;
	}>();
	const { open, setOpen } = useDropdownContext();
	const isOpen = $derived(open());

	const handleClick = (event: MouseEvent) => {
		event.stopPropagation();
		setOpen(!isOpen);
	};
</script>

<button
	type="button"
	aria-haspopup="menu"
	aria-expanded={isOpen}
	class={cn('inline-flex items-center justify-center', className)}
	onclick={handleClick}
>
	{@render children?.()}
</button>
