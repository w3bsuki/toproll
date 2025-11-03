<script lang="ts">
	import { cn } from '$lib/utils';
	let { class: className = '', children } = $props();
</script>

<p class={cn('text-muted-foreground text-sm', className)}>
	{@render children?.()}
</p>

