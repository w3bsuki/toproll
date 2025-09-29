<script lang="ts">
	import { cn } from '$lib/utils';
	import type { Snippet } from 'svelte';

	type ButtonVariant = 'default' | 'secondary' | 'outline' | 'ghost' | 'destructive';
	type ButtonSize = 'sm' | 'md' | 'lg' | 'icon';

	type ButtonProps = {
		as?: keyof HTMLElementTagNameMap;
		type?: HTMLButtonElement['type'];
		variant?: ButtonVariant;
		size?: ButtonSize;
		class?: string;
		disabled?: boolean;
		children?: Snippet;
	} & Record<string, unknown>;

	const {
		as: asProp = undefined,
		type = 'button',
		variant = 'default',
		size = 'md',
		class: className = '',
		disabled = false,
		children,
		...restProps
	}: ButtonProps = $props();

	const variantClasses: Record<ButtonVariant, string> = {
		default:
			'bg-primary text-primary-foreground shadow-marketplace-sm border border-primary/60 hover:bg-primary/90 hover:border-primary/80',
		secondary:
			'bg-secondary text-secondary-foreground border border-secondary/55 shadow-marketplace-sm hover:bg-secondary/90',
		outline:
			'border border-border/70 bg-transparent text-foreground hover:border-primary/70 hover:text-primary hover:bg-surface-muted/40',
		ghost:
			'bg-transparent text-muted-foreground hover:text-foreground hover:bg-surface-muted/30 border border-transparent',
		destructive:
			'bg-destructive text-destructive-foreground border border-destructive/60 hover:bg-destructive/90'
	};

	const sizeClasses: Record<ButtonSize, string> = {
		sm: 'h-9 px-3 text-sm',
		md: 'h-11 px-4 text-sm',
		lg: 'h-12 px-6 text-base',
		icon: 'h-10 w-10'
	};
</script>

<svelte:element
	this={asProp ?? 'button'}
	type={asProp ? undefined : (type as HTMLButtonElement['type'])}
	class={cn(
		'duration-subtle ease-market-ease focus-visible:ring-ring/70 focus-visible:ring-offset-background inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50',
		variantClasses[variant],
		sizeClasses[size],
		className
	)}
	{disabled}
	{...restProps}
>
	{@render children?.()}
</svelte:element>
