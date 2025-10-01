<script lang="ts">
	import { page } from '$app/stores';
	import { base } from '$app/paths';
	import AuthButton from '$lib/components/AuthButton.svelte';
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
	import { uiStore, toggleSidebar, type UIState } from '$lib/stores/ui';
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
	} from 'lucide-svelte';
	import { createEventDispatcher } from 'svelte';

	type ShellHeaderProps = {
		promoTicker?: { id: string; label: string; meta: string }[];
		isAuthenticated?: boolean;
		user?: {
			username: string;
			avatar?: string;
			totalWagered: number;
		} | null;
		class?: string;
	};

	const props: ShellHeaderProps = $props();
	const promoTicker = $derived(() => props.promoTicker ?? []);
	const isAuthenticated = $derived(props.isAuthenticated ?? false);
	const user = $derived(props.user ?? null);
	const className = $derived(props.class ?? '');

	let sidebarOpen = $state(false);
	$effect(() => {
		const unsubscribe = uiStore.subscribe(($ui: UIState) => {
			sidebarOpen = $ui.sidebarOpen;
		});
		return unsubscribe;
	});

	let currentPath = $state('/');
	$effect(() => {
		const unsubscribe = page.subscribe(($page) => {
			currentPath = $page.url.pathname;
		});
		return unsubscribe;
	});

	const pageTitle = $derived(() => {
		const pathname = currentPath || '/';
		if (pathname === '/' || pathname === '') return 'Home';
		const segments = pathname.split('/').filter(Boolean);
		if (segments.length === 0) return 'Home';
		const lastSegment = segments[segments.length - 1];
		return lastSegment
			.split('-')
			.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
			.join(' ');
	});

	const homeHref = base ? `${base}/` : '/';
	const dispatch = createEventDispatcher<{ search: string }>();
	let searchValue = $state('');

	const handleSearch = (event: SubmitEvent) => {
		event.preventDefault();
		dispatch('search', searchValue.trim());
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
</script>

<header
	class={cn(
		'relative z-30 border-b border-border/40 bg-surface/90 shadow-marketplace-sm backdrop-blur-xl',
		className
	)}
	style="--shell-header-height: 72px"
>
	<!-- Gradient Bridge Effect -->
	<div class="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent"></div>
	<div class="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-b from-surface-accent/10 to-transparent"></div>

	<!-- Mobile Header -->
	<div class="flex h-[var(--shell-header-height)] items-center justify-between px-4 md:hidden">
		<div class="flex items-center gap-3">
			<button
				type="button"
				class="group duration-accent ease-market-ease flex h-10 w-10 items-center justify-center rounded-xl border border-border/50 bg-surface-muted/70 text-muted-foreground transition-all hover:border-primary/40 hover:bg-surface-muted hover:text-foreground hover:shadow-marketplace-sm focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:outline-none"
				onclick={toggleSidebar}
				aria-expanded={sidebarOpen}
				aria-label="Open navigation"
			>
				<Menu class="h-4 w-4 transition-transform group-hover:scale-110" />
			</button>
			<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
			<a href={homeHref} class="flex items-center gap-2">
				<span
					class="flex h-8 w-8 items-center justify-center rounded-lg border border-primary/50 bg-primary/15 text-sm font-bold text-primary"
				>
					TR
				</span>
				<span class="text-sm font-bold text-foreground">TopRoll</span>
			</a>
		</div>
		<h1 class="text-sm font-bold text-foreground">{pageTitle()}</h1>
		<div class="flex items-center gap-2">
			<button
				type="button"
				class="group duration-accent ease-market-ease flex h-10 w-10 items-center justify-center rounded-xl border border-border/50 bg-surface-muted/70 text-muted-foreground transition-all hover:border-primary/40 hover:bg-surface-muted hover:text-foreground hover:shadow-marketplace-sm focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:outline-none"
				aria-label="Search"
			>
				<Search class="h-4 w-4 transition-transform group-hover:scale-110" />
			</button>
			<button
				type="button"
				class="group duration-accent ease-market-ease flex h-10 w-10 items-center justify-center rounded-xl border border-border/50 bg-surface-muted/70 text-muted-foreground transition-all hover:border-primary/40 hover:bg-surface-muted hover:text-foreground hover:shadow-marketplace-sm focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:outline-none"
				aria-label="Notifications"
			>
				<Bell class="h-4 w-4 transition-transform group-hover:scale-110" />
			</button>
		</div>
	</div>

	<!-- Desktop Header -->
	<div class="hidden h-[var(--shell-header-height)] items-center gap-6 px-8 md:flex lg:px-10">
		<div class="flex items-center gap-3">
			<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
			<a href={homeHref} class="flex items-center gap-2">
				<span
					class="flex h-10 w-10 items-center justify-center rounded-xl border border-primary/50 bg-primary/15 text-sm font-bold text-primary"
				>
					TR
				</span>
				<div class="flex flex-col">
					<span class="text-base font-bold leading-tight text-foreground">TopRoll</span>
					<span class="text-xs font-medium text-muted-foreground">CS2 Marketplace</span>
				</div>
			</a>
		</div>

		<!-- Ticker Chips -->
		<div class="max-w-2xl flex-1">
			<div
				class="scrollbar-hide flex items-center gap-2 overflow-x-auto"
				role="region"
				aria-label="Live promotions"
				aria-live="polite"
			>
				{#each promoTicker as item (item.id)}
					<div
						class="group duration-accent ease-market-ease flex shrink-0 items-center gap-2 rounded-xl border border-border/40 bg-surface-muted/50 px-3 py-2 backdrop-blur-sm transition-all hover:border-primary/30 hover:bg-surface-muted hover:shadow-marketplace-sm"
					>
						<div
							class="flex h-6 w-6 items-center justify-center rounded-lg border border-primary/30 bg-primary/10"
						>
							<svelte:component this={getTickerIcon(item.id)} class="h-3 w-3 text-primary" />
						</div>
						<div class="flex flex-col">
							<span class="text-xs leading-tight font-semibold text-foreground">{item.label}</span>
							<span class="text-[10px] leading-tight text-muted-foreground">{item.meta}</span>
						</div>
					</div>
				{/each}
			</div>
		</div>

		<!-- Search & Actions -->
		<div class="flex items-center gap-4">
			<form
				class="duration-accent ease-market-ease flex items-center gap-3 rounded-xl border border-border/50 bg-surface-muted/60 px-4 py-2.5 transition-all focus-within:border-primary/40 focus-within:bg-surface-muted focus-within:shadow-marketplace-sm hover:border-primary/30"
				onsubmit={handleSearch}
			>
				<Search class="h-4 w-4 text-muted-foreground" />
				<label class="sr-only" for="desktop-search">Search</label>
				<input
					id="desktop-search"
					type="search"
					placeholder="Search cases, skins, or players"
					value={searchValue}
					oninput={handleSearchInput}
					class="min-w-[200px] flex-1 border-0 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/70 focus:outline-none"
				/>
			</form>

			<div class="flex items-center gap-2">
				<button
					type="button"
					class="group duration-accent ease-market-ease flex h-10 w-10 items-center justify-center rounded-xl border border-border/50 bg-surface-muted/70 text-muted-foreground transition-all hover:border-primary/40 hover:bg-surface-muted hover:text-foreground hover:shadow-marketplace-sm focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:outline-none"
					aria-label="Language"
				>
					<Globe class="h-4 w-4 transition-transform group-hover:scale-110" />
				</button>
				<button
					type="button"
					class="group duration-accent ease-market-ease flex h-10 w-10 items-center justify-center rounded-xl border border-border/50 bg-surface-muted/70 text-muted-foreground transition-all hover:border-primary/40 hover:bg-surface-muted hover:text-foreground hover:shadow-marketplace-sm focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:outline-none"
					aria-label="Notifications"
				>
					<Bell class="h-4 w-4 transition-transform group-hover:scale-110" />
				</button>

				{#if isAuthenticated && user}
					<DropdownMenu>
						<DropdownMenuTrigger
							class="group duration-accent ease-market-ease flex items-center gap-3 rounded-xl border border-border/50 bg-surface-muted/70 px-3 py-2 transition-all hover:border-primary/40 hover:bg-surface-muted hover:shadow-marketplace-sm focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:outline-none"
						>
							{#if user.avatar}
								<img src={user.avatar} alt={user.username || 'User'} class="h-8 w-8 rounded-lg object-cover" />
							{:else}
								<div class="flex h-8 w-8 items-center justify-center rounded-lg border border-border/50 bg-surface-muted/80 font-semibold text-muted-foreground">
									{(user.username || 'U').slice(0, 1).toUpperCase()}
								</div>
							{/if}
							<div class="hidden text-left xl:block">
								<p class="text-sm leading-tight font-semibold text-foreground">{user.username || 'User'}</p>
								<p class="text-xs text-muted-foreground">Lvl {Math.floor((user.totalWagered || 0) / 1000) + 1}</p>
							</div>
							<ChevronDown class="duration-accent h-4 w-4 text-muted-foreground transition group-aria-expanded:rotate-180" />
						</DropdownMenuTrigger>
						<DropdownMenuContent class="w-56" align="end">
							<div class="px-3 pt-2 pb-3 text-sm">
								<p class="text-xs tracking-[0.3em] text-muted-foreground uppercase">Signed in</p>
								<p class="font-semibold">{user.username}</p>
							</div>
							<DropdownMenuSeparator />
							<DropdownMenuItem onSelect={() => {}}>Profile</DropdownMenuItem>
							<DropdownMenuItem onSelect={() => {}}>Inventory</DropdownMenuItem>
							<DropdownMenuItem onSelect={() => {}}>Account settings</DropdownMenuItem>
							<DropdownMenuSeparator />
							<DropdownMenuItem class="text-destructive" onSelect={() => {}}>Sign out</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				{:else}
					<form method="POST" action="/api/auth/steam/login">
						<AuthButton class="duration-accent bg-primary text-primary-foreground shadow-marketplace-sm transition-all hover:bg-primary/90 hover:shadow-marketplace-md" />
					</form>
				{/if}
			</div>
		</div>
	</div>
</header>
