<script lang="ts">
	import { get } from 'svelte/store';
	import { uiStore, closeChat } from '$lib/stores/ui';
	import { Sheet, SheetContent } from '$lib/components/ui';
	import ChatList from '$lib/components/chat/ChatList.svelte';
	import ChatComposer from '$lib/components/chat/ChatComposer.svelte';
	import { MessageCircle, CloudRain, Users, X } from 'lucide-svelte';
	import {
		communityMessages,
		pushCommunityMessage,
		rainPot,
		type CommunityMessage,
		type RainPot
	} from '$lib/stores/homepage';

	const uiState = $derived(uiStore);
	const chatOpen = $derived(() => uiState.chatOpen);

	let messages = $state<CommunityMessage[]>(get(communityMessages));
	let currentPot = $state<RainPot>(get(rainPot));
	let composerValue = $state('');

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

	const sendMessage = (value: string) => {
		const trimmed = value.trim();
		if (!trimmed) return;
		pushCommunityMessage({ username: 'Guest', message: trimmed });
	};

	const handleComposerSubmit = (event: CustomEvent<string>) => {
		sendMessage(event.detail);
		composerValue = '';
	};

	const handleComposerInput = (event: CustomEvent<string>) => {
		composerValue = event.detail;
	};

	const handleOpenChange = (open: boolean) => {
		if (!open) {
			closeChat();
		}
	};
</script>

<Sheet open={chatOpen} onOpenChange={handleOpenChange}>
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
						<h2 id="chat-drawer-title" class="text-base font-semibold">Chat &amp; Rain Pot</h2>
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
						class="border-border/60 bg-primary/15 text-primary flex h-11 w-11 items-center justify-center rounded-2xl border"
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

			<ChatList {messages} variant="surface" ariaLive="polite" class="flex-1" />

			<ChatComposer
				id="chat-input-mobile"
				value={composerValue}
				on:input={handleComposerInput}
				on:submit={handleComposerSubmit}
				placeholder="Drop a message…"
				variant="surface"
			/>
		</div>
	</SheetContent>
</Sheet>
