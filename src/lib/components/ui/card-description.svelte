<script lang="ts">
	import { cn } from '$lib/utils';
	import type { Snippet } from 'svelte';

	const { class: className = '', children } = $props<{
		class?: string;
		children?: Snippet;
	}>();
</script>

<p class={cn('text-muted-foreground text-sm', className)}>
	{@render children?.()}
</p>
