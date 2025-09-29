<script lang="ts">
	import { cn } from '$lib/utils';
	import type { Snippet } from 'svelte';

	const { class: className = '', children } = $props<{
		class?: string;
		children?: Snippet;
	}>();
</script>

<footer
	class={cn('border-border/60 flex items-center justify-end gap-3 border-t px-6 py-4', className)}
>
	{@render children?.()}
</footer>
