<script lang="ts">
	import { useDropdownContext } from './context';
	import { cn } from '$lib/utils';

	let { class: className = '' } = $props();
	const { open, setOpen } = useDropdownContext();
</script>

<button
	type="button"
	aria-haspopup="menu"
	aria-expanded={$open}
	class={cn('inline-flex items-center justify-center', className)}
	on:click|stopPropagation={() => setOpen(!$open)}
>
	<slot />
</button>
