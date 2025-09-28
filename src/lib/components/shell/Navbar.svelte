<script lang="ts">
	import { Search, Bell, Settings, User, Crown, Gift, Menu, X, ChevronDown } from 'lucide-svelte';
	import AuthButton from '$lib/components/AuthButton.svelte';
	import {
		Button,
		Badge,
		DropdownMenu,
		DropdownMenuTrigger,
		DropdownMenuContent,
		DropdownMenuItem,
		DropdownMenuSeparator
	} from '$lib/components/ui';
	import { cn } from '$lib/utils';

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
	let mobileMenuOpen = $state(false);

	function toggleMobileMenu() {
		mobileMenuOpen = !mobileMenuOpen;
		if ('vibrate' in navigator) {
			navigator.vibrate(8);
		}
	}
</script>

<nav
	class={cn(
		'border-border/60 bg-surface/70 duration-subtle ease-market-ease sticky top-0 z-30 border-b px-4 py-3 backdrop-blur-lg transition-colors',
		className
	)}
>
	<div class="mx-auto flex max-w-7xl items-center gap-4">
		<div class="flex flex-1 items-center gap-3">
			<a href="/" class="flex items-center gap-2 text-left">
				<div
					class="border-primary/40 bg-primary/15 text-primary shadow-marketplace-sm flex h-9 w-9 items-center justify-center rounded-lg border"
				>
					<span class="text-lg font-semibold tracking-tight">T</span>
				</div>
				<div class="hidden flex-col sm:flex">
					<span class="text-muted-foreground text-sm font-medium">TopRoll</span>
					<span class="text-muted-foreground/70 text-xs tracking-[0.3em] uppercase"
						>Marketplace</span
					>
				</div>
			</a>
			<button
				class="border-border/60 bg-surface-muted/50 text-muted-foreground duration-subtle ease-market-ease hover:text-foreground focus-visible:ring-ring/60 inline-flex items-center rounded-md border px-3 py-2 text-sm transition-colors focus-visible:ring-2 focus-visible:outline-none sm:hidden"
				on:click={toggleMobileMenu}
				aria-label="Toggle navigation"
			>
				{#if mobileMenuOpen}
					<X class="h-4 w-4" />
				{:else}
					<Menu class="h-4 w-4" />
				{/if}
			</button>
		</div>

		<div class="hidden flex-1 items-center gap-3 lg:flex">
			<label
				class="border-border/60 bg-surface-muted/60 text-muted-foreground focus-within:border-primary focus-within:ring-ring/40 flex w-full max-w-sm items-center gap-2 rounded-md border px-3 py-2 text-sm focus-within:ring-2"
			>
				<Search class="text-muted-foreground h-4 w-4" />
				<input
					type="text"
					placeholder="Search skins, cases, players"
					class="text-foreground placeholder:text-muted-foreground h-8 flex-1 border-0 bg-transparent text-sm focus:outline-none"
				/>
			</label>
			<Button variant="outline" class="gap-2">
				<Settings class="h-4 w-4" />
				Settings
			</Button>
		</div>

		<div class="hidden flex-1 items-center justify-end gap-4 lg:flex">
			{#if !isAuthenticated}
				<AuthButton class="hidden lg:inline-flex" />
			{:else if user}
				<div class="flex items-center gap-3">
					<Button variant="secondary" class="gap-2">
						<Crown class="h-4 w-4" />
						VIP Lounge
					</Button>
					<Button class="gap-2">
						<Gift class="h-4 w-4" />
						Deposit
					</Button>
					<div class="flex flex-col text-right">
						<span class="text-muted-foreground text-xs tracking-wide uppercase">Balance</span>
						<span class="text-primary text-lg font-semibold">${user.balance.toLocaleString()}</span>
					</div>
					<DropdownMenu>
						<DropdownMenuTrigger
							class="group border-border/60 bg-surface-muted/40 duration-subtle ease-market-ease hover:border-primary/60 hover:bg-surface-muted/60 inline-flex items-center gap-3 rounded-md border px-2 py-1.5 transition-colors"
						>
							{#if user.avatar}
								<img
									src={user.avatar}
									alt={user.username}
									class="border-border/50 h-8 w-8 rounded-md border object-cover"
								/>
							{:else}
								<div
									class="border-border/60 bg-surface-muted/60 flex h-8 w-8 items-center justify-center rounded-md border"
								>
									<User class="text-muted-foreground h-4 w-4" />
								</div>
							{/if}
							<div class="hidden text-left md:block">
								<p class="text-foreground text-sm leading-tight font-medium">{user.username}</p>
								<p class="text-muted-foreground text-xs">Level {userLevel}</p>
							</div>
							<ChevronDown
								class="text-muted-foreground duration-subtle ease-market-ease h-4 w-4 transition-transform group-aria-expanded:rotate-180"
							/>
						</DropdownMenuTrigger>
						<DropdownMenuContent labelledby="user-menu">
							<div class="px-3 pt-1 pb-2">
								<p id="user-menu" class="text-muted-foreground text-xs tracking-wide uppercase">
									Signed in as
								</p>
								<p class="text-foreground text-sm font-medium">{user.username}</p>
							</div>
							<DropdownMenuSeparator />
							<DropdownMenuItem onSelect={() => {}}>Profile Overview</DropdownMenuItem>
							<DropdownMenuItem onSelect={() => {}}>Inventory</DropdownMenuItem>
							<DropdownMenuItem onSelect={() => {}}>Case history</DropdownMenuItem>
							<DropdownMenuSeparator />
							<DropdownMenuItem onSelect={() => {}} class="text-destructive">
								Sign out
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
					<button
						class="border-border/60 bg-surface-muted/50 text-muted-foreground duration-subtle ease-market-ease hover:text-foreground focus-visible:ring-ring/60 relative flex h-11 w-11 items-center justify-center rounded-md border transition-colors focus-visible:ring-2 focus-visible:outline-none"
					>
						<Bell class="h-4 w-4" />
						<span
							class="bg-destructive absolute top-2 right-2 flex h-2.5 w-2.5 items-center justify-center rounded-full"
						></span>
					</button>
				</div>
			{/if}
		</div>
	</div>

	{#if mobileMenuOpen}
		<div class="lg:hidden">
			<div
				class="border-border/60 bg-surface shadow-marketplace-lg mt-4 space-y-6 rounded-lg border p-4"
			>
				<label
					class="border-border/60 bg-surface-muted/60 text-muted-foreground focus-within:border-primary focus-within:ring-ring/40 flex items-center gap-2 rounded-md border px-3 py-2 text-sm focus-within:ring-2"
				>
					<Search class="text-muted-foreground h-4 w-4" />
					<input
						type="text"
						placeholder="Search skins, cases, players"
						class="text-foreground placeholder:text-muted-foreground h-8 flex-1 border-0 bg-transparent text-sm focus:outline-none"
					/>
				</label>
				{#if !isAuthenticated}
					<div class="flex flex-col gap-3">
						<AuthButton />
						<Button variant="outline" class="w-full">Explore Marketplace</Button>
					</div>
				{:else if user}
					<div class="space-y-4">
						<div class="flex items-center gap-3">
							{#if user.avatar}
								<img
									src={user.avatar}
									alt={user.username}
									class="border-border/50 h-12 w-12 rounded-lg border object-cover"
								/>
							{:else}
								<div
									class="border-border/60 bg-surface-muted/60 flex h-12 w-12 items-center justify-center rounded-lg border"
								>
									<User class="text-muted-foreground h-5 w-5" />
								</div>
							{/if}
							<div>
								<p class="text-foreground font-medium">{user.username}</p>
								<Badge variant="outline">Level {userLevel}</Badge>
							</div>
						</div>
						<div class="border-border/60 bg-surface-muted/50 rounded-lg border p-4 text-sm">
							<div class="flex items-center justify-between">
								<span class="text-muted-foreground">Balance</span>
								<span class="text-primary font-semibold">${user.balance.toLocaleString()}</span>
							</div>
							<div class="text-muted-foreground mt-2 grid grid-cols-2 gap-2 text-xs">
								<div>
									<p class="text-muted-foreground/70">Total wagered</p>
									<p class="text-foreground font-medium">${user.totalWagered.toLocaleString()}</p>
								</div>
								<div>
									<p class="text-muted-foreground/70">Win rate</p>
									<p class="text-success font-medium">{user.winRate}%</p>
								</div>
							</div>
						</div>
						<div class="grid gap-2">
							<Button class="w-full gap-2">
								<Gift class="h-4 w-4" />
								Deposit Funds
							</Button>
							<Button variant="secondary" class="w-full gap-2">
								<Crown class="h-4 w-4" />
								VIP Lounge
							</Button>
						</div>
						<div class="text-muted-foreground grid gap-2 text-sm">
							<a
								href="/profile"
								class="duration-subtle ease-market-ease hover:border-border/60 hover:text-foreground rounded-md border border-transparent px-3 py-2 transition-colors"
								>Profile</a
							>
							<a
								href="/inventory"
								class="duration-subtle ease-market-ease hover:border-border/60 hover:text-foreground rounded-md border border-transparent px-3 py-2 transition-colors"
								>Inventory</a
							>
							<a
								href="/cases"
								class="duration-subtle ease-market-ease hover:border-border/60 hover:text-foreground rounded-md border border-transparent px-3 py-2 transition-colors"
								>Case history</a
							>
						</div>
					</div>
				{/if}
			</div>
		</div>
	{/if}
</nav>
