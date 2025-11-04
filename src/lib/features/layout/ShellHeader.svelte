<script lang="ts">
	// ? NEW: Use $app/state instead of $app/stores
	import { page } from '$app/state';
	import { base } from '$app/paths';
	import { onMount } from 'svelte';
	import SteamAuthButton from '$lib/components/shared/auth/SteamAuthButton.svelte';
	import LiveDropsTicker from '$lib/features/home/LiveDropsTicker.svelte';
	import {
		DropdownMenu,
		DropdownMenuContent,
		DropdownMenuItem,
		DropdownMenuSeparator,
		DropdownMenuTrigger,
		Tabs,
		TabsList,
		TabsTrigger,
		Button
	} from '$lib/components/ui';
	import { Input } from '$lib/components/ui/input';
	// ? NEW: Get UI state from context
	import { getUIState } from '$lib/features/layout/ui-state.svelte';
	import { cn } from '$lib/utils';
	import {
		Bell,
		ChevronDown,
		Gift,
		Globe,
		Menu,
		Search,
		Sparkles,
		Wallet
	} from '@lucide/svelte';

	type ShellHeaderProps = {
		promoTicker?: { id: string; label: string; meta: string }[];
		isAuthenticated?: boolean;
		user?: {
			username: string;
			avatar?: string;
			totalWagered: number;
		} | null;
		class?: string;
		onSearch?: (query: string) => void;
	};

	let {
		promoTicker = [],
		isAuthenticated = false,
		user = null,
		class: className = '',
		onSearch
	}: ShellHeaderProps = $props();

	// ? NEW: Get UI state from context
	const ui = getUIState();

	// ? NEW: Use $derived for current path
	let currentPath = $derived(page.url.pathname);

	const pageTitle = $derived(() => {
		const pathname = currentPath;
		if (pathname === '/') return 'Home';
		const segments = pathname.split('/').filter(Boolean);
		if (segments.length === 0) return 'Home';
		const lastSegment = segments[segments.length - 1];
		return lastSegment
			.split('-')
			.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
			.join(' ');
	});

	const homeHref = base ? `${base}/` : '/';
	let searchValue = $state('');

	const handleSearch = (event: SubmitEvent) => {
		event.preventDefault();
		onSearch?.(searchValue.trim());
	};

	const handleSearchInput = (event: Event) => {
		const target = event.target as HTMLInputElement;
		searchValue = target.value;
	};

	const primaryNav = [
		{ id: 'home', label: 'Home', href: '/' },
		{ id: 'leaderboard', label: 'Leaderboard', href: '/leaderboard' },
		{ id: 'clan', label: 'Clan', href: '/clan' }
	] as const;

	const categoryTabs = [
		{ id: 'live', label: 'Live' },
		{ id: 'slots', label: 'Slots' },
		{ id: 'tournaments', label: 'Tournaments' }
	] as const;

	let activeCategory = $state(categoryTabs[0]?.id ?? 'live');

       const walletBalance = $derived(() => (user?.totalWagered ?? 0) / 2 + 1561);

       let clientReady = $state(false);
       onMount(() => {
	       clientReady = true;
       });

	// Helper to get icon for ticker items
	const getTickerIcon = (id: string) => {
		switch (id) {
			case 'rain-pot':
				return Gift;
			case 'battle-queue':
				return Sparkles;
			case 'flash-drop':
				return Wallet;
			default:
				return Bell;
		}
	};
</script>

<div class={cn('relative', className)} style="--shell-header-height: 72px">
	<!-- Gradient accent at bottom -->
	<div
		class="via-primary/30 absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent to-transparent"
	></div>

	<!-- Mobile Header -->
	<div class="flex h-[var(--shell-header-height)] items-center justify-between px-4 md:hidden">
		<div class="flex items-center gap-3">
			<button
				type="button"
				class="group border-border/50 bg-surface-muted/70 text-muted-foreground focus-visible:ring-primary/50 flex h-10 w-10 items-center justify-center rounded-xl border focus-visible:ring-2 focus-visible:outline-none"
				onclick={() => ui.toggleSidebar()}
				aria-expanded={ui.sidebarOpen}
				aria-label="Open navigation"
			>
				<Menu class="h-4 w-4" />
			</button>
			<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
			<a href={homeHref} class="flex items-center gap-2">
				<span
					class="border-primary/50 bg-primary/15 text-primary flex h-8 w-8 items-center justify-center rounded-lg border text-sm font-bold"
				>
					TR
				</span>
				<span class="text-foreground text-sm font-bold">TopRoll</span>
			</a>
		</div>
		<h1 class="text-foreground text-sm font-bold">{pageTitle()}</h1>
		<div class="flex items-center gap-2">
			<button
				type="button"
				class="group border-border/50 bg-surface-muted/70 text-muted-foreground focus-visible:ring-primary/50 flex h-10 w-10 items-center justify-center rounded-xl border focus-visible:ring-2 focus-visible:outline-none"
				aria-label="Search"
			>
				<Search class="h-4 w-4" />
			</button>
			<button
				type="button"
				class="group border-border/50 bg-surface-muted/70 text-muted-foreground focus-visible:ring-primary/50 flex h-10 w-10 items-center justify-center rounded-xl border focus-visible:ring-2 focus-visible:outline-none"
				aria-label="Notifications"
			>
				<Bell class="h-4 w-4" />
			</button>
		</div>
	</div>

	<!-- Desktop Header -->
	<div class="hidden h-[var(--shell-header-height)] items-center justify-between md:flex">
		<!-- Logo - Left Edge -->
		<div class="flex shrink-0 items-center gap-3 pl-4">
			<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
			<a href={homeHref} class="flex items-center gap-2">
				<span
					class="border-primary/50 bg-primary/15 text-primary flex h-10 w-10 items-center justify-center rounded-xl border text-sm font-bold"
				>
					TR
				</span>
				<div class="flex flex-col">
					<span class="text-foreground text-base leading-tight font-bold">TopRoll</span>
					<span class="text-muted-foreground text-xs font-medium">CS2 Marketplace</span>
				</div>
			</a>
		</div>

		<!-- Ticker Chips - Center -->
		<div class="flex max-w-2xl flex-1 justify-center">
			<div
				class="scrollbar-hide flex items-center gap-2 overflow-x-auto"
				role="region"
				aria-label="Live promotions"
				aria-live="polite"
			>
				{#each promoTicker as item (item?.id)}
					<div
						class="group border-border/40 bg-surface-muted/50 flex shrink-0 items-center gap-2 rounded-xl border px-3 py-2 backdrop-blur-sm"
					>
						<div
							class="border-primary/30 bg-primary/10 flex h-6 w-6 items-center justify-center rounded-lg border"
						>
							{#if getTickerIcon(item?.id)}
								{@const IconComp = getTickerIcon(item?.id)}
								<IconComp class="text-primary h-3 w-3" />
							{/if}
						</div>
						<div class="flex flex-col">
							<span class="text-foreground text-xs leading-tight font-semibold">{item?.label}</span>
							<span class="text-muted-foreground text-[10px] leading-tight">{item?.meta}</span>
						</div>
					</div>
				{/each}
			</div>
		</div>

		<!-- Search & Actions - Right Edge -->
		<div class="flex shrink-0 items-center gap-3 pr-4">
			<form class="relative" onsubmit={handleSearch}>
				<Search class="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
				<label class="sr-only" for="desktop-search">Search</label>
				<Input
					id="desktop-search"
					type="search"
					placeholder="Search cases, skins, or players"
					bind:value={searchValue}
					class="min-w-[240px] pl-9"
				/>
			</form>

			<button
				type="button"
				class="group border-border/50 bg-surface-muted/70 text-muted-foreground focus-visible:ring-primary/50 flex h-10 w-10 items-center justify-center rounded-xl border focus-visible:ring-2 focus-visible:outline-none"
				aria-label="Language"
			>
				<Globe class="h-4 w-4" />
			</button>
			<button
				type="button"
				class="group border-border/50 bg-surface-muted/70 text-muted-foreground focus-visible:ring-primary/50 flex h-10 w-10 items-center justify-center rounded-xl border focus-visible:ring-2 focus-visible:outline-none"
				aria-label="Notifications"
			>
				<Bell class="h-4 w-4" />
			</button>

			<!-- Daily Bonus Button -->
			<button
				type="button"
				class="group border-warning/30 bg-warning/10 text-warning-foreground hover:bg-warning/20 focus-visible:ring-warning/50 flex h-10 items-center justify-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-medium transition-colors focus-visible:ring-2 focus-visible:outline-none"
				aria-label="Claim daily bonus"
			>
				<Gift class="h-4 w-4" />
				<span class="hidden sm:inline">Daily Bonus</span>
			</button>

		       {#if isAuthenticated && user}
			       {#if clientReady}
				       <DropdownMenu>
					       <DropdownMenuTrigger
							class="group border-border/50 bg-surface-muted/70    focus-visible:ring-primary/50 flex items-center gap-3 rounded-xl border px-3 py-2  focus-visible:ring-2 focus-visible:outline-none"
						>
							{#if user.avatar}
								<img
									src={user.avatar}
									alt={user.username || 'User'}
									class="h-8 w-8 rounded-lg object-cover"
								/>
							{:else}
								<div
									class="border-border/50 bg-surface-muted/80 text-muted-foreground flex h-8 w-8 items-center justify-center rounded-lg border font-semibold"
								>
									{(user.username || 'U').slice(0, 1).toUpperCase()}
								</div>
							{/if}
							<div class="hidden text-left xl:block">
								<p class="text-foreground text-sm leading-tight font-semibold">
									{user.username || 'User'}
								</p>
								<p class="text-muted-foreground text-xs">
									Lvl {Math.floor((user.totalWagered || 0) / 1000) + 1}
								</p>
							</div>
							<ChevronDown
								class="duration-accent text-muted-foreground h-4 w-4 transition group-aria-expanded:rotate-180"
							/>
						</DropdownMenuTrigger>
						<DropdownMenuContent class="w-56" align="end">
							<div class="px-3 pt-2 pb-3 text-sm">
								<p class="text-muted-foreground text-xs tracking-[0.3em] uppercase">Signed in</p>
								<p class="font-semibold">{user.username}</p>
							</div>
							<DropdownMenuSeparator />
							<DropdownMenuItem onSelect={() => {}}>Profile</DropdownMenuItem>
							<DropdownMenuItem onSelect={() => {}}>Inventory</DropdownMenuItem>
							<DropdownMenuItem onSelect={() => {}}>Account settings</DropdownMenuItem>
							<DropdownMenuSeparator />
							<DropdownMenuItem class="text-destructive" onSelect={() => {}}
								>Sign out</DropdownMenuItem
							>
						</DropdownMenuContent>
					</DropdownMenu>
			       {:else}
				       <div class="border-border/50 bg-surface-muted/70 flex items-center gap-3 rounded-xl border px-3 py-2">
					       <div class="border-border/50 bg-surface-muted/80 h-8 w-8 rounded-lg"></div>
					       <div class="hidden text-left xl:block">
						       <p class="text-muted-foreground text-sm leading-tight font-semibold">Loading...</p>
						       <p class="text-muted-foreground text-xs">&nbsp;</p>
					       </div>
				       </div>
			       {/if}
			{:else}
				<SteamAuthButton
					class="duration-accent bg-primary text-primary-foreground shadow-marketplace-sm    shrink-0"
				/>
			{/if}
		</div>
	</div>

	<!-- Live Drops Ticker (below main header) -->
	<div class="border-border/40 bg-surface/30 border-y backdrop-blur-sm">
		<LiveDropsTicker />
	</div>
</div>

