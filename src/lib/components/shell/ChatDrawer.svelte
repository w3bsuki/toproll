<script lang="ts">
	import { uiStore, closeChat } from '$lib/stores/ui';
	import { X, Send, MessageCircle } from 'lucide-svelte';
	import { getSupabaseClient } from '$lib/supabase/client';
	import { onDestroy } from 'svelte';
	import {
		Button,
		Sheet,
		SheetContent,
		SheetHeader,
		SheetFooter,
		SheetClose
	} from '$lib/components/ui';

	interface ChatDrawerProps {
		class?: string;
	}

	let { class: className = '' }: ChatDrawerProps = $props();

	const chatOpen = $derived($uiStore.chatOpen);

	type ChatMessage = { id: string; user: string; message: string; time: string };
	let messages = $state<ChatMessage[]>([]);
	let input = $state('');
	const supabase = getSupabaseClient();

	const channel = supabase
		.channel('realtime:chat_messages')
		.on('broadcast', { event: 'message' }, (payload) => {
			const m = payload.payload as ChatMessage;
			messages = [...messages, m];
		})
		.subscribe();

	onDestroy(() => {
		try {
			supabase.removeChannel(channel);
		} catch (error) {
			console.error('Failed to remove chat channel', error);
		}
	});

	function sendMessage() {
		const trimmed = input.trim();
		if (!trimmed) return;
		const now = new Date();
		const msg: ChatMessage = {
			id: crypto.randomUUID(),
			user: 'Guest',
			message: trimmed,
			time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
		};
		messages = [...messages, msg];
		input = '';
		channel.send({ type: 'broadcast', event: 'message', payload: msg });
	}
</script>

<!-- Desktop drawer -->
<aside
	class={`border-border/60 bg-surface/60 hidden w-80 flex-col border-l backdrop-blur-sm md:flex ${className}`}
>
	<div class="border-border/60 flex items-center justify-between border-b px-5 py-4">
		<div class="flex items-center gap-3">
			<span
				class="border-primary/50 bg-primary/15 text-primary flex h-9 w-9 items-center justify-center rounded-md border"
			>
				<MessageCircle class="h-4 w-4" />
			</span>
			<div>
				<h2 class="text-foreground text-sm font-semibold">Live Chat</h2>
				<p class="text-muted-foreground text-xs">24 traders online</p>
			</div>
		</div>
	</div>
	<div class="marketplace-scrollbar flex-1 space-y-3 overflow-y-auto px-5 py-4">
		{#each messages as message}
			<div class="border-border/50 bg-surface-muted/40 rounded-lg border p-3 text-sm">
				<div class="text-muted-foreground mb-1 flex items-center justify-between text-xs">
					<span class="text-foreground font-medium">{message.user}</span>
					<span>{message.time}</span>
				</div>
				<p class="text-foreground/90 leading-relaxed">{message.message}</p>
			</div>
		{/each}
	</div>
	<div class="border-border/60 border-t px-5 py-4">
		<div class="flex items-center gap-2">
			<input
				bind:value={input}
				onkeydown={(e) => e.key === 'Enter' && sendMessage()}
				type="text"
				placeholder="Type a message..."
				class="border-border/60 bg-surface-muted/60 text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-ring/50 h-10 flex-1 rounded-md border px-3 text-sm focus:ring-2 focus:outline-none"
			/>
			<Button size="sm" class="px-3" on:click={sendMessage}>
				<Send class="h-4 w-4" />
			</Button>
		</div>
	</div>
</aside>

<!-- Mobile sheet -->
<Sheet open={chatOpen} onOpenChange={(open) => (!open ? closeChat() : undefined)}>
	<SheetContent side="bottom" class="md:hidden" labelledby="chat-drawer-title">
		<SheetHeader class="items-start">
			<div class="flex items-center gap-3">
				<span
					class="border-primary/50 bg-primary/15 text-primary flex h-10 w-10 items-center justify-center rounded-md border"
				>
					<MessageCircle class="h-4 w-4" />
				</span>
				<div>
					<h2 id="chat-drawer-title" class="text-foreground text-base font-semibold">
						Community Chat
					</h2>
					<p class="text-muted-foreground text-xs">Stay connected with the marketplace</p>
				</div>
			</div>
			<SheetClose
				class="border-border/60 bg-surface-muted/60 text-muted-foreground duration-subtle ease-market-ease hover:text-foreground rounded-md border p-2 transition-colors"
			>
				<X class="h-4 w-4" />
			</SheetClose>
		</SheetHeader>
		<div class="marketplace-scrollbar max-h-[50vh] space-y-3 overflow-y-auto px-4 py-4">
			{#each messages as message}
				<div class="border-border/50 bg-surface-muted/40 rounded-lg border p-3 text-sm">
					<div class="text-muted-foreground mb-1 flex items-center justify-between text-xs">
						<span class="text-foreground font-medium">{message.user}</span>
						<span>{message.time}</span>
					</div>
					<p class="text-foreground/90 leading-relaxed">{message.message}</p>
				</div>
			{/each}
		</div>
		<SheetFooter class="border-0 px-4 pt-0 pb-4">
			<div class="flex items-center gap-2">
				<input
					bind:value={input}
					onkeydown={(e) => e.key === 'Enter' && sendMessage()}
					type="text"
					placeholder="Type a message..."
					class="border-border/60 bg-surface-muted/60 text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-ring/50 h-11 flex-1 rounded-md border px-3 text-sm focus:ring-2 focus:outline-none"
				/>
				<Button size="sm" class="px-3" on:click={sendMessage}>
					<Send class="h-4 w-4" />
				</Button>
			</div>
		</SheetFooter>
	</SheetContent>
</Sheet>
