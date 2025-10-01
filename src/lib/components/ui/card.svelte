<script lang="ts">
	import { cn } from '$lib/utils';

	let { class: className = '' } = $props();
</script>

<div
	class={cn(
		'border-border/60 bg-surface-subdued text-foreground shadow-elevated-sm duration-default ease-relaxed hover:border-border/50 hover:shadow-elevated-md rounded-lg border transition-colors',
		className
	)}
>
	<slot />
</div>
