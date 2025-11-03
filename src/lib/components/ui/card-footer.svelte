<script lang="ts">
	import { cn } from '$lib/utils';
	let { class: className = '', children } = $props();
</script>

<div
	class={cn(
		'border-border/60 flex items-center justify-between gap-4 border-t px-6 py-4',
		className
	)}
>
	{@render children?.()}
</div>

