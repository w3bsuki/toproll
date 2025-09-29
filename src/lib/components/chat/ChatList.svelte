<script lang="ts">
	import { cn } from '$lib/utils';
	import type { CommunityMessage } from '$lib/stores/homepage';

	type ChatListProps = {
		messages: CommunityMessage[];
		variant?: 'dark' | 'surface';
		class?: string;
		ariaLive?: 'polite' | 'assertive' | 'off';
		labelledby?: string;
	};

	const props = $props<ChatListProps>();
	const messages = $derived(() => props.messages ?? []);
	const variant = $derived(() => (props.variant ?? 'surface') as 'dark' | 'surface');
	const className = $derived(() => props.class ?? '');
	const ariaLive = $derived(() => props.ariaLive ?? 'polite');
	const labelledby = $derived(() => props.labelledby);

	const variantClasses = {
		dark: {
			item: 'border-white/15 bg-black/20 text-white shadow-[0_12px_35px_rgba(12,74,110,0.3)]',
			meta: 'text-[11px] tracking-[0.3em] text-white/60 uppercase',
			username: 'text-white',
			timestamp: 'text-white/60 text-[11px] normal-case',
			message: 'text-white/80',
			list: 'pr-2',
			badge: {
				vip: 'bg-primary/25 text-white',
				staff: 'bg-accent/25 text-white',
				pro: 'bg-secondary/25 text-white'
			}
		},
		surface: {
			item: 'border-border/50 bg-surface/70 text-foreground',
			meta: 'text-muted-foreground flex items-center justify-between text-xs',
			username: 'text-foreground font-semibold',
			timestamp: 'text-muted-foreground text-xs',
			message: 'text-foreground/90',
			list: 'pr-1',
			badge: {
				vip: 'bg-primary/20 text-primary',
				staff: 'bg-accent/20 text-accent-foreground',
				pro: 'bg-secondary/20 text-secondary-foreground'
			}
		}
	} as const;
</script>

<ul
	class={cn(
		'marketplace-scrollbar flex flex-1 flex-col space-y-3 overflow-y-auto',
		variantClasses[variant].list,
		className
	)}
	role="log"
	aria-live={ariaLive}
	aria-relevant="additions text"
	aria-labelledby={labelledby}
>
	{#if messages.length === 0}
		<li
			class={cn(
				'border-border/50 text-muted-foreground/80 flex flex-col items-center justify-center gap-2 rounded-2xl border px-6 py-8 text-center text-sm',
				variant === 'dark' ? 'border-white/15 bg-white/5 text-white/70' : 'bg-surface-muted/40'
			)}
		>
			<span>No messages yet. Start the conversation.</span>
		</li>
	{/if}

	{#each messages as message (message.id)}
		<li
			class={cn(
				'rounded-2xl border px-4 py-3 text-sm transition-colors',
				variantClasses[variant].item
			)}
		>
			<div
				class={cn(
					'mb-1 flex items-center justify-between gap-3 text-xs',
					variant === 'dark' ? 'text-white/70' : 'text-muted-foreground'
				)}
			>
				<div class="flex items-center gap-2">
					<span class={variantClasses[variant].username}>{message.username}</span>
					{#if message.badge}
						<span
							class={cn(
								'rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-[0.3em] uppercase',
								variantClasses[variant].badge[message.badge]
							)}
						>
							{message.badge}
						</span>
					{/if}
				</div>
				<span class={variantClasses[variant].timestamp}>{message.timestamp}</span>
			</div>
			<p class={cn('leading-relaxed', variantClasses[variant].message)}>{message.message}</p>
		</li>
	{/each}
</ul>
