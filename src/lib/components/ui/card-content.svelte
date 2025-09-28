<script lang="ts">
	import { cn } from '$lib/utils';
	let { class: className = '' } = $props();
</script>

<div class={cn('px-6 py-5', className)}>
	<slot />
</div>
