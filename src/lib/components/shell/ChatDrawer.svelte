<script lang="ts">
	import { uiStore, closeChat } from '$lib/stores/ui';
	import { Sheet, SheetContent } from '$lib/components/ui';
	import ChatList from '$lib/components/chat/ChatList.svelte';
	import { X } from 'lucide-svelte';

	const uiState = $derived(uiStore);
	const chatOpen = $derived(() => uiState.chatOpen);
</script>

<Sheet open={chatOpen} onOpenChange={(open) => (!open ? closeChat() : undefined)}>
	<SheetContent
		side="bottom"
		class="border-border/50 bg-surface/95 pt-md shadow-elevated-lg max-h-[75vh] w-full translate-y-0 rounded-t-2xl border pb-[env(safe-area-inset-bottom)] backdrop-blur md:max-w-xl"
		labelledby="chat-drawer-title"
	>
		<div class="gap-md px-md mx-auto flex h-full w-full max-w-lg flex-col">
			<div class="bg-border/60 mx-auto h-1.5 w-12 rounded-full" aria-hidden="true"></div>
			<ChatList class="flex-1">
				<svelte:fragment slot="header-action">
					<button
						type="button"
						class="border-border/60 text-muted-foreground hover:text-foreground focus-visible:ring-ring focus-visible:ring-offset-background flex h-9 w-9 items-center justify-center rounded-full border transition focus-visible:ring-2 focus-visible:ring-offset-2"
						onclick={closeChat}
						aria-label="Close chat"
					>
						<X class="h-4 w-4" aria-hidden="true" />
					</button>
				</svelte:fragment>
			</ChatList>
		</div>
	</SheetContent>
</Sheet>
