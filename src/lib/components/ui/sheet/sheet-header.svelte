<script lang="ts">
	import { cn } from '$lib/utils';
	import type { Snippet } from 'svelte';

	const { class: className = '', children } = $props<{
		class?: string;
		children?: Snippet;
	}>();
</script>

<header
	class={cn('border-border/60 flex items-center justify-between border-b px-6 py-4', className)}
>
	{@render children?.()}
</header>
