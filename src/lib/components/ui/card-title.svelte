<script lang="ts">
	import { cn } from '$lib/utils';
	import type { Snippet } from 'svelte';

	const { class: className = '', children } = $props<{
		class?: string;
		children?: Snippet;
	}>();
</script>

<h3 class={cn('text-card-foreground text-lg font-semibold', className)}>
	{@render children?.()}
</h3>
