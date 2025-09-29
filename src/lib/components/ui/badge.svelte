<script lang="ts">
	import { cn } from '$lib/utils';
	import type { Snippet } from 'svelte';

	type BadgeVariant = 'default' | 'outline' | 'success' | 'warning' | 'info' | 'destructive';
	const {
		variant = 'default',
		class: className = '',
		children
	} = $props<{
		variant?: BadgeVariant;
		class?: string;
		children?: Snippet;
	}>();

	const variants: Record<BadgeVariant, string> = {
		default: 'bg-primary/15 text-primary border border-primary/35',
		outline: 'border border-border/70 text-muted-foreground',
		success: 'bg-success/15 text-success border border-success/40',
		warning: 'bg-warning/15 text-warning-foreground border border-warning/40',
		info: 'bg-info/15 text-info border border-info/40',
		destructive: 'bg-destructive/15 text-destructive border border-destructive/40'
	};
</script>

<span
	class={cn(
		'inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium tracking-wide uppercase',
		variants[variant],
		className
	)}
>
	{@render children?.()}
</span>
