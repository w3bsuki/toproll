<script lang="ts">
	import { cn } from '$lib/utils';
	let { class: className = '' } = $props();
</script>

<h3 class={cn('text-card-foreground text-lg font-semibold', className)}>
	<slot />
</h3>
