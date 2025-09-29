<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
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
		ArrowDownUp,
		Briefcase
	} from 'lucide-svelte';
	import { Button } from '$lib/components/ui';
	import { cn } from '$lib/utils';
	import { closeSidebar } from '$lib/stores/ui';

	type SidebarProps = {
		isAuthenticated?: boolean;
		user?: {
			username: string;
			balance: number;
			totalWagered: number;
		} | null;
		class?: string;
	};

	const props = $props<SidebarProps>();
	const inboundUser = $derived(() => props.user ?? null);
	const inboundAuthenticated = $derived(() => props.isAuthenticated ?? false);
	const className = $derived(() => props.class ?? '');

	const pageStore = page;
	const currentPage = $derived(pageStore);
	const currentPath = $derived(() => currentPage.url.pathname);

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

	let previewSignedIn = $state(inboundAuthenticated);

	$effect(() => {
		if (inboundAuthenticated) {
			previewSignedIn = true;
		}
	});

	const fallbackUser = {
		username: 'rainmaker',
		balance: 1570.0,
		totalWagered: 42800
	};

	const activeUser = $derived(() => {
		if (!previewSignedIn) return null;
		return inboundUser ?? fallbackUser;
	});

	const vaultSummary = [
		{ label: 'Vault', value: '$640.00' },
		{ label: 'Withdrawable', value: '$930.00' }
	];

	const togglePreviewState = () => {
		previewSignedIn = !previewSignedIn;
	};

	const isActiveRoute = (href: string) => currentPath === href;

	const buildHref = (path: string) => (base ? `${base}${path}` : path);

	const handleNavigation = (href: string) => {
		// eslint-disable-next-line svelte/no-navigation-without-resolve
		goto(buildHref(href));
		closeSidebar();
	};
</script>

<aside
	class={cn(
		'bg-surface/80 border-border/40 flex h-full w-full flex-col gap-6 rounded-[32px] border px-6 py-6 shadow-[0_32px_120px_rgba(15,23,42,0.36)] backdrop-blur-xl',
		className
	)}
>
	<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
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

	<div class="border-border/40 bg-surface-muted/30 rounded-3xl border p-4">
		{#if activeUser}
			<div class="space-y-4">
				<div class="flex items-center justify-between">
					<div>
						<p class="text-muted-foreground text-[11px] tracking-[0.35em] uppercase">Balance</p>
						<p class="text-2xl font-semibold">${activeUser.balance.toLocaleString()}</p>
					</div>
					<Button
						variant="ghost"
						size="sm"
						onclick={togglePreviewState}
						class="text-muted-foreground hover:text-foreground h-9 rounded-xl px-3 text-xs tracking-[0.3em] uppercase"
					>
						Hide
					</Button>
				</div>
				<div class="grid gap-2 text-sm">
					{#each vaultSummary as item (item.label)}
						<div
							class="border-border/40 bg-surface/70 flex items-center justify-between rounded-2xl border px-3 py-2"
						>
							<span class="text-muted-foreground text-xs tracking-[0.3em] uppercase"
								>{item.label}</span
							>
							<span class="font-medium">{item.value}</span>
						</div>
					{/each}
				</div>
				<div class="grid grid-cols-2 gap-3">
					<Button variant="secondary" class="h-12 rounded-2xl text-sm font-semibold">Deposit</Button
					>
					<Button variant="ghost" class="h-12 rounded-2xl text-sm font-semibold">Withdraw</Button>
				</div>
			</div>
		{:else}
			<div class="space-y-3">
				<div class="flex items-start justify-between gap-4">
					<div class="space-y-1.5">
						<p class="text-base leading-snug font-semibold">Sign in with Steam</p>
						<p class="text-muted-foreground text-sm leading-relaxed">
							Connect to deposit instantly, track balance, and join premium drops.
						</p>
					</div>
					<Button
						variant="ghost"
						size="sm"
						onclick={togglePreviewState}
						class="text-muted-foreground hover:text-foreground h-9 rounded-xl px-3 text-xs tracking-[0.3em] uppercase"
					>
						Preview
					</Button>
				</div>
				<form method="POST" action="/api/auth/steam/login" class="w-full">
					<AuthButton
						class="bg-primary text-primary-foreground shadow-marketplace-md w-full justify-center gap-2"
					/>
				</form>
				<Button
					variant="ghost"
					class="text-muted-foreground hover:text-foreground h-12 w-full gap-2 rounded-2xl text-sm"
				>
					<LogIn class="h-4 w-4" />
					Explore as guest
				</Button>
			</div>
		{/if}
	</div>

	<nav class="space-y-2" aria-label="Primary navigation">
		{#each navItems as item (item.href)}
			<Button
				type="button"
				variant={isActiveRoute(item.href) ? 'secondary' : 'ghost'}
				onclick={() => handleNavigation(item.href)}
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

	<div class="mt-auto space-y-4">
		<div class="border-border/40 bg-surface/70 rounded-3xl border p-4">
			<div class="text-muted-foreground mb-3 flex items-center justify-between text-xs">
				<span class="tracking-[0.3em] uppercase">Live support</span>
				<ArrowDownUp class="h-4 w-4" />
			</div>
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
