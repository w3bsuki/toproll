<script lang="ts">
	// ? NEW: Use $app/state instead of $app/stores
	import { page } from '$app/state';
	import { base } from '$app/paths';
	import SteamAuthButton from '$lib/components/shared/auth/SteamAuthButton.svelte';
	import LiveDropsTicker from '$lib/features/home/LiveDropsTicker.svelte';
	import {
		DropdownMenuContent,
		DropdownMenuItem,
		DropdownMenuSeparator,
		DropdownMenuTrigger
	} from '$lib/components/ui/dropdown-menu';
	import { DropdownMenu } from '$lib/components/ui/dropdown-menu';
	import { Input } from '$lib/components/ui/input';
	// ? NEW: Get UI state from context
	import { getUIState } from '$lib/features/layout/ui-state.svelte';
	import { cn } from '$lib/utils';
	import { browser } from '$app/environment';
	import {
		Bell,
		ChevronDown,
		Gift,
		Globe,
		Menu,
		Search
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

       const walletBalance = $derived(() => (user?.totalWagered ?? 0) / 2 + 1561);
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

			<!-- Notifications Dropdown -->
			{#if browser}
				<DropdownMenu>
					<DropdownMenuTrigger
						class="group border-border/50 bg-surface-muted/70 text-muted-foreground hover:text-foreground focus-visible:ring-primary/50 flex h-10 w-10 items-center justify-center rounded-xl border focus-visible:ring-2 focus-visible:outline-none transition-colors"
						aria-label="Notifications"
					>
						<Bell class="h-4 w-4" />
					</DropdownMenuTrigger>
					<DropdownMenuContent class="w-80" align="end">
						<div class="px-3 pt-2 pb-3">
							<p class="text-sm font-semibold">Notifications</p>
							<p class="text-muted-foreground text-xs">You have 3 new notifications</p>
						</div>
						<DropdownMenuSeparator />
						<DropdownMenuItem onSelect={() => {}}>
							<div class="flex flex-col gap-1">
								<p class="text-sm font-semibold">Rain pot nearly full</p>
								<p class="text-muted-foreground text-xs">$12.4k pool • 8 slots left</p>
							</div>
						</DropdownMenuItem>
						<DropdownMenuItem onSelect={() => {}}>
							<div class="flex flex-col gap-1">
								<p class="text-sm font-semibold">VIP battle lobby</p>
								<p class="text-muted-foreground text-xs">Avg pot $3.2k • invite only</p>
							</div>
						</DropdownMenuItem>
						<DropdownMenuItem onSelect={() => {}}>
							<div class="flex flex-col gap-1">
								<p class="text-sm font-semibold">Flash drop finale</p>
								<p class="text-muted-foreground text-xs">Boosted odds end in 2m</p>
							</div>
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			{:else}
				<button
					type="button"
					class="group border-border/50 bg-surface-muted/70 text-muted-foreground hover:text-foreground focus-visible:ring-primary/50 flex h-10 w-10 items-center justify-center rounded-xl border focus-visible:ring-2 focus-visible:outline-none transition-colors"
					aria-label="Notifications"
				>
					<Bell class="h-4 w-4" />
				</button>
			{/if}

			<!-- Daily Bonus Button - ENHANCED with gold gradient -->
			<button
				type="button"
				class="group relative flex h-11 items-center justify-center gap-2 overflow-hidden rounded-xl px-4 py-2 text-sm font-bold transition-all hover:scale-105 focus-visible:ring-2 focus-visible:ring-warning focus-visible:outline-none shadow-lg hover:shadow-xl"
				style="background: linear-gradient(135deg, oklch(0.78 0.16 70) 0%, oklch(0.72 0.14 60) 100%); color: oklch(0.2 0.01 70);"
				aria-label="Claim daily bonus"
			>
				<Gift class="h-5 w-5" />
				<span class="font-extrabold">Daily Bonus</span>
				<div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
			</button>

		       {#if isAuthenticated && user}
			       {#if browser}
				       <DropdownMenu>
					       <DropdownMenuTrigger
						       class="group border-border/50 bg-surface-muted/70 focus-visible:ring-primary/50 flex items-center gap-3 rounded-xl border px-3 py-2 focus-visible:ring-2 focus-visible:outline-none"
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
				       <button
					       class="group border-border/50 bg-surface-muted/70 focus-visible:ring-primary/50 flex items-center gap-3 rounded-xl border px-3 py-2 focus-visible:ring-2 focus-visible:outline-none"
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
				       </button>
			       {/if}
			{:else}
				<SteamAuthButton
					class="duration-accent bg-primary text-primary-foreground shadow-marketplace-sm    shrink-0"
				/>
			{/if}
		</div>
	</div>

	<!-- Live Drops Ticker -->
	<div class="border-border/40 bg-surface/30 border-b backdrop-blur-sm">
		<LiveDropsTicker />
	</div>
</div>

