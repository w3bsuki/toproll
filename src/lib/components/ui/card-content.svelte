<script lang="ts">
	import { cn } from '$lib/utils';
	let { class: className = '', children } = $props();
</script>

<div class={cn('px-6 py-5', className)}>
	{@render children?.()}
</div>
