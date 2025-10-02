<script lang="ts">
	import { get } from 'svelte/store';
	import {
		communityMessages,
		pushCommunityMessage,
		type CommunityMessage
	} from '$lib/stores/homepage';
	import { Send } from '@lucide/svelte';
	import { Button } from '$lib/components/ui';

	let messages = $state<CommunityMessage[]>(get(communityMessages));
	let input = $state('');

	$effect(() => {
		const unsubscribe = communityMessages.subscribe((value) => {
			messages = value;
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
		class="border-input bg-background focus-within:border-ring focus-within:ring-ring/50 flex items-center gap-2 rounded-xl border p-1.5 transition-colors focus-within:ring-2"
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
			class="marketplace-scrollbar text-foreground placeholder:text-muted-foreground max-h-20 flex-1 resize-none border-0 bg-transparent px-2 py-1.5 text-sm outline-none"
		></textarea>
		<Button size="icon" class="h-9 w-9 rounded-lg" type="submit">
			<Send class="h-3.5 w-3.5" />
			<span class="sr-only">Send message</span>
		</Button>
	</form>
</div>
