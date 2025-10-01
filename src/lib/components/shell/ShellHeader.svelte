<script lang="ts">
	import { page } from '$app/stores';
	import { base } from '$app/paths';
	import AuthButton from '$lib/components/AuthButton.svelte';
	import { Button } from '$lib/components/ui';
	import { uiStore, toggleSidebar } from '$lib/stores/ui';
	import { cn } from '$lib/utils';
	import { Bell, Menu, Search } from 'lucide-svelte';

	type TickerItem = { id: string; label: string; meta: string };

	type Props = {
		promoTicker?: TickerItem[];
		isAuthenticated?: boolean;
		user?: { username: string } | null;
		class?: string;
	};

	const props = $props<Props>();
	const promoTicker = $derived(() => props.promoTicker ?? []);
	const isAuthenticated = $derived(props.isAuthenticated ?? false);
	const user = $derived(props.user ?? null);
	const className = $derived(props.class ?? '');

	let sidebarOpen = $state(false);
	$effect(() => {
		const unsubscribe = uiStore.subscribe(($ui) => {
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
		if (!segments.length) return 'Home';
		const last = segments.at(-1) ?? 'Home';
		return last
			.split('-')
			.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
			.join(' ');
	});

	const homeHref = base ? `${base}/` : '/';
</script>

<header
	class={cn(
		'border-border/60 bg-surface/90 flex h-[var(--size-header)] items-center border-b px-4 backdrop-blur sm:px-6 lg:px-8',
		className
	)}
	aria-label="Application shell header"
>
	<div class="gap-md flex w-full items-center justify-between lg:hidden">
		<button
			type="button"
			class="border-border/60 bg-surface-subdued/70 text-muted-foreground hover:text-foreground focus-visible:ring-ring focus-visible:ring-offset-background flex h-11 w-11 items-center justify-center rounded-xl border transition focus-visible:ring-2 focus-visible:ring-offset-2"
			onclick={toggleSidebar}
			aria-label="Open navigation"
			aria-expanded={sidebarOpen}
		>
			<Menu class="h-4 w-4" aria-hidden="true" />
		</button>
		<div class="gap-sm flex items-center">
			<a href={homeHref} class="gap-sm text-foreground flex items-center text-sm font-semibold">
				<span
					class="border-primary/40 bg-primary/15 text-primary flex h-9 w-9 items-center justify-center rounded-lg border"
				>
					TR
				</span>
				{pageTitle()}
			</a>
		</div>
		<div class="gap-xs flex items-center">
			<button
				type="button"
				class="border-border/60 text-muted-foreground hover:text-foreground focus-visible:ring-ring focus-visible:ring-offset-background flex h-11 w-11 items-center justify-center rounded-xl border transition focus-visible:ring-2 focus-visible:ring-offset-2"
				aria-label="Search"
			>
				<Search class="h-4 w-4" aria-hidden="true" />
			</button>
			<button
				type="button"
				class="border-border/60 text-muted-foreground hover:text-foreground focus-visible:ring-ring focus-visible:ring-offset-background flex h-11 w-11 items-center justify-center rounded-xl border transition focus-visible:ring-2 focus-visible:ring-offset-2"
				aria-label="Notifications"
			>
				<Bell class="h-4 w-4" aria-hidden="true" />
			</button>
		</div>
	</div>

	<div class="gap-2xl hidden w-full items-center lg:flex">
		<div class="gap-md flex min-w-0 items-center">
			<a href={homeHref} class="gap-sm flex items-center text-left">
				<span
					class="border-primary/40 bg-primary/15 text-primary flex h-11 w-11 items-center justify-center rounded-xl border text-sm font-semibold"
				>
					TR
				</span>
				<div class="flex flex-col">
					<span class="text-foreground text-sm font-semibold">{pageTitle()}</span>
					<span class="text-muted-foreground text-xs">Stay current with drops and battles</span>
				</div>
			</a>
		</div>

		{#if promoTicker.length}
			<div class="flex flex-1 items-center overflow-hidden">
				<ul
					class="scrollbar-elevated gap-sm flex w-full overflow-x-auto py-1"
					aria-label="Live promotions"
				>
					{#each promoTicker as item (item.id)}
						<li class="shrink-0">
							<div
								class="gap-sm border-border/50 bg-surface-subdued/70 px-sm py-xs text-foreground/90 flex items-center rounded-lg border text-xs"
							>
								<span class="font-medium">{item.label}</span>
								<span class="text-muted-foreground">{item.meta}</span>
							</div>
						</li>
					{/each}
				</ul>
			</div>
		{/if}

		<div class="gap-sm flex items-center">
			<button
				type="button"
				class="border-border/60 text-muted-foreground hover:text-foreground focus-visible:ring-ring focus-visible:ring-offset-background hidden h-11 w-11 items-center justify-center rounded-xl border transition focus-visible:ring-2 focus-visible:ring-offset-2 xl:flex"
				aria-label="Search"
			>
				<Search class="h-4 w-4" aria-hidden="true" />
			</button>
			<button
				type="button"
				class="border-border/60 text-muted-foreground hover:text-foreground focus-visible:ring-ring focus-visible:ring-offset-background hidden h-11 w-11 items-center justify-center rounded-xl border transition focus-visible:ring-2 focus-visible:ring-offset-2 xl:flex"
				aria-label="Notifications"
			>
				<Bell class="h-4 w-4" aria-hidden="true" />
			</button>
			{#if isAuthenticated && user}
				<Button variant="ghost" class="px-lg text-foreground h-11 rounded-full text-sm font-medium">
					{user.username}
				</Button>
			{:else}
				<AuthButton class="whitespace-nowrap" />
			{/if}
		</div>
	</div>
</header>
