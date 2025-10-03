<script lang="ts">
	import { cn } from '$lib/utils';
	let { class: className = '', children } = $props();
</script>

<h3 class={cn('text-card-foreground text-lg font-semibold', className)}>
	{@render children?.()}
</h3>
