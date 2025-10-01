<script lang="ts">
	import { page } from '$app/stores';
	import { base } from '$app/paths';
	import { Button } from '$lib/components/ui';
	import { cn } from '$lib/utils';
	import { closeSidebar, toggleChat } from '$lib/stores/ui';
	import {
		Gamepad2,
		Home,
		LifeBuoy,
		MessageCircle,
		Settings,
		UserCircle2,
		LogIn
	} from 'lucide-svelte';
	import type { Snippet } from 'svelte';

	type SidebarUser = {
		username: string;
		balance?: number;
	};

	const props = $props<{
		isAuthenticated?: boolean;
		user?: SidebarUser | null;
		class?: string;
		children?: Snippet;
	}>();

	const isAuthenticated = $derived(props.isAuthenticated ?? false);
	const inboundUser = $derived(props.user ?? null);
	const className = $derived(props.class ?? '');

	let currentPath = $state('/');
	$effect(() => {
		const unsubscribe = page.subscribe(($page) => {
			currentPath = $page.url.pathname;
		});
		return unsubscribe;
	});

	const navItems = [
		{ label: 'Home', icon: Home, href: '/' },
		{ label: 'Games', icon: Gamepad2, href: '/cases' },
		{ label: 'Chat', icon: MessageCircle, action: 'chat' },
		{ label: 'Support', icon: LifeBuoy, href: '/support' },
		{ label: 'Settings', icon: Settings, href: '/settings' }
	] as const;

	const buildHref = (path: string) => (base ? `${base}${path}` : path);
	const isActiveRoute = (href?: string) => !!href && currentPath === href;

	const handleNavClick = (item: (typeof navItems)[number]) => {
		if (item.action === 'chat') {
			toggleChat();
			closeSidebar();
			return;
		}

		if (item.href) {
			closeSidebar();
		}
	};

	const formattedBalance = $derived(() =>
		inboundUser?.balance != null
			? `$${inboundUser.balance.toLocaleString(undefined, { maximumFractionDigits: 2 })}`
			: '$0.00'
	);
</script>

<aside
	class={cn(
		'gap-xl border-border/60 bg-surface/85 p-xl shadow-elevated-lg flex h-full min-h-0 flex-col rounded-2xl border backdrop-blur',
		className
	)}
>
	<a href={buildHref('/')} class="gap-sm flex items-center text-left">
		<div
			class="border-primary/40 bg-primary/15 text-primary flex h-11 w-11 items-center justify-center rounded-xl border text-sm font-semibold"
		>
			TR
		</div>
		<div class="flex flex-col">
			<span class="text-foreground text-sm font-semibold">TopRoll</span>
			<span class="text-muted-foreground text-xs">Marketplace shell</span>
		</div>
	</a>

	<nav aria-label="Main" class="flex flex-col gap-1">
		{#each navItems as item (item.label)}
			{#if item.href}
				<a
					href={buildHref(item.href)}
					class={cn(
						'group gap-sm px-md flex min-h-12 items-center rounded-xl border border-transparent text-sm font-semibold transition-colors',
						isActiveRoute(item.href)
							? 'bg-primary/15 text-foreground border-primary/40'
							: 'text-muted-foreground hover:bg-surface-subdued/70 hover:text-foreground'
					)}
					aria-current={isActiveRoute(item.href) ? 'page' : undefined}
					onclick={() => handleNavClick(item)}
				>
					<span
						class={cn(
							'flex h-10 w-10 items-center justify-center rounded-lg border border-transparent transition-colors',
							isActiveRoute(item.href)
								? 'bg-primary/20 text-primary'
								: 'bg-surface-subdued/80 text-muted-foreground group-hover:text-foreground'
						)}
					>
						<item.icon class="h-4 w-4" aria-hidden="true" />
					</span>
					<span class="flex-1">{item.label}</span>
				</a>
			{:else}
				<button
					type="button"
					class="group gap-sm px-md text-muted-foreground hover:bg-surface-subdued/70 hover:text-foreground flex min-h-12 items-center rounded-xl border border-transparent text-left text-sm font-semibold transition-colors"
					onclick={() => handleNavClick(item)}
				>
					<span
						class="bg-surface-subdued/80 text-muted-foreground group-hover:text-foreground flex h-10 w-10 items-center justify-center rounded-lg transition-colors"
					>
						<item.icon class="h-4 w-4" aria-hidden="true" />
					</span>
					<span class="flex-1">{item.label}</span>
				</button>
			{/if}
		{/each}
	</nav>

	<div class="gap-lg mt-auto flex flex-col">
		{#if isAuthenticated && inboundUser}
			<section
				class="border-border/50 bg-surface-raised/85 p-lg shadow-elevated-sm rounded-2xl border"
			>
				<header class="gap-sm flex items-center">
					<span
						class="bg-primary/15 text-primary flex h-10 w-10 items-center justify-center rounded-full"
					>
						<UserCircle2 class="h-5 w-5" aria-hidden="true" />
					</span>
					<div>
						<p class="text-foreground text-sm font-semibold">{inboundUser.username}</p>
						<p class="text-muted-foreground text-xs">Balance {formattedBalance}</p>
					</div>
				</header>
			</section>
		{:else}
			<Button class="w-full" size="lg">
				<LogIn class="h-4 w-4" aria-hidden="true" />
				Sign in
			</Button>
		{/if}

		<slot />
	</div>
</aside>
