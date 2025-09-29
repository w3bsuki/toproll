<script lang="ts">
	import { cn } from '$lib/utils';
	import { useDropdownContext } from './context';
	import type { Snippet } from 'svelte';

	const {
		inset = false,
		class: className = '',
		onSelect,
		children
	} = $props<{
		inset?: boolean;
		class?: string;
		onSelect?: (event: MouseEvent) => void;
		children?: Snippet;
	}>();

	const { setOpen } = useDropdownContext();

	const handleClick = (event: MouseEvent) => {
		onSelect?.(event);
		setOpen(false);
	};
</script>

<button
	type="button"
	role="menuitem"
	class={cn(
		'text-foreground/80 duration-subtle ease-market-ease hover:bg-surface-muted/40 hover:text-foreground focus-visible:ring-ring/60 flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm transition-colors focus-visible:ring-2 focus-visible:outline-none',
		inset && 'pl-9',
		className
	)}
	onclick={handleClick}
>
	{@render children?.()}
</button>
