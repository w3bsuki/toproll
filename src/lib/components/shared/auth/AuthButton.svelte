<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { Loader2, Shield, AlertCircle, RefreshCw } from '@lucide/svelte';
	import { Button } from '$lib/components/ui';
	import { cn } from '$lib/utils';

	interface AuthButtonProps extends HTMLAttributes<HTMLButtonElement> {
		loading?: boolean;
		disabled?: boolean;
		label?: string;
		error?: string | null;
		retryable?: boolean;
		onRetry?: () => void;
	}

	let {
		loading = false,
		disabled = false,
		label = 'Sign in with Steam',
		error = null,
		retryable = false,
		onRetry,
		class: className = '',
		...restProps
	}: AuthButtonProps = $props();

	const isDisabled = $derived(loading || disabled);
	const showRetry = $derived(error && retryable && onRetry && !loading);

	function handleRetry() {
		if (onRetry && !loading) {
			onRetry();
		}
	}

	function handleKeyDown(event: KeyboardEvent) {
		if (showRetry && (event.key === 'Enter' || event.key === ' ') && onRetry) {
			event.preventDefault();
			onRetry();
		}
	}
</script>

<div class="space-y-2">
	<Button
		type="submit"
		class={cn('gap-2 px-5 transition-all duration-200', className)}
		disabled={isDisabled}
		aria-describedby={error ? 'auth-error' : undefined}
		aria-busy={loading}
		{...restProps}
	>
		{#if loading}
			<Loader2 class="h-4 w-4 animate-spin" aria-hidden="true" />
			<span>Connectingâ€¦</span>
		{:else}
			<Shield class="h-4 w-4" aria-hidden="true" />
			<span>{label}</span>
		{/if}
	</Button>

	{#if error}
		<div
			id="auth-error"
			class="text-destructive flex items-center gap-2 text-sm"
			role="alert"
			aria-live="polite"
		>
			<AlertCircle class="h-4 w-4 flex-shrink-0" aria-hidden="true" />
			<span class="text-left">{error}</span>
			{#if showRetry}
				<button
					type="button"
					class="text-muted-foreground hover:text-foreground ml-auto inline-flex items-center gap-1 text-xs font-medium transition-colors"
					onclick={handleRetry}
					onkeydown={handleKeyDown}
					aria-label="Retry authentication"
				>
					<RefreshCw class="h-3 w-3" aria-hidden="true" />
					Retry
				</button>
			{/if}
		</div>
	{/if}
</div>

