<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { Button } from '$lib/components/ui';
	import { cn } from '$lib/utils';
	import { Send } from 'lucide-svelte';

	type ChatComposerEvents = {
		submit: string;
		input: string;
	};

	type ChatComposerProps = {
		value: string;
		placeholder?: string;
		label?: string;
		sendLabel?: string;
		id?: string;
		variant?: 'dark' | 'surface';
		class?: string;
		multiline?: boolean;
		disabled?: boolean;
	};

	const props = $props<ChatComposerProps>();
	const placeholder = $derived(() => props.placeholder ?? 'Type a message…');
	const label = $derived(() => props.label ?? 'Message');
	const sendLabel = $derived(() => props.sendLabel ?? 'Send message');
	const id = $derived(() => props.id ?? 'chat-composer');
	const className = $derived(() => props.class ?? '');
	const variant = $derived(() => (props.variant ?? 'surface') as 'dark' | 'surface');
	const multiline = $derived(() => props.multiline ?? true);
	const disabled = $derived(() => props.disabled ?? false);
	const inboundValue = $derived(() => props.value ?? '');

	let localValue = $state(inboundValue);

	const dispatch = createEventDispatcher<ChatComposerEvents>();

	$effect(() => {
		localValue = inboundValue;
	});

	const variantClasses = {
		dark: {
			container: 'border-white/20 bg-black/30',
			input: 'placeholder:text-white/50 text-white',
			button: 'border border-white/30 bg-white/15 text-white hover:bg-white/25',
			buttonDisabled: 'opacity-60 hover:bg-white/15'
		},
		surface: {
			container: 'border-border/60 bg-surface-muted/50',
			input: 'placeholder:text-muted-foreground text-foreground',
			button: 'bg-primary text-primary-foreground hover:bg-primary/90',
			buttonDisabled: 'opacity-70 hover:bg-primary'
		}
	} as const;

	const isSendDisabled = $derived(() => disabled || localValue.trim().length === 0);

	const handleSubmit = () => {
		const trimmed = localValue.trim();
		if (!trimmed || disabled) return;
		dispatch('submit', trimmed);
	};

	const handleFormSubmit = (event: SubmitEvent) => {
		event.preventDefault();
		handleSubmit();
	};

	const handleInput = (event: Event) => {
		const target = event.target as HTMLTextAreaElement | HTMLInputElement;
		localValue = target.value;
		dispatch('input', target.value);
	};

	const handleKeydown = (event: KeyboardEvent) => {
		if (event.key === 'Enter' && (!multiline || !event.shiftKey)) {
			event.preventDefault();
			handleSubmit();
		}
	};
</script>

<form
	class={cn(
		'flex items-center gap-2 rounded-2xl border px-3 py-2 transition-colors',
		variantClasses[variant].container,
		className
	)}
	onsubmit={handleFormSubmit}
>
	<label class="sr-only" for={id}>{label}</label>
	{#if multiline}
		<textarea
			{id}
			rows={1}
			{placeholder}
			value={localValue}
			oninput={handleInput}
			onkeydown={handleKeydown}
			class={cn(
				'marketplace-scrollbar max-h-24 flex-1 resize-none border-0 bg-transparent px-2 py-1 text-sm focus:outline-none',
				variantClasses[variant].input
			)}
			{disabled}
		/>
	{:else}
		<input
			{id}
			type="text"
			{placeholder}
			value={localValue}
			oninput={handleInput}
			onkeydown={handleKeydown}
			class={cn(
				'h-10 flex-1 border-0 bg-transparent px-2 text-sm focus:outline-none',
				variantClasses[variant].input
			)}
			{disabled}
		/>
	{/if}
	<Button
		type="submit"
		size="icon"
		variant="ghost"
		class={cn(
			'focus-visible:ring-ring/70 focus-visible:ring-offset-background h-11 w-11 rounded-2xl transition-colors focus-visible:ring-2 focus-visible:ring-offset-2',
			variantClasses[variant].button,
			isSendDisabled ? variantClasses[variant].buttonDisabled : ''
		)}
		disabled={isSendDisabled}
	>
		<Send class="h-4 w-4" />
		<span class="sr-only">{sendLabel}</span>
	</Button>
</form>
