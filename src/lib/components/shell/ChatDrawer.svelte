<script lang="ts">
        import { uiStore, closeChat } from '$lib/stores/ui';
        import { communityMessages, pushCommunityMessage, rainPot } from '$lib/stores/homepage';
        import { X, Send, MessageCircle, CloudRain, Users } from 'lucide-svelte';
        import { Button, Sheet, SheetContent, SheetHeader, SheetFooter, SheetClose } from '$lib/components/ui';

        const chatOpen = $derived($uiStore.chatOpen);
        const messages = $derived($communityMessages);
        const currentPot = $derived($rainPot);
        let input = $state('');

        function sendMessage() {
                const trimmed = input.trim();
                if (!trimmed) return;
                pushCommunityMessage({ username: 'Guest', message: trimmed });
                input = '';
        }

        function handleSubmit(event: SubmitEvent) {
                event.preventDefault();
                sendMessage();
        }

        function handleKey(event: KeyboardEvent) {
                if (event.key === 'Enter' && !event.shiftKey) {
                        event.preventDefault();
                        sendMessage();
                }
        }
</script>

<Sheet open={chatOpen} onOpenChange={(open) => (!open ? closeChat() : undefined)}>
        <SheetContent side="bottom" class="md:max-w-lg" labelledby="chat-drawer-title">
                <SheetHeader class="items-start gap-3">
                        <div class="flex w-full items-center gap-3">
                                <span class="border-primary/50 bg-primary/15 text-primary flex h-10 w-10 items-center justify-center rounded-md border">
                                        <MessageCircle class="h-4 w-4" />
                                </span>
                                <div class="flex-1">
                                        <h2 id="chat-drawer-title" class="text-foreground text-base font-semibold">
                                                Community Chat
                                        </h2>
                                        <p class="text-muted-foreground text-xs">Stay connected with the trading floor.</p>
                                </div>
                                <SheetClose
                                        class="border-border/60 bg-surface-muted/60 text-muted-foreground duration-subtle ease-market-ease hover:text-foreground focus-visible:ring-ring/70 focus-visible:ring-offset-background rounded-md border p-2 transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                                >
                                        <X class="h-4 w-4" />
                                </SheetClose>
                        </div>
                        <div class="border-border/60 flex w-full items-center justify-between rounded-xl border bg-gradient-to-r from-primary/25 via-primary/10 to-transparent px-4 py-3">
                                <div class="flex items-center gap-3">
                                        <span class="border-white/30 bg-white/10 flex h-10 w-10 items-center justify-center rounded-lg border">
                                                <CloudRain class="h-4 w-4" />
                                        </span>
                                        <div>
                                                <p class="text-xs uppercase tracking-[0.3em] text-white/70">Rain pot</p>
                                                <p class="text-sm font-semibold text-white">{currentPot.total}</p>
                                        </div>
                                </div>
                                <div class="flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-white/70">
                                        <Users class="h-3.5 w-3.5" />
                                        {currentPot.contributors}
                                        <span class="ml-2">Ends in {currentPot.endsIn}</span>
                                </div>
                        </div>
                </SheetHeader>
                <div class="marketplace-scrollbar max-h-[45vh] space-y-3 overflow-y-auto px-1 py-4">
                        {#each messages as message}
                                <article class="border-border/60 bg-surface-muted/40 rounded-xl border px-4 py-3 text-sm">
                                        <div class="mb-1 flex items-center justify-between text-xs text-muted-foreground">
                                                <div class="flex items-center gap-2">
                                                        <span class="text-foreground font-medium">{message.username}</span>
                                                        {#if message.badge}
                                                                <span class={`rounded-full px-2 py-0.5 text-[10px] uppercase tracking-[0.3em] ${
                                                                        message.badge === 'vip'
                                                                                ? 'bg-primary/20 text-primary'
                                                                                : message.badge === 'staff'
                                                                                        ? 'bg-accent/20 text-accent-foreground'
                                                                                        : 'bg-secondary/20 text-secondary-foreground'
                                                                }`}
                                                                >{message.badge}</span
                                                                >
                                                        {/if}
                                                </div>
                                                <span>{message.timestamp}</span>
                                        </div>
                                        <p class="leading-relaxed text-foreground/90">{message.message}</p>
                                </article>
                        {/each}
                </div>
                <SheetFooter class="border-0 px-1 pt-0 pb-2">
                        <form class="flex items-center gap-2" onsubmit={handleSubmit}>
                                <label class="sr-only" for="chat-input-mobile">Message</label>
                                <input
                                        id="chat-input-mobile"
                                        bind:value={input}
                                        onkeydown={handleKey}
                                        type="text"
                                        placeholder="Type a message..."
                                        class="border-border/60 bg-surface-muted/60 text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-ring/50 h-11 flex-1 rounded-md border px-3 text-sm focus:ring-2 focus:outline-none"
                                />
                                <Button size="sm" class="px-3" type="submit">
                                        <Send class="h-4 w-4" />
                                </Button>
                        </form>
                </SheetFooter>
        </SheetContent>
</Sheet>
