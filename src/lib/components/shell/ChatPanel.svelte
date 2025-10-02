<script lang="ts">
	import { get } from 'svelte/store';
	import {
		communityMessages,
		pushCommunityMessage,
		rainPot,
		type CommunityMessage,
		type RainPot
	} from '$lib/stores/homepage';
	import { CloudRain, Users, Send } from '@lucide/svelte';
	import { Button } from '$lib/components/ui';

	let messages = $state<CommunityMessage[]>(get(communityMessages));
	let currentPot = $state<RainPot>(get(rainPot));
	let input = $state('');

	$effect(() => {
		const unsubscribe = communityMessages.subscribe((value) => {
			messages = value;
		});
		return unsubscribe;
	});

	$effect(() => {
		const unsubscribe = rainPot.subscribe((value) => {
			currentPot = value;
		});
		return unsubscribe;
	});

	const sendMessage = () => {
		const trimmed = input.trim();
		if (!trimmed) return;
		pushCommunityMessage({ username: 'Guest', message: trimmed });
		input = '';
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
		input = target.value;
	};
</script>

<div class="flex h-full flex-col gap-3">
	<section
		class="border-border/40 from-primary/15 via-primary/5 rounded-xl border bg-gradient-to-br to-transparent p-3 text-sm"
	>
		<div class="flex items-center gap-2.5">
			<span
				class="border-primary/40 bg-primary/15 text-primary flex h-9 w-9 items-center justify-center rounded-lg border"
			>
				<CloudRain class="h-3.5 w-3.5" />
			</span>
			<div>
				<p class="text-muted-foreground text-[10px] tracking-[0.3em] uppercase">Rain pot</p>
				<p class="text-base font-semibold">{currentPot.total}</p>
			</div>
		</div>
		<div
			class="text-muted-foreground mt-2.5 flex items-center justify-between text-[10px] tracking-[0.3em] uppercase"
		>
			<span class="flex items-center gap-1.5">
				<Users class="h-3 w-3" />
				{currentPot.contributors} queued
			</span>
			<span>Ends in {currentPot.endsIn}</span>
		</div>
	</section>

	<div class="marketplace-scrollbar flex-1 space-y-2.5 overflow-y-auto pr-1">
		{#each messages as message (message.id)}
			<article class="border-border/50 bg-card rounded-xl border px-3 py-2.5 text-sm">
				<div class="text-muted-foreground mb-1 flex items-center justify-between text-xs">
					<div class="flex items-center gap-2">
						<span class="text-foreground font-semibold">{message.username}</span>
						{#if message.badge}
							<span
								class={`rounded-full px-2 py-0.5 text-[10px] tracking-[0.3em] uppercase ${
									message.badge === 'vip'
										? 'bg-primary/20 text-primary'
										: message.badge === 'staff'
											? 'bg-accent/20 text-accent-foreground'
											: 'bg-secondary/20 text-secondary-foreground'
								}`}
							>
								{message.badge}
							</span>
						{/if}
					</div>
					<span>{message.timestamp}</span>
				</div>
				<p class="text-foreground/90 leading-relaxed">{message.message}</p>
			</article>
		{/each}
	</div>

	<form
		class="border-border bg-input flex items-center gap-2 rounded-xl border p-1.5"
		onsubmit={handleSubmit}
	>
		<label class="sr-only" for="chat-input">Message</label>
		<textarea
			id="chat-input"
			value={input}
			oninput={handleInput}
			onkeydown={handleKey}
			rows={1}
			placeholder="Drop a message…"
			class="marketplace-scrollbar max-h-20 flex-1 resize-none border-0 bg-transparent px-2 py-1.5 text-sm focus:outline-none"
		></textarea>
		<Button size="icon" class="h-9 w-9 rounded-lg" type="submit">
			<Send class="h-3.5 w-3.5" />
			<span class="sr-only">Send message</span>
		</Button>
	</form>
</div>
