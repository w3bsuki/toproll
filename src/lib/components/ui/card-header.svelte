<script lang="ts">
	import { cn } from '$lib/utils';
	let { class: className = '', children } = $props();
</script>

<div class={cn('border-border/60 flex flex-col gap-1.5 border-b px-6 py-5', className)}>
	{@render children?.()}
</div>

