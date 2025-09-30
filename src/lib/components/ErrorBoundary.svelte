<script lang="ts">
        import { onMount } from 'svelte';
        import type { Snippet } from 'svelte';
	import { AlertTriangle, RefreshCw, Home, Clipboard } from 'lucide-svelte';
	import {
		Button,
		Card,
		CardContent,
		CardHeader,
		CardTitle,
		CardDescription
	} from '$lib/components/ui';
	import { cn } from '$lib/utils';

        interface ErrorBoundaryProps {
                error?: Error | null;
                onRetry?: () => void;
                onGoHome?: () => void;
                class?: string;
                children?: Snippet;
	}

	let {
		error = null,
		onRetry,
		onGoHome,
		class: className = '',
		children
	}: ErrorBoundaryProps = $props();

	let hasError = $state(false);
	let errorDetails = $state<Error | null>(null);

	onMount(() => {
		const handleError = (event: ErrorEvent) => {
			hasError = true;
			errorDetails = new Error(event.message);
		};

		const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
			hasError = true;
			errorDetails = event.reason instanceof Error ? event.reason : new Error(String(event.reason));
		};

		window.addEventListener('error', handleError);
		window.addEventListener('unhandledrejection', handleUnhandledRejection);

		return () => {
			window.removeEventListener('error', handleError);
			window.removeEventListener('unhandledrejection', handleUnhandledRejection);
		};
	});

        const currentError = $derived(() => error ?? errorDetails);
        const showError = $derived(() => hasError || !!error);

	function handleRetry() {
		hasError = false;
		errorDetails = null;
		onRetry?.();
	}

	function handleGoHome() {
		hasError = false;
		errorDetails = null;
		if (onGoHome) onGoHome();
		else window.location.href = '/';
	}

	async function copyErrorDetails() {
		if (currentError) {
			await navigator.clipboard.writeText(currentError.stack || currentError.message);
		}
	}
</script>

{#if showError && currentError}
	<div class={cn('flex min-h-[400px] items-center justify-center p-6', className)}>
		<Card class="border-border/60 bg-surface/80 shadow-marketplace-lg w-full max-w-lg border">
			<CardHeader class="items-center gap-3 border-0">
				<span
					class="border-destructive/50 bg-destructive/15 text-destructive flex h-16 w-16 items-center justify-center rounded-full border"
				>
					<AlertTriangle class="h-8 w-8" />
				</span>
				<CardTitle>Something went wrong</CardTitle>
				<CardDescription class="text-center text-sm">
					We encountered an unexpected error. Try again, head back home, or share the details with
					support.
				</CardDescription>
			</CardHeader>
			<CardContent class="space-y-4 text-sm">
				<details class="border-border/60 bg-surface-muted/40 rounded-lg border p-4">
					<summary class="text-muted-foreground cursor-pointer text-xs font-medium"
						>Error details</summary
					>
					<div class="text-muted-foreground mt-2 space-y-2 text-xs">
						<p>{currentError.message}</p>
						{#if currentError.stack}
							<details>
								<summary class="cursor-pointer text-xs">Stack trace</summary>
								<pre
									class="mt-1 text-[11px] break-words whitespace-pre-wrap">{currentError.stack}</pre>
							</details>
						{/if}
					</div>
				</details>
				<div class="flex flex-col gap-2 sm:flex-row sm:justify-center">
                                        <Button class="flex-1 gap-2" onclick={handleRetry}>
						<RefreshCw class="h-4 w-4" />
						Try again
					</Button>
                                        <Button class="flex-1 gap-2" variant="secondary" onclick={handleGoHome}>
						<Home class="h-4 w-4" />
						Go home
					</Button>
				</div>
                                <Button variant="outline" size="sm" class="w-full gap-2" onclick={copyErrorDetails}>
					<Clipboard class="h-4 w-4" />
					Copy error details
				</Button>
			</CardContent>
		</Card>
	</div>
{:else if children}
        {@render children?.()}
{/if}
