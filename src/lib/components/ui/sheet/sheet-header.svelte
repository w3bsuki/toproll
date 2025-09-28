<script lang="ts">
	import { cn } from '$lib/utils';
	let { class: className = '' } = $props();
</script>

<header
	class={cn('border-border/60 flex items-center justify-between border-b px-6 py-4', className)}
>
	<slot />
</header>
