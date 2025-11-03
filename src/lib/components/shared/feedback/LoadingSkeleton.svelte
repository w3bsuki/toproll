<script lang="ts">
	import { cn } from '$lib/utils';

	interface LoadingSkeletonProps {
		class?: string;
		variant?: 'default' | 'card' | 'avatar' | 'text' | 'button';
		width?: string;
		height?: string;
	}

	let { class: className, variant = 'default', width, height }: LoadingSkeletonProps = $props();

	function getVariantClasses(variant: string): string {
		switch (variant) {
			case 'card':
				return 'h-32 w-full rounded-lg';
			case 'avatar':
				return 'h-10 w-10 rounded-full';
			case 'text':
				return 'h-4 w-full rounded';
			case 'button':
				return 'h-10 w-24 rounded-md';
			default:
				return 'h-4 w-full rounded';
		}
	}

	const style = width || height ? `width: ${width}; height: ${height};` : '';
</script>

<div class={cn('bg-muted animate-pulse', getVariantClasses(variant), className)} {style}></div>

