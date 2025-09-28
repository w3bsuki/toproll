<script lang="ts">
	import { cn } from '$lib/utils';
	let { class: className = '' } = $props();
</script>

<footer
	class={cn('border-border/60 flex items-center justify-end gap-3 border-t px-6 py-4', className)}
>
	<slot />
</footer>
