<script lang="ts">
        import { communityMessages, pushCommunityMessage, rainPot } from '$lib/stores/homepage';
        import { Button } from '$lib/components/ui';
        import { CloudRain, Send, Users } from 'lucide-svelte';

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

<aside class="hidden xl:flex xl:w-[320px] xl:flex-col xl:border-l xl:border-border/60 xl:bg-surface/70 xl:backdrop-blur-sm">
        <div class="border-border/60 flex items-center justify-between border-b px-5 py-4">
                <div>
                        <p class="text-xs uppercase tracking-[0.3em] text-muted-foreground">Community</p>
                        <p class="text-sm font-semibold">Live chat feed</p>
                </div>
                <span class="border-primary/60 bg-primary/10 text-primary flex h-9 w-9 items-center justify-center rounded-xl border font-semibold">
                        💬
                </span>
        </div>

        <div class="border-border/60 mx-5 mt-5 rounded-2xl border bg-gradient-to-br from-primary/25 via-primary/10 to-transparent p-4 shadow-[0_18px_40px_rgba(59,130,246,0.15)]">
                <div class="flex items-center gap-3">
                        <span class="border-white/40 bg-white/20 flex h-11 w-11 items-center justify-center rounded-xl border">
                                <CloudRain class="h-5 w-5" />
                        </span>
                        <div>
                                <p class="text-xs uppercase tracking-[0.3em] text-white/70">Rain pot</p>
                                <p class="text-lg font-semibold text-white">{currentPot.total}</p>
                        </div>
                </div>
                <div class="mt-4 flex items-center justify-between text-white/75">
                        <div class="flex items-center gap-2 text-xs uppercase tracking-[0.3em]">
                                <Users class="h-3.5 w-3.5" />
                                {currentPot.contributors} in
                        </div>
                        <span class="text-xs uppercase tracking-[0.3em]">Ends in {currentPot.endsIn}</span>
                </div>
        </div>

        <div class="marketplace-scrollbar mt-6 flex-1 space-y-3 overflow-y-auto px-5">
                {#each messages as message}
                        <article class="border-border/60 bg-surface-muted/40 rounded-2xl border px-4 py-3 text-sm">
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

        <div class="border-border/60 border-t px-5 py-4">
                <form class="flex items-center gap-2" onsubmit={handleSubmit}>
                        <label class="sr-only" for="community-message">Message</label>
                        <input
                                id="community-message"
                                class="border-border/60 bg-surface-muted/50 text-foreground placeholder:text-muted-foreground h-11 flex-1 rounded-xl border px-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/50"
                                placeholder="Share a drop..."
                                bind:value={input}
                                onkeydown={handleKey}
                        />
                        <Button size="sm" class="px-3" type="submit">
                                <Send class="h-4 w-4" />
                                <span class="sr-only">Send</span>
                        </Button>
                </form>
        </div>
</aside>
