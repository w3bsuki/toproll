<script lang="ts">
	import { Search, Bell, Menu, ChevronDown, MessageCircle, Gift } from 'lucide-svelte';
	import AuthButton from '$lib/components/AuthButton.svelte';
	import {
		DropdownMenu,
		DropdownMenuTrigger,
		DropdownMenuContent,
		DropdownMenuItem,
		DropdownMenuSeparator
	} from '$lib/components/ui';
	import { cn } from '$lib/utils';
	import { uiStore, toggleChat, toggleSidebar } from '$lib/stores/ui';

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

	const primaryNav = [
		{ label: 'Marketplace', href: '/' },
		{ label: 'Cases', href: '/cases' },
		{ label: 'Battles', href: '/battles' },
		{ label: 'Upgrades', href: '/upgrades' },
		{ label: 'Rewards', href: '/rewards' }
	];
</script>

<nav
	class={cn(
		'border-border/60 bg-surface/70 sticky top-0 z-50 w-full border-b shadow-[0_1px_0_rgba(148,163,184,0.15)] backdrop-blur-xl',
		className
	)}
>
	<div class="mx-auto flex w-full max-w-none items-center gap-4 px-4 py-3 sm:px-6 lg:px-8">
		<div class="flex flex-1 items-center gap-3">
			<button
				type="button"
				class="border-border/60 bg-surface-muted/60 text-muted-foreground focus-visible:ring-ring/60 hover:text-foreground inline-flex h-10 w-10 items-center justify-center rounded-xl border transition focus-visible:ring-2 focus-visible:outline-none xl:hidden"
				onclick={toggleSidebar}
				aria-label="Open navigation"
			>
				<Menu class="h-4 w-4" />
			</button>
			<a
				href="/"
				class="focus-visible:ring-ring/70 focus-visible:ring-offset-background flex items-center gap-3 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
			>
				<div
					class="border-primary/50 bg-primary/15 text-primary shadow-marketplace-sm flex h-10 w-10 items-center justify-center rounded-xl border font-semibold"
				>
					TR
				</div>
				<div class="hidden flex-col text-left md:flex">
					<span class="text-sm font-semibold">TopRoll</span>
					<span class="text-muted-foreground/70 text-xs tracking-[0.35em] uppercase"
						>Premium CS2</span
					>
				</div>
			</a>
		</div>

		<div class="hidden flex-1 justify-center xl:flex">
			<nav
				class="border-border/50 bg-surface-muted/40 flex items-center gap-1 rounded-full border px-2 py-1.5"
				aria-label="Global"
			>
				{#each primaryNav as link}
					<a
						href={link.href}
						class="text-muted-foreground hover:text-foreground focus-visible:ring-ring/60 focus-visible:ring-offset-background rounded-full px-4 py-1.5 text-sm font-medium transition focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
					>
						{link.label}
					</a>
				{/each}
			</nav>
		</div>

		<div class="flex flex-1 items-center justify-end gap-2 sm:gap-3">
			<label
				class="border-border/60 bg-surface-muted/60 text-muted-foreground focus-within:border-primary focus-within:ring-ring/40 hidden max-w-sm flex-1 items-center gap-3 rounded-full border px-4 py-2 text-sm focus-within:ring-2 lg:flex"
			>
				<Search class="h-4 w-4" />
				<input
					type="search"
					placeholder="Search skins, cases, or players"
					class="text-foreground placeholder:text-muted-foreground h-8 flex-1 border-0 bg-transparent text-sm focus:outline-none"
				/>
			</label>
			<button
				type="button"
				class="border-border/60 bg-surface-muted/60 text-muted-foreground hover:text-foreground focus-visible:ring-ring/60 focus-visible:ring-offset-background inline-flex h-10 w-10 items-center justify-center rounded-xl border transition focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none lg:hidden"
				aria-label="Search"
			>
				<Search class="h-4 w-4" />
			</button>
			<button
				type="button"
				class="border-border/60 bg-surface-muted/60 text-muted-foreground hover:text-foreground focus-visible:ring-ring/60 focus-visible:ring-offset-background inline-flex h-10 w-10 items-center justify-center rounded-xl border transition focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
				aria-label="Notifications"
			>
				<Bell class="h-4 w-4" />
			</button>
			<button
				type="button"
				class="border-border/60 bg-surface-muted/60 text-muted-foreground hover:text-foreground focus-visible:ring-ring/60 focus-visible:ring-offset-background inline-flex h-10 w-10 items-center justify-center rounded-xl border transition focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none xl:hidden"
				aria-label="Toggle live chat"
				onclick={toggleChat}
				aria-pressed={chatOpen}
			>
				<MessageCircle class="h-4 w-4" />
			</button>

			{#if isAuthenticated && user}
				<DropdownMenu>
					<DropdownMenuTrigger
						class="group border-border/60 bg-surface-muted/50 hover:border-primary/60 hover:bg-surface-muted/70 focus-visible:ring-ring/70 focus-visible:ring-offset-background hidden items-center gap-3 rounded-xl border px-2 py-1.5 text-left transition focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none sm:flex"
					>
						{#if user.avatar}
							<img src={user.avatar} alt={user.username} class="h-9 w-9 rounded-lg object-cover" />
						{:else}
							<div
								class="border-border/60 bg-surface-muted/60 text-muted-foreground flex h-9 w-9 items-center justify-center rounded-lg border"
							>
								<Gift class="h-4 w-4" />
							</div>
						{/if}
						<div class="hidden text-left lg:block">
							<p class="text-sm font-medium">{user.username}</p>
							<p class="text-muted-foreground text-xs">Level {userLevel}</p>
						</div>
						<ChevronDown
							class="text-muted-foreground duration-200 group-aria-expanded:rotate-180"
						/>
					</DropdownMenuTrigger>
					<DropdownMenuContent labelledby="user-menu">
						<div class="px-3 pt-1 pb-2">
							<p id="user-menu" class="text-muted-foreground text-xs tracking-[0.3em] uppercase">
								Signed in as
							</p>
							<p class="text-sm font-medium">{user.username}</p>
						</div>
						<DropdownMenuSeparator />
						<DropdownMenuItem onSelect={() => {}}>Profile overview</DropdownMenuItem>
						<DropdownMenuItem onSelect={() => {}}>Inventory</DropdownMenuItem>
						<DropdownMenuItem onSelect={() => {}}>Case history</DropdownMenuItem>
						<DropdownMenuSeparator />
						<DropdownMenuItem onSelect={() => {}} class="text-destructive"
							>Sign out</DropdownMenuItem
						>
					</DropdownMenuContent>
				</DropdownMenu>
			{:else}
				<form method="POST" action="/api/auth/steam/login" class="hidden sm:block">
					<AuthButton class="bg-primary text-primary-foreground shadow-marketplace-md" />
				</form>
			{/if}
		</div>
	</div>
</nav>
