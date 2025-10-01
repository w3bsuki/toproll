<script lang="ts">
	import { get } from 'svelte/store';
	import { communityMessages, pushCommunityMessage, rainPot } from '$lib/stores/homepage';
	import { Button, ScrollArea, Textarea } from '$lib/components/ui';
	import { cn } from '$lib/utils';
	import { CloudRain, MessageCircle, Send, Users } from 'lucide-svelte';

	type Props = {
		class?: string;
	};

	const props = $props<Props>();
	const className = $derived(props.class ?? '');

	let messages = $state(get(communityMessages));
	let pot = $state(get(rainPot));
	let value = $state('');

	$effect(() => {
		const unsubscribe = communityMessages.subscribe((next) => {
			messages = next;
		});
		return unsubscribe;
	});

	$effect(() => {
		const unsubscribe = rainPot.subscribe((next) => {
			pot = next;
		});
		return unsubscribe;
	});

	const sendMessage = () => {
		const trimmed = value.trim();
		if (!trimmed) return;
		pushCommunityMessage({ username: 'Guest', message: trimmed });
		value = '';
	};

	const handleSubmit = (event: SubmitEvent) => {
		event.preventDefault();
		sendMessage();
	};

	const handleKey = (event: KeyboardEvent) => {
		if (event.key === 'Enter' && !event.shiftKey) {
			event.preventDefault();
			sendMessage();
		}
	};

	const handleInput = (event: Event) => {
		const target = event.target as HTMLTextAreaElement;
		value = target.value;
	};
</script>

<section
	class={cn('gap-lg flex min-h-0 flex-1 flex-col', className)}
	aria-labelledby="community-chat-title"
>
	<header class="gap-md flex items-center justify-between">
		<span class="bg-primary/15 text-primary flex h-12 w-12 items-center justify-center rounded-xl">
			<MessageCircle class="h-5 w-5" aria-hidden="true" />
		</span>
		<div class="flex flex-1 flex-col">
			<h2 id="community-chat-title" class="text-base font-semibold">Community chat</h2>
			<p class="text-muted-foreground text-xs">Live pulls, rain updates and support pings.</p>
		</div>
		<slot name="header-action" />
	</header>

	<div class="border-border/60 bg-surface-subdued/80 p-md shadow-elevated-sm rounded-xl border">
		<div class="gap-md flex items-center">
			<span
				class="border-primary/40 bg-primary/15 text-primary flex h-11 w-11 items-center justify-center rounded-lg border"
			>
				<CloudRain class="h-4 w-4" aria-hidden="true" />
			</span>
			<div class="flex flex-1 flex-col">
				<p class="text-muted-foreground text-xs font-medium tracking-[0.3em] uppercase">Rain pot</p>
				<p class="text-foreground text-lg font-semibold">{pot.total}</p>
			</div>
		</div>
		<div
			class="mt-sm text-muted-foreground flex items-center justify-between text-[11px] font-medium tracking-[0.3em] uppercase"
		>
			<span class="flex items-center gap-2">
				<Users class="h-3.5 w-3.5" aria-hidden="true" />
				{pot.contributors} queued
			</span>
			<span>Ends in {pot.endsIn}</span>
		</div>
	</div>

	<ScrollArea class="min-h-0 flex-1" viewportClass="flex flex-col gap-sm pr-1">
		{#each messages as message (message.id)}
			<article
				class="border-border/50 bg-surface-subdued/70 p-md rounded-lg border text-sm shadow-none"
			>
				<header
					class="gap-xs text-muted-foreground mb-1 flex flex-wrap items-center justify-between text-xs"
				>
					<div class="gap-xs flex items-center">
						<span class="text-foreground font-semibold">{message.username}</span>
						{#if message.badge}
							<span
								class="bg-primary/15 text-primary rounded-full px-2 py-0.5 text-[10px] tracking-[0.3em] uppercase"
							>
								{message.badge}
							</span>
						{/if}
					</div>
					<span>{message.timestamp}</span>
				</header>
				<p class="text-foreground/90 leading-relaxed">{message.message}</p>
			</article>
		{/each}
	</ScrollArea>

	<form class="gap-sm pt-sm mt-auto flex items-end" onsubmit={handleSubmit}>
		<div class="flex-1">
			<label for="chat-composer" class="sr-only">Write a message</label>
			<Textarea
				id="chat-composer"
				{value}
				rows={2}
				oninput={handleInput}
				onkeydown={handleKey}
				placeholder="Drop a message…"
				class="h-full min-h-[3.25rem] resize-none"
			/>
		</div>
		<Button type="submit" size="icon" class="h-12 w-12 rounded-lg">
			<Send class="h-4 w-4" aria-hidden="true" />
			<span class="sr-only">Send message</span>
		</Button>
	</form>
</section>
