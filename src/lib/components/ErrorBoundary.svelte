<script lang="ts">
	import { onMount } from 'svelte';
	import { AlertTriangle, RefreshCw, Home } from 'lucide-svelte';

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
		class: className,
		children
	}: ErrorBoundaryProps = $props();

	let hasError = $state(false);
	let errorDetails = $state<Error | null>(null);

	// Listen for unhandled errors
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

	// Use provided error or caught error
	const currentError = error || errorDetails;
	const showError = hasError || !!error;

	function handleRetry() {
		hasError = false;
		errorDetails = null;
		if (onRetry) onRetry();
	}

	function handleGoHome() {
		hasError = false;
		errorDetails = null;
		if (onGoHome) onGoHome();
		else window.location.href = '/';
	}

	function copyErrorDetails() {
		if (currentError) {
			navigator.clipboard.writeText(currentError.stack || currentError.message);
		}
	}
</script>

{#if showError && currentError}
	<div class="flex min-h-[400px] items-center justify-center p-4 {className || ''}">
		<div class="card w-full max-w-md bg-base-100 shadow-xl">
			<div class="card-body text-center">
				<div class="mb-4 flex justify-center">
					<div class="flex h-16 w-16 items-center justify-center rounded-full bg-error/10">
						<AlertTriangle class="h-8 w-8 text-error" />
					</div>
				</div>

				<h2 class="mb-2 text-xl font-semibold">Something went wrong</h2>
				<p class="text-muted-foreground mb-4">
					We encountered an unexpected error. Please try again or contact support if the problem
					persists.
				</p>

				<!-- Error Details (Collapsible) -->
				<details class="mb-4 text-left">
					<summary
						class="text-muted-foreground hover:text-foreground cursor-pointer text-sm font-medium"
					>
						Error Details
					</summary>
					<div class="mt-2 rounded bg-base-200 p-3 text-xs">
						<pre class="break-words whitespace-pre-wrap">{currentError.message}</pre>
						{#if currentError.stack}
							<details class="mt-2">
								<summary class="cursor-pointer text-xs">Stack Trace</summary>
								<pre class="mt-1 text-xs break-words whitespace-pre-wrap">{currentError.stack}</pre>
							</details>
						{/if}
					</div>
				</details>

				<!-- Action Buttons -->
				<div class="flex flex-col gap-2 sm:flex-row sm:justify-center">
					<button class="btn flex-1 btn-primary sm:flex-none" onclick={handleRetry}>
						<RefreshCw class="mr-2 h-4 w-4" />
						Try Again
					</button>
					<button class="btn flex-1 btn-outline sm:flex-none" onclick={handleGoHome}>
						<Home class="mr-2 h-4 w-4" />
						Go Home
					</button>
				</div>

				<!-- Copy Error Button -->
				<button class="btn mt-2 w-full btn-ghost btn-sm" onclick={copyErrorDetails}>
					Copy Error Details
				</button>
			</div>
		</div>
	</div>
{:else if children}
	{@render children()}
{/if}
