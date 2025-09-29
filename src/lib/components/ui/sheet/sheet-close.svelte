<script lang="ts">
	import { useSheetContext } from './context';
	import { cn } from '$lib/utils';
	import type { Snippet } from 'svelte';

	const { class: className = '', children } = $props<{
		class?: string;
		children?: Snippet;
	}>();
	const { close } = useSheetContext();
</script>

<button
	type="button"
	class={cn('inline-flex items-center justify-center', className)}
	onclick={() => close()}
>
	{@render children?.()}
</button>
