<script lang="ts">
	import { cn } from '$lib/utils';
	import { useTabsContext } from './context';
	import type { Snippet } from 'svelte';

	const {
		value: tabValue,
		class: className = '',
		disabled = false,
		children
	} = $props<{ value: string; class?: string; disabled?: boolean; children?: Snippet }>();

	const { value, setValue } = useTabsContext();
	const selected = $derived(value() === tabValue);

	const handleClick = (event: MouseEvent) => {
		if (disabled) {
			event.preventDefault();
			return;
		}
		setValue(tabValue);
	};
</script>

<button
	type="button"
	role="tab"
	aria-selected={selected}
	tabindex={selected ? 0 : -1}
	class={cn(
		'duration-subtle ease-market-ease focus-visible:ring-ring/60 focus-visible:ring-offset-background inline-flex min-w-[6rem] items-center justify-center rounded-md px-3 py-2 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none',
		selected
			? 'bg-surface-accent text-surface-accent-foreground shadow-marketplace-sm'
			: 'text-muted-foreground hover:text-foreground hover:bg-surface-muted/40',
		disabled && 'cursor-not-allowed opacity-60',
		className
	)}
	onclick={handleClick}
>
	{@render children?.()}
</button>
