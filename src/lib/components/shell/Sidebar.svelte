<script lang="ts">
	import { page } from '$app/stores';
	import { base } from '$app/paths';
	import AuthButton from '$lib/components/AuthButton.svelte';
	import {
		Home,
		Package,
		User,
		Swords,
		LogIn,
		HelpCircle,
		MessageSquare,
		Shield,
		LifeBuoy,
		ChevronDown,
		Briefcase
	} from '@lucide/svelte';
	import { Button } from '$lib/components/ui';
	import { cn } from '$lib/utils';
	import { closeSidebar } from '$lib/stores/ui';
	import type { Snippet } from 'svelte';

	type SidebarUser = {
		username: string;
		balance: number;
		totalWagered: number;
	};

	const props = $props<{
		isAuthenticated?: boolean;
		user?: SidebarUser | null;
		class?: string;
		density?: 'default' | 'compact';
		children?: Snippet;
	}>();

	const inboundAuthenticated = $derived(props.isAuthenticated ?? false);
	const inboundUser = $derived(props.user ?? null);
	const className = $derived(props.class ?? '');
	const density = $derived(props.density ?? 'default');

	let currentPath = $state('/');
	$effect(() => {
		const unsubscribe = page.subscribe(($page) => {
			currentPath = $page.url.pathname;
		});
		return unsubscribe;
	});

	const navItems = [
		{ href: '/', icon: Home, label: 'Home' },
		{ href: '/cases', icon: Package, label: 'Cases' },
		{ href: '/battles', icon: Swords, label: 'Battles' },
		{ href: '/inventory', icon: Briefcase, label: 'Inventory' },
		{ href: '/profile', icon: User, label: 'Profile' }
	] as const;

	const supportItems = [
		{ href: '/support', icon: MessageSquare, label: 'Support desk' },
		{ href: '/faq', icon: HelpCircle, label: 'FAQ' },
		{ href: '/terms', icon: Shield, label: 'Terms' },
		{ href: '/responsible', icon: LifeBuoy, label: 'Responsible play' }
	] as const;

	let previewSignedIn = $state(false);
	let lastInboundAuthenticated: boolean | null = null;

	$effect(() => {
		const next = inboundAuthenticated;
		if (lastInboundAuthenticated === null || next !== lastInboundAuthenticated) {
			previewSignedIn = next;
			lastInboundAuthenticated = next;
		}
	});

	const fallbackUser = {
		username: 'rainmaker',
		balance: 1570,
		totalWagered: 42800
	} satisfies SidebarUser;

	const normalizeUser = (value: SidebarUser | null) => {
		const baseUser = value ?? fallbackUser;
		return {
			username: baseUser.username,
			balance: baseUser.balance ?? 0,
			totalWagered: baseUser.totalWagered ?? 0
		} satisfies SidebarUser;
	};

	const activeUser = $derived(previewSignedIn ? normalizeUser(inboundUser) : null);

	const vaultSummary = [
		{ label: 'Vault', value: '$640.00' },
		{ label: 'Withdrawable', value: '$930.00' }
	];

	const togglePreviewState = () => {
		previewSignedIn = !previewSignedIn;
	};

	let showBreakdown = $state(false);

	const toggleBreakdown = () => {
		showBreakdown = !showBreakdown;
	};

	$effect(() => {
		if (!activeUser) {
			showBreakdown = false;
		}
	});

	const isActiveRoute = (href: string) => currentPath === href;

	const buildHref = (path: string) => (base ? `${base}${path}` : path);

	let lastPath: string | null = null;

	$effect(() => {
		const nextPath = currentPath;
		if (lastPath !== nextPath) {
			lastPath = nextPath;
			closeSidebar();
		}
	});
</script>

<aside
	class={cn(
		'bg-surface/80 border-border/40 shadow-marketplace-lg flex h-full w-full flex-col rounded-[32px] border backdrop-blur-xl',
		density === 'compact' ? 'gap-3 px-4 py-4' : 'gap-6 px-6 py-6',
		className
	)}
>
	<a href={buildHref('/')} class="flex items-center gap-3">
		<span
			class="border-primary/50 bg-primary/15 text-primary flex h-11 w-11 items-center justify-center rounded-xl border text-base font-semibold"
		>
			TR
		</span>
		<div class="space-y-0.5">
			<p class="text-sm leading-none font-semibold">TopRoll</p>
			<p class="text-muted-foreground text-[11px] tracking-[0.35em] uppercase">CS2 Marketplace</p>
		</div>
	</a>

	<nav class="space-y-2" aria-label="Primary navigation">
		{#each navItems as item (item.href)}
			<Button
				as="a"
				href={buildHref(item.href)}
				variant={isActiveRoute(item.href) ? 'secondary' : 'ghost'}
				class={cn(
					'group relative h-14 w-full justify-start gap-3 rounded-2xl px-3 text-left text-sm font-semibold transition',
					isActiveRoute(item.href)
						? 'border-primary/60 bg-primary/15 text-foreground shadow-marketplace-sm border'
						: 'text-muted-foreground hover:text-foreground border border-transparent'
				)}
				aria-current={isActiveRoute(item.href) ? 'page' : undefined}
			>
				<span
					class={cn(
						'flex h-12 w-12 items-center justify-center rounded-2xl border transition',
						isActiveRoute(item.href)
							? 'border-primary/50 bg-primary/20 text-primary'
							: 'border-border/50 bg-surface-muted/60 text-muted-foreground group-hover:text-foreground'
					)}
				>
					<item.icon class="h-4 w-4" />
				</span>
				<span class="flex-1">{item.label}</span>
				{#if isActiveRoute(item.href)}
					<span class="bg-primary/60 h-2 w-2 rounded-full"></span>
				{/if}
			</Button>
		{/each}
	</nav>

	<section class="border-border/40 bg-surface-muted/30 rounded-3xl border p-4">
		{#if activeUser}
			<div class="space-y-3">
				<div class="flex items-start justify-between gap-4">
					<div class="space-y-1">
						<p class="text-muted-foreground text-[11px] tracking-[0.35em] uppercase">
							Total balance
						</p>
						<p class="text-[28px] leading-tight font-semibold tracking-tight">
							${(activeUser?.balance ?? 0).toLocaleString()}
						</p>
						<p class="text-muted-foreground text-xs">
							Lifetime wagered ${(activeUser?.totalWagered ?? 0).toLocaleString()}
						</p>
					</div>
					<Button
						variant="ghost"
						size="sm"
						onclick={togglePreviewState}
						class="text-muted-foreground hover:text-foreground h-9 rounded-xl px-3 text-[11px] tracking-[0.3em] uppercase"
					>
						Hide
					</Button>
				</div>
				<Button
					variant="ghost"
					size="sm"
					onclick={toggleBreakdown}
					class="text-muted-foreground hover:text-foreground flex w-full items-center justify-between rounded-2xl px-3 py-2 text-[11px] tracking-[0.3em] uppercase"
				>
					Balance breakdown
					<ChevronDown
						class={cn(
							'h-4 w-4 transition-transform duration-200',
							showBreakdown ? 'rotate-180' : ''
						)}
					/>
				</Button>
				{#if showBreakdown}
					<div class="grid gap-2 text-sm">
						{#each vaultSummary as item (item.label)}
							<div
								class="border-border/40 bg-surface/70 flex items-center justify-between rounded-2xl border px-3 py-2"
							>
								<span class="text-muted-foreground text-xs tracking-[0.3em] uppercase">
									{item.label}
								</span>
								<span class="font-medium">{item.value}</span>
							</div>
						{/each}
					</div>
				{/if}
				<div class="grid grid-cols-2 gap-3">
					<Button variant="secondary" class="h-12 rounded-2xl text-sm font-semibold">Deposit</Button
					>
					<Button variant="ghost" class="h-12 rounded-2xl text-sm font-semibold">Withdraw</Button>
				</div>
			</div>
		{:else}
			<div class="space-y-3">
				<div class="space-y-1">
					<p class="text-base leading-snug font-semibold">Sign in with Steam</p>
					<p class="text-muted-foreground text-sm leading-relaxed">
						Connect to deposit instantly, track balance, and join premium drops.
					</p>
				</div>
				<form method="POST" action="/api/auth/steam/login" class="w-full">
					<AuthButton
						class="bg-primary text-primary-foreground shadow-marketplace-md w-full justify-center gap-2"
					/>
				</form>
				<div class="flex items-center justify-between gap-3">
					<Button
						variant="ghost"
						size="sm"
						onclick={togglePreviewState}
						class="text-muted-foreground hover:text-foreground h-9 rounded-xl px-3 text-[11px] tracking-[0.3em] uppercase"
					>
						Preview
					</Button>
					<Button
						variant="ghost"
						class="text-muted-foreground hover:text-foreground h-12 flex-1 gap-2 rounded-2xl text-sm"
					>
						<LogIn class="h-4 w-4" />
						Explore as guest
					</Button>
				</div>
			</div>
		{/if}
	</section>

	<div class="mt-auto space-y-4">
		<div class="border-border/40 bg-surface/70 rounded-3xl border p-4">
			<p class="text-muted-foreground mb-3 text-[11px] tracking-[0.35em] uppercase">Support</p>
			<div class="grid gap-2">
				{#each supportItems as item (item.href)}
					<Button
						as="a"
						href={buildHref(item.href)}
						variant="ghost"
						size="sm"
						class="text-muted-foreground hover:text-foreground justify-start gap-3 rounded-2xl px-3 py-2 text-sm"
					>
						<span
							class="border-border/40 bg-surface-muted/40 flex h-9 w-9 items-center justify-center rounded-xl border"
						>
							<item.icon class="h-4 w-4" />
						</span>
						{item.label}
					</Button>
				{/each}
			</div>
		</div>
	</div>
</aside>
