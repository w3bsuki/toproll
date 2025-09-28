<script lang="ts">
	import { useSheetContext } from './context';
	import { cn } from '$lib/utils';

	let { class: className = '' } = $props();
	const { openSheet } = useSheetContext();
</script>

<button
	type="button"
	class={cn('inline-flex items-center justify-center', className)}
	onclick={() => openSheet()}
>
	<slot />
</button>
