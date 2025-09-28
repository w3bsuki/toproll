<script lang="ts">
	import { cn } from '$lib/utils';
	let { class: className = '' } = $props();
</script>

<p class={cn('text-muted-foreground text-sm', className)}>
	<slot />
</p>
