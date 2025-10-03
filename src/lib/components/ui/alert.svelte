<script lang="ts">
	import { cn } from '$lib/utils';

	type AlertVariant = 'default' | 'success' | 'info' | 'warning' | 'destructive';

	let { variant = 'default' as AlertVariant, class: className = '', children } = $props();

	const variants: Record<AlertVariant, string> = {
		default: 'border border-border/70 bg-surface-muted/60 text-foreground',
		success: 'border border-success/40 bg-success/15 text-success',
		info: 'border border-info/35 bg-info/15 text-info',
		warning: 'border border-warning/45 bg-warning/15 text-warning-foreground',
		destructive: 'border border-destructive/45 bg-destructive/15 text-destructive'
	};
</script>

<div
	role="alert"
	class={cn(
		'shadow-marketplace-sm flex w-full items-start gap-3 rounded-lg px-4 py-3 text-sm',
		variants[variant],
		className
	)}
>
	{@render children?.()}
</div>
