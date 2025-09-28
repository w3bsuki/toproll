<script lang="ts">
	import { uiStore, closeChat } from '$lib/stores/ui';
	import { X, Send, MessageCircle } from 'lucide-svelte';
	import { getSupabaseClient } from '$lib/supabase/client';
	import { onDestroy } from 'svelte';

	interface ChatDrawerProps {
		class?: string;
	}

	let { class: className }: ChatDrawerProps = $props();

	const chatOpen = $derived($uiStore.chatOpen);

	type ChatMessage = { id: string; user: string; message: string; time: string };
	let messages = $state<ChatMessage[]>([]);
	let input = $state('');
	const supabase = getSupabaseClient();

	// Subscribe to realtime channel "public:chat_messages"
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
		} catch (_) {
			// ignore
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

<!-- Desktop: Right Panel (Always visible) -->
<aside class="hidden w-80 flex-col border-l border-base-300 bg-base-100 md:flex {className}">
	<!-- Header -->
	<div class="flex items-center justify-between border-b border-base-300 p-4">
		<div class="flex items-center gap-2">
			<MessageCircle class="h-5 w-5" />
			<h2 class="font-semibold">Chat</h2>
			<span class="rounded-full bg-base-200 p-2 text-xs text-base-content/70">24 online</span>
		</div>
	</div>

	<!-- Messages -->
	<div class="flex-1 space-y-3 overflow-y-auto p-4">
		{#each messages as message}
			<div class="card bg-base-100 shadow-sm">
				<div class="card-body p-3">
					<div class="mb-1 flex items-start justify-between text-xs text-base-content/70">
						<span class="font-medium text-base-content">{message.user}</span>
						<span>{message.time}</span>
					</div>
					<p class="text-sm">{message.message}</p>
				</div>
			</div>
		{/each}
	</div>

	<!-- Input -->
	<div class="border-t border-base-300 p-4">
		<div class="flex gap-2">
			<input
				bind:value={input}
				onkeydown={(e) => e.key === 'Enter' && sendMessage()}
				type="text"
				placeholder="Type a message..."
				class="input-bordered input flex-1"
			/>
			<button class="btn btn-sm btn-primary" aria-label="Send message" onclick={sendMessage}>
				<Send class="h-4 w-4" />
			</button>
		</div>
	</div>
</aside>

<!-- Mobile: DaisyUI Modal -->
{#if chatOpen}
	<div class="modal-open modal md:hidden">
		<div class="modal-box flex h-[80vh] max-w-full flex-col">
			<!-- Header -->
			<div class="flex items-center justify-between border-b border-base-300 pb-4">
				<div class="flex items-center gap-2">
					<MessageCircle class="h-5 w-5" />
					<h2 class="font-semibold">Chat</h2>
					<span class="rounded-full bg-base-200 p-2 text-xs text-base-content/70">24 online</span>
				</div>
				<button class="btn btn-circle btn-sm" onclick={closeChat}>
					<X class="h-4 w-4" />
				</button>
			</div>
			<p class="mt-2 text-sm text-base-content/70">Join the conversation with other players</p>

			<!-- Messages -->
			<div class="flex-1 space-y-3 overflow-y-auto py-4">
				{#each messages as message}
					<div class="card bg-base-100 shadow-sm">
						<div class="card-body p-3">
							<div class="mb-1 flex items-start justify-between text-xs text-base-content/70">
								<span class="font-medium text-base-content">{message.user}</span>
								<span>{message.time}</span>
							</div>
							<p class="text-sm">{message.message}</p>
						</div>
					</div>
				{/each}
			</div>

			<!-- Input -->
			<div class="border-t border-base-300 pt-4">
				<div class="flex gap-2">
					<input
						bind:value={input}
						onkeydown={(e) => e.key === 'Enter' && sendMessage()}
						type="text"
						placeholder="Type a message..."
						class="input-bordered input flex-1"
					/>
					<button class="btn btn-sm btn-primary" aria-label="Send message" onclick={sendMessage}>
						<Send class="h-4 w-4" />
					</button>
				</div>
			</div>
		</div>
		<div class="modal-backdrop" onclick={closeChat}></div>
	</div>
{/if}
