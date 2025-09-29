<script lang="ts">
	import { get } from 'svelte/store';
	import { uiStore, closeChat } from '$lib/stores/ui';
	import {
		communityMessages,
		pushCommunityMessage,
		rainPot,
		type CommunityMessage,
		type RainPot
	} from '$lib/stores/homepage';
	import { X, Send, MessageCircle, CloudRain, Users } from 'lucide-svelte';
	import { Button, Sheet, SheetContent } from '$lib/components/ui';

	const uiState = $derived(uiStore);
	const chatOpen = $derived(() => uiState.chatOpen);

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

<Sheet open={chatOpen} onOpenChange={(open) => (!open ? closeChat() : undefined)}>
	<SheetContent
		side="bottom"
		class="border-border/40 bg-surface/95 max-h-[75vh] w-full translate-y-0 rounded-t-[32px] border px-0 pt-4 pb-[env(safe-area-inset-bottom)] shadow-[0_-40px_120px_rgba(15,23,42,0.65)] backdrop-blur-xl md:max-w-xl"
		labelledby="chat-drawer-title"
	>
		<div class="mx-auto flex h-full w-full max-w-lg flex-col gap-4 px-4">
			<div class="bg-border/60 mx-auto h-1.5 w-12 rounded-full" aria-hidden="true"></div>
			<header class="flex items-start justify-between gap-3">
				<div class="flex items-center gap-3">
					<span
						class="bg-primary/15 text-primary flex h-11 w-11 items-center justify-center rounded-2xl"
					>
						<MessageCircle class="h-5 w-5" />
					</span>
					<div>
						<h2 id="chat-drawer-title" class="text-base font-semibold">Chat & Rain Pot</h2>
						<p class="text-muted-foreground text-xs">
							Stay current with live drops and floor chatter.
						</p>
					</div>
				</div>
				<button
					type="button"
					class="border-border/60 bg-surface-muted/60 text-muted-foreground hover:text-foreground flex h-10 w-10 items-center justify-center rounded-2xl border transition"
					onclick={closeChat}
					aria-label="Close chat"
				>
					<X class="h-4 w-4" />
				</button>
			</header>

			<section
				class="border-border/40 from-primary/15 via-primary/5 rounded-3xl border bg-gradient-to-br to-transparent p-4 text-sm"
			>
				<div class="flex items-center gap-3">
					<span
						class="border-primary/40 bg-primary/15 text-primary flex h-11 w-11 items-center justify-center rounded-2xl border"
					>
						<CloudRain class="h-4 w-4" />
					</span>
					<div>
						<p class="text-muted-foreground text-[11px] tracking-[0.35em] uppercase">Rain pot</p>
						<p class="text-lg font-semibold">{currentPot.total}</p>
					</div>
				</div>
				<div
					class="text-muted-foreground mt-3 flex items-center justify-between text-[11px] tracking-[0.3em] uppercase"
				>
					<span class="flex items-center gap-2">
						<Users class="h-3.5 w-3.5" />
						{currentPot.contributors} queued
					</span>
					<span>Ends in {currentPot.endsIn}</span>
				</div>
			</section>

			<div class="marketplace-scrollbar flex-1 space-y-3 overflow-y-auto pr-1">
				{#each messages as message (message.id)}
					<article class="border-border/50 bg-surface/70 rounded-2xl border px-4 py-3 text-sm">
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
				class="border-border/60 bg-surface-muted/50 flex items-center gap-2 rounded-3xl border p-2"
				onsubmit={handleSubmit}
			>
				<label class="sr-only" for="chat-input-mobile">Message</label>
				<textarea
					id="chat-input-mobile"
					value={input}
					oninput={handleInput}
					onkeydown={handleKey}
					rows={1}
					placeholder="Drop a message…"
					class="marketplace-scrollbar max-h-24 flex-1 resize-none border-0 bg-transparent px-2 py-1 text-sm focus:outline-none"
				/>
				<Button size="icon" class="h-11 w-11 rounded-2xl" type="submit">
					<Send class="h-4 w-4" />
					<span class="sr-only">Send message</span>
				</Button>
			</form>
		</div>
	</SheetContent>
</Sheet>
