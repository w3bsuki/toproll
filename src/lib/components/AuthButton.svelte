<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { Loader2, Shield } from '@lucide/svelte';
	import { Button } from '$lib/components/ui';
	import { cn } from '$lib/utils';

	interface AuthButtonProps extends HTMLAttributes<HTMLButtonElement> {
		loading?: boolean;
		disabled?: boolean;
		label?: string;
	}

	let {
		loading = false,
		disabled = false,
		label = 'Sign in with Steam',
		class: className = '',
		...restProps
	}: AuthButtonProps = $props();

	const isDisabled = $derived(loading || disabled);
</script>

<Button type="submit" class={cn('gap-2 px-5', className)} disabled={isDisabled} {...restProps}>
	{#if loading}
		<Loader2 class="h-4 w-4 animate-spin" />
		<span>Connecting…</span>
	{:else}
		<Shield class="h-4 w-4" />
		<span>{label}</span>
	{/if}
</Button>
