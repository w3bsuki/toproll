<script lang="ts">
	import { cn } from '$lib/utils';

	type ButtonVariant = 'default' | 'secondary' | 'outline' | 'ghost' | 'destructive';
	type ButtonSize = 'sm' | 'md' | 'lg' | 'icon';

	type ButtonProps = {
		as?: keyof HTMLElementTagNameMap;
		type?: HTMLButtonElement['type'];
		variant?: ButtonVariant;
		size?: ButtonSize;
		class?: string;
		disabled?: boolean;
	} & Record<string, unknown>;

	let {
		as: asProp = undefined,
		type = 'button',
		variant = 'default' as ButtonVariant,
		size = 'md' as ButtonSize,
		class: className = '',
		disabled = false,
		...restProps
	}: ButtonProps = $props();

	const variantClasses: Record<ButtonVariant, string> = {
		default:
			'border border-primary/50 bg-primary text-primary-foreground shadow-elevated-sm hover:bg-primary/85',
		secondary:
			'border border-border/60 bg-surface-subdued text-foreground shadow-elevated-sm hover:bg-surface-subdued/70',
		outline: 'border border-border/60 bg-transparent text-foreground hover:bg-surface-subdued/60',
		ghost:
			'border border-transparent bg-transparent text-muted-foreground hover:bg-surface-subdued/60 hover:text-foreground',
		destructive: 'border border-danger/60 bg-danger text-danger-foreground hover:bg-danger/90'
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
		'duration-default ease-snappy focus-visible:ring-ring focus-visible:ring-offset-background inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50',
		variantClasses[variant],
		sizeClasses[size],
		className
	)}
	{disabled}
	{...restProps}
>
	<slot />
</svelte:element>
