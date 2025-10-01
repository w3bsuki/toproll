<script lang="ts">
	import { cn } from '$lib/utils';

	type Props = {
		class?: string;
	} & Record<string, unknown>;

	let { class: className = '', ...rest }: Props = $props();
</script>

<input
	class={cn(
		'bg-surface-subdued text-foreground placeholder:text-muted-foreground/70 ring-offset-background focus-visible:ring-focus border-border/60 duration-default ease-snappy flex h-11 w-full rounded-lg border px-4 py-2 text-sm transition-shadow focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60',
		className
	)}
	{...rest}
/>
