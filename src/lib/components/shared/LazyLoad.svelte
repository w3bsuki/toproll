<script lang="ts" generics="T extends Record<string, any>">
	/**
	 * LazyLoad - Universal lazy loading component for Svelte 5
	 * 
	 * Usage:
	 * ```svelte
	 * <LazyLoad component={MyHeavyComponent} props={{ title: "Hello" }} />
	 * ```
	 */
	import { Loader2 } from '@lucide/svelte';
	import type { Component } from 'svelte';

	type Props = {
		component: Component<T> | Promise<{ default: Component<T> }>;
		props?: T;
		loadingText?: string;
		fallback?: Component;
	};

	let {
		component,
		props = {} as T,
		loadingText = 'Loading...',
		fallback
	}: Props = $props();

	let resolvedComponent = $state<Component<T> | null>(null);
	let loading = $state(true);
	let error = $state<Error | null>(null);

	$effect(() => {
		loading = true;
		error = null;

		Promise.resolve(component)
			.then((mod) => {
				// Handle both direct components and { default: Component } imports
				resolvedComponent = 'default' in mod ? mod.default : mod;
				loading = false;
			})
			.catch((err) => {
				error = err instanceof Error ? err : new Error('Failed to load component');
				loading = false;
			});
	});
</script>

{#if loading}
	{#if fallback}
		{@const FallbackComponent = fallback}
		<FallbackComponent />
	{:else}
		<div class="flex items-center justify-center gap-2 py-8">
			<Loader2 class="h-5 w-5 animate-spin" />
			<span class="text-muted-foreground text-sm">{loadingText}</span>
		</div>
	{/if}
{:else if error}
	<div class="border-destructive text-destructive rounded-lg border bg-destructive/10 p-4">
		<p class="font-semibold">Failed to load component</p>
		<p class="text-sm">{error.message}</p>
	</div>
{:else if resolvedComponent}
	{@const DynamicComponent = resolvedComponent}
	<DynamicComponent {...props} />
{/if}
