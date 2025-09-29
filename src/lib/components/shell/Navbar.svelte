<script lang="ts">
        import {
                Search,
                Bell,
                Menu,
                X,
                ChevronDown,
                MessageCircle,
                ShieldCheck,
                Gift,
                Settings
        } from 'lucide-svelte';
        import AuthButton from '$lib/components/AuthButton.svelte';
        import {
                Button,
                DropdownMenu,
                DropdownMenuTrigger,
                DropdownMenuContent,
                DropdownMenuItem,
                DropdownMenuSeparator
        } from '$lib/components/ui';
        import { cn } from '$lib/utils';
        import { uiStore, toggleChat } from '$lib/stores/ui';

        interface NavbarProps {
                isAuthenticated?: boolean;
                user?: {
                        id: string;
                        steamId: string;
                        username: string;
                        avatar?: string;
                        balance: number;
                        totalWagered: number;
                        totalProfit: number;
                        winRate: number;
                        biggestWin: number;
                        caseBattleWins: number;
                } | null;
                class?: string;
        }

        let { isAuthenticated = false, user, class: className = '' }: NavbarProps = $props();

        const userLevel = $derived(Math.floor((user?.totalWagered || 0) / 1000) + 1);
        const chatOpen = $derived($uiStore.chatOpen);
        let mobileMenuOpen = $state(false);

        const primaryNav = [
                { label: 'Marketplace', href: '/' },
                { label: 'Cases', href: '/cases' },
                { label: 'Battles', href: '/battles' },
                { label: 'Upgrades', href: '/upgrades' },
                { label: 'Rewards', href: '/rewards' }
        ];

        function toggleMobileMenu() {
                mobileMenuOpen = !mobileMenuOpen;
        }
</script>

<nav
        class={cn(
                'border-border/60 bg-surface/80 sticky top-0 z-40 border-b backdrop-blur-xl shadow-[0_1px_0_0_rgba(148,163,184,0.08)]',
                className
        )}
>
        <div class="mx-auto flex w-full max-w-[1600px] flex-col gap-4 px-5 py-3">
                <div class="flex items-center gap-4">
                        <div class="flex flex-1 items-center gap-4">
                                <a
                                        href="/"
                                        class="focus-visible:ring-ring/70 focus-visible:ring-offset-background flex items-center gap-3 text-left focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                                >
                                        <div class="border-primary/40 bg-primary/15 text-primary shadow-marketplace-sm flex h-10 w-10 items-center justify-center rounded-xl border">
                                                <span class="text-lg font-semibold tracking-tight">TR</span>
                                        </div>
                                        <div class="hidden flex-col lg:flex">
                                                <span class="text-sm font-semibold">TopRoll</span>
                                                <span class="text-muted-foreground/70 text-xs uppercase tracking-[0.35em]">Premium CS2</span>
                                        </div>
                                </a>
                                <button
                                        type="button"
                                        class="border-border/60 bg-surface-muted/50 text-muted-foreground duration-subtle ease-market-ease hover:text-foreground focus-visible:ring-ring/60 inline-flex items-center rounded-md border px-3 py-2 text-sm transition-colors focus-visible:ring-2 focus-visible:outline-none lg:hidden"
                                        onclick={toggleMobileMenu}
                                        aria-label="Toggle navigation"
                                        aria-expanded={mobileMenuOpen}
                                        aria-controls="mobile-nav-panel"
                                >
                                        {#if mobileMenuOpen}
                                                <X class="h-4 w-4" />
                                        {:else}
                                                <Menu class="h-4 w-4" />
                                        {/if}
                                </button>

                                <nav class="hidden items-center gap-1 rounded-2xl border border-border/50 bg-surface-muted/40 p-1 lg:flex">
                                        {#each primaryNav as link}
                                                <a
                                                        href={link.href}
                                                        class="text-sm font-medium text-muted-foreground hover:text-foreground focus-visible:ring-ring/60 focus-visible:ring-offset-background rounded-xl px-3 py-2 transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                                                >
                                                        {link.label}
                                                </a>
                                        {/each}
                                </nav>
                        </div>

                        <div class="hidden flex-1 items-center gap-3 xl:flex">
                                <label class="border-border/60 bg-surface-muted/60 text-muted-foreground focus-within:border-primary focus-within:ring-ring/40 flex w-full items-center gap-3 rounded-2xl border px-4 py-2 text-sm focus-within:ring-2">
                                        <Search class="h-4 w-4" />
                                        <input
                                                type="search"
                                                placeholder="Search skins, cases, or players"
                                                class="text-foreground placeholder:text-muted-foreground h-9 flex-1 border-0 bg-transparent text-sm focus:outline-none"
                                        />
                                </label>
                                <button
                                        type="button"
                                        class="border-border/60 bg-surface-muted/50 text-muted-foreground duration-subtle ease-market-ease hover:text-foreground focus-visible:ring-ring/60 focus-visible:ring-offset-background flex h-11 w-11 items-center justify-center rounded-xl border transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                                        aria-label="Notifications"
                                >
                                        <Bell class="h-4 w-4" />
                                </button>
                        </div>

                        <div class="flex flex-1 items-center justify-end gap-3">
                                <div class="border-border/60 bg-surface-muted/50 text-left rounded-2xl border px-4 py-3">
                                        <p class="text-[11px] uppercase tracking-[0.3em] text-muted-foreground">Balance</p>
                                        <p class="text-sm font-semibold text-foreground">{user ? `$${user.balance.toLocaleString()}` : '$0.00'} <span class="text-muted-foreground text-xs font-normal">(demo)</span></p>
                                </div>
                                <button
                                        type="button"
                                        class="border-border/60 bg-surface-muted/50 text-muted-foreground duration-subtle ease-market-ease hover:text-foreground focus-visible:ring-ring/60 focus-visible:ring-offset-background hidden h-11 w-11 items-center justify-center rounded-xl border transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none lg:flex xl:hidden"
                                        aria-label="Toggle live chat"
                                        onclick={toggleChat}
                                        aria-pressed={chatOpen}
                                >
                                        <MessageCircle class="h-4 w-4" />
                                </button>

                                {#if isAuthenticated && user}
                                        <DropdownMenu>
                                                <DropdownMenuTrigger
                                                        class="group border-border/60 bg-surface-muted/40 duration-subtle ease-market-ease hover:border-primary/60 hover:bg-surface-muted/60 focus-visible:ring-ring/70 focus-visible:ring-offset-background inline-flex items-center gap-3 rounded-xl border px-2 py-1.5 transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                                                >
                                                        {#if user.avatar}
                                                                <img src={user.avatar} alt={user.username} class="border-border/50 h-9 w-9 rounded-lg border object-cover" />
                                                        {:else}
                                                                <div class="border-border/60 bg-surface-muted/60 flex h-9 w-9 items-center justify-center rounded-lg border">
                                                                        <ShieldCheck class="text-muted-foreground h-4 w-4" />
                                                                </div>
                                                        {/if}
                                                        <div class="hidden text-left md:block">
                                                                <p class="text-sm font-medium">{user.username}</p>
                                                                <p class="text-muted-foreground text-xs">Level {userLevel}</p>
                                                        </div>
                                                        <ChevronDown class="text-muted-foreground duration-subtle ease-market-ease h-4 w-4 transition-transform group-aria-expanded:rotate-180" />
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent labelledby="user-menu">
                                                        <div class="px-3 pt-1 pb-2">
                                                                <p id="user-menu" class="text-muted-foreground text-xs uppercase tracking-[0.3em]">Signed in as</p>
                                                                <p class="text-sm font-medium">{user.username}</p>
                                                        </div>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem onSelect={() => {}}>Profile Overview</DropdownMenuItem>
                                                        <DropdownMenuItem onSelect={() => {}}>Inventory</DropdownMenuItem>
                                                        <DropdownMenuItem onSelect={() => {}}>Case history</DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem onSelect={() => {}} class="text-destructive">Sign out</DropdownMenuItem>
                                                </DropdownMenuContent>
                                        </DropdownMenu>
                                        <Button variant="secondary" class="hidden lg:flex gap-2">
                                                <Gift class="h-4 w-4" />
                                                Claim rewards
                                        </Button>
                                {:else}
                                        <form method="POST" action="/api/auth/steam/login" class="hidden md:block">
                                                <AuthButton class="bg-primary text-primary-foreground shadow-marketplace-md" />
                                        </form>
                                {/if}
                        </div>
                </div>

                {#if mobileMenuOpen}
                        <div
                                id="mobile-nav-panel"
                                class="border-border/60 bg-surface/80 text-sm rounded-2xl border p-4 shadow-marketplace-md lg:hidden"
                        >
                                <div class="space-y-3">
                                        <label class="border-border/60 bg-surface-muted/60 text-muted-foreground focus-within:border-primary focus-within:ring-ring/40 flex w-full items-center gap-3 rounded-xl border px-3 py-2 text-sm focus-within:ring-2">
                                                <Search class="h-4 w-4" />
                                                <input
                                                        type="search"
                                                        placeholder="Search skins, cases, or players"
                                                        class="text-foreground placeholder:text-muted-foreground h-9 flex-1 border-0 bg-transparent text-sm focus:outline-none"
                                                />
                                        </label>
                                        <div class="grid gap-2">
                                                {#each primaryNav as link}
                                                        <a
                                                                href={link.href}
                                                                class="border-border/60 bg-surface-muted/40 text-foreground rounded-xl border px-3 py-2"
                                                        >
                                                                {link.label}
                                                        </a>
                                                {/each}
                                        </div>
                                        <div class="flex items-center justify-between rounded-xl border border-border/60 bg-surface-muted/40 px-3 py-2">
                                                <div>
                                                        <p class="text-[11px] uppercase tracking-[0.3em] text-muted-foreground">Balance</p>
                                                        <p class="text-sm font-semibold text-foreground">{user ? `$${user.balance.toLocaleString()}` : '$0.00'}</p>
                                                </div>
                                                <button
                                                        type="button"
                                                        class="border-border/60 bg-surface-muted/60 text-muted-foreground duration-subtle ease-market-ease hover:text-foreground focus-visible:ring-ring/60 flex h-10 w-10 items-center justify-center rounded-lg border transition-colors focus-visible:ring-2 focus-visible:outline-none"
                                                        onclick={toggleChat}
                                                >
                                                        <MessageCircle class="h-4 w-4" />
                                                </button>
                                        </div>
                                        {#if !isAuthenticated}
                                                <form method="POST" action="/api/auth/steam/login" class="w-full">
                                                        <AuthButton class="w-full justify-center" />
                                                </form>
                                        {:else}
                                                <Button variant="ghost" class="w-full justify-center gap-2">
                                                        <Settings class="h-4 w-4" />
                                                        Settings
                                                </Button>
                                        {/if}
                                </div>
                        </div>
                {/if}
        </div>
</nav>
