<script lang="ts">
	import { cn } from '$lib/utils';
	import type { NavigationMenuProps } from './types';

	let { class: className, ...rest }: NavigationMenuProps = $props();
</script>

<nav { ...rest } class={cn('relative flex w-full flex-1 items-center justify-between', className)}>
	<slot />
</nav>