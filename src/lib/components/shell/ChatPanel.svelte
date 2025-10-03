<script lang="ts">
	import { get } from 'svelte/store';
	import {
		communityMessages,
		pushCommunityMessage,
		type CommunityMessage
	} from '$lib/stores/homepage';
	import { Send, User } from '@lucide/svelte';
	import { Button, Badge } from '$lib/components/ui';
	import { Textarea } from '$lib/components/ui/textarea';
	import * as Avatar from "$lib/components/ui/avatar/index.js";

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
</script>

<div class="flex h-full flex-col gap-3">
	<div class="marketplace-scrollbar flex-1 space-y-2.5 overflow-y-auto pr-1">
		{#each messages as message (message.id)}
			<article class="border-border/50 bg-card rounded-xl border px-3 py-2.5 text-sm">
				<div class="text-muted-foreground mb-1 flex items-center justify-between text-xs">
					<div class="flex items-center gap-2">
						<Avatar.Root class="h-6 w-6">
							<Avatar.Image src={message.avatar} alt={message.username} />
							<Avatar.Fallback class="text-xs">
								<User class="h-3 w-3" />
							</Avatar.Fallback>
						</Avatar.Root>
						<span class="text-foreground font-semibold">{message.username}</span>
						{#if message.badge}
							<Badge
								variant={message.badge === 'vip' ? 'default' : message.badge === 'staff' ? 'outline' : 'info'}
								class="text-[10px] px-1.5 py-0 h-4"
							>
								{message.badge}
							</Badge>
						{/if}
					</div>
					<span>{message.timestamp}</span>
				</div>
				<p class="text-foreground/90 leading-relaxed">{message.message}</p>
			</article>
		{/each}
	</div>

	<form class="flex items-center gap-2" onsubmit={handleSubmit}>
		<label class="sr-only" for="chat-input">Message</label>
		<Textarea
			id="chat-input"
			bind:value={input}
			onkeydown={handleKey}
			rows={1}
			placeholder="Drop a message…"
			class="max-h-20 resize-none"
		/>
		<Button size="icon" class="h-9 w-9 shrink-0 rounded-lg" type="submit">
			<Send class="h-3.5 w-3.5" />
			<span class="sr-only">Send message</span>
		</Button>
	</form>
</div>
