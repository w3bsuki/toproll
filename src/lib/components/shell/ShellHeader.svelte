<script lang="ts">
	import { page } from '$app/stores';
	import AuthButton from '$lib/components/AuthButton.svelte';
	import {
		DropdownMenu,
		DropdownMenuContent,
		DropdownMenuItem,
		DropdownMenuSeparator,
		DropdownMenuTrigger
	} from '$lib/components/ui';
	import { uiStore, toggleSidebar } from '$lib/stores/ui';
	import { cn } from '$lib/utils';
	import { Bell, ChevronDown, Globe, Menu, Megaphone, Search } from 'lucide-svelte';
	import { createEventDispatcher } from 'svelte';

	interface ShellHeaderProps {
		promoTicker: { id: string; label: string; meta: string }[];
		isAuthenticated?: boolean;
		user?: {
			username: string;
			avatar?: string;
			totalWagered: number;
		} | null;
		class?: string;
	}

	let {
		promoTicker,
		isAuthenticated = false,
		user = null,
		class: className = ''
	}: ShellHeaderProps = $props();

	const sidebarOpen = $derived($uiStore.sidebarOpen);
	const pageTitle = $derived(() => {
		const pathname = $page.url.pathname;
		if (pathname === '/' || pathname === '') return 'Home';
		const parts = pathname.split('/').filter(Boolean);
		if (!parts.length) return 'Home';
		const key = parts[0];
		return key.charAt(0).toUpperCase() + key.slice(1).replace(/-/g, ' ');
	});

	const dispatch = createEventDispatcher<{ search: string }>();
	let searchValue = '';

	function handleSearch(event: SubmitEvent) {
		event.preventDefault();
		dispatch('search', searchValue.trim());
	}
</script>

<header
	class={cn(
		'border-border/70 bg-surface/80 relative z-30 flex flex-col border-b backdrop-blur-xl',
		className
	)}
	style="--shell-header-height: 64px"
>
	<div class="flex h-[var(--shell-header-height)] items-center justify-between px-4 xl:hidden">
		<div class="flex items-center gap-3">
			<button
				type="button"
				class="border-border/70 bg-surface-muted/60 text-muted-foreground focus-visible:ring-ring/70 flex h-11 w-11 items-center justify-center rounded-2xl border transition focus-visible:ring-2 focus-visible:outline-none"
				onclick={toggleSidebar}
				aria-expanded={sidebarOpen}
				aria-label="Open navigation"
			>
				<Menu class="h-5 w-5" />
			</button>
			<a href="/" class="flex items-center gap-2">
				<span
					class="border-primary/50 bg-primary/15 text-primary flex h-10 w-10 items-center justify-center rounded-xl border font-semibold"
				>
					TR
				</span>
				<span class="text-sm font-semibold">TopRoll</span>
			</a>
		</div>
		<h1 class="text-base font-semibold">{pageTitle}</h1>
		<div class="flex items-center gap-2">
			<button
				type="button"
				class="border-border/70 bg-surface-muted/60 text-muted-foreground hover:text-foreground focus-visible:ring-ring/70 focus-visible:ring-offset-background flex h-11 w-11 items-center justify-center rounded-2xl border transition focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
				aria-label="Search"
			>
				<Search class="h-4 w-4" />
			</button>
			<button
				type="button"
				class="border-border/70 bg-surface-muted/60 text-muted-foreground hover:text-foreground focus-visible:ring-ring/70 focus-visible:ring-offset-background flex h-11 w-11 items-center justify-center rounded-2xl border transition focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
				aria-label="Notifications"
			>
				<Bell class="h-4 w-4" />
			</button>
		</div>
	</div>

	<div class="hidden h-[var(--shell-header-height)] items-center gap-6 px-6 xl:flex">
		<div class="flex min-w-0 flex-1 items-center gap-4">
			<div
				class="border-border/60 bg-surface-muted/60 text-muted-foreground/80 flex items-center gap-3 rounded-2xl border px-4 py-2"
			>
				<Megaphone class="h-4 w-4" />
				<div class="flex min-w-0 items-center gap-3 overflow-hidden">
					{#each promoTicker as item, index}
						<div
							class="text-muted-foreground flex min-w-0 shrink-0 items-center gap-2 text-xs tracking-[0.35em] uppercase"
						>
							<span class="text-foreground/90 truncate font-medium tracking-normal normal-case"
								>{item.label}</span
							>
							<span class="text-muted-foreground/70 tracking-normal normal-case">{item.meta}</span>
						</div>
						{#if index < promoTicker.length - 1}
							<span class="bg-border/70 h-1.5 w-1.5 rounded-full"></span>
						{/if}
					{/each}
				</div>
			</div>
			<form
				class="border-border/60 bg-surface-muted/50 flex h-12 max-w-xl flex-1 items-center gap-3 rounded-full border px-4"
				onsubmit={handleSearch}
			>
				<Search class="text-muted-foreground h-4 w-4" />
				<label class="sr-only" for="global-search">Search</label>
				<input
					id="global-search"
					type="search"
					placeholder="Search cases, skins, or players"
					bind:value={searchValue}
					class="text-foreground placeholder:text-muted-foreground/80 flex-1 border-0 bg-transparent text-sm font-medium focus:outline-none"
				/>
			</form>
		</div>
		<div class="flex items-center gap-3">
			<button
				type="button"
				class="border-border/60 bg-surface-muted/60 text-muted-foreground hover:text-foreground focus-visible:ring-ring/60 focus-visible:ring-offset-background flex h-11 items-center gap-2 rounded-2xl border px-4 text-sm font-medium transition focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
			>
				<Globe class="h-4 w-4" />
				EN
			</button>
			<button
				type="button"
				class="border-border/60 bg-surface-muted/60 text-muted-foreground hover:text-foreground focus-visible:ring-ring/60 focus-visible:ring-offset-background flex h-11 w-11 items-center justify-center rounded-2xl border transition focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
				aria-label="Notifications"
			>
				<Bell class="h-4 w-4" />
			</button>
			{#if isAuthenticated && user}
				<DropdownMenu>
					<DropdownMenuTrigger
						class="border-border/60 bg-surface-muted/60 hover:border-primary/50 hover:bg-surface-muted/80 focus-visible:ring-ring/70 focus-visible:ring-offset-background flex items-center gap-3 rounded-2xl border px-2 py-1.5 transition focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
					>
						{#if user.avatar}
							<img src={user.avatar} alt={user.username} class="h-9 w-9 rounded-xl object-cover" />
						{:else}
							<div
								class="border-border/60 bg-surface-muted/70 text-muted-foreground flex h-9 w-9 items-center justify-center rounded-xl border font-semibold"
							>
								{user.username.slice(0, 2).toUpperCase()}
							</div>
						{/if}
						<div class="text-left">
							<p class="text-sm leading-tight font-semibold">{user.username}</p>
							<p class="text-muted-foreground text-xs">
								Lvl {Math.floor((user.totalWagered || 0) / 1000) + 1}
							</p>
						</div>
						<ChevronDown
							class="text-muted-foreground h-4 w-4 transition duration-200 group-aria-expanded:rotate-180"
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
				<form method="POST" action="/api/auth/steam/login">
					<AuthButton class="bg-primary text-primary-foreground shadow-marketplace-md" />
				</form>
			{/if}
		</div>
	</div>
</header>
