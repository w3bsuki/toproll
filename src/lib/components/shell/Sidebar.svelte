<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
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

	interface SidebarProps {
		isAuthenticated?: boolean;
		user?: {
			username: string;
			balance: number;
			totalWagered: number;
		} | null;
		class?: string;
	}

	let { isAuthenticated = false, user = null, class: className = '' }: SidebarProps = $props();

	const navItems = [
		{ href: '/', icon: Home, label: 'Home' },
		{ href: '/cases', icon: Package, label: 'Cases' },
		{ href: '/battles', icon: Swords, label: 'Battles' },
		{ href: '/inventory', icon: Briefcase, label: 'Inventory' },
		{ href: '/profile', icon: User, label: 'Profile' }
	];

	const supportItems = [
		{ href: '/support', icon: MessageSquare, label: 'Support desk' },
		{ href: '/faq', icon: HelpCircle, label: 'FAQ' },
		{ href: '/terms', icon: Shield, label: 'Terms' },
		{ href: '/responsible', icon: LifeBuoy, label: 'Responsible play' }
	];

	function isActiveRoute(href: string): boolean {
		return $page.url.pathname === href;
	}

	function handleNavigation(href: string) {
		goto(href);
		closeSidebar();
	}
</script>

<aside
	class={cn(
		'bg-surface/80 border-border/40 flex h-full w-full flex-col gap-6 rounded-[32px] border px-6 py-6 shadow-[0_32px_120px_rgba(15,23,42,0.36)] backdrop-blur-xl',
		className
	)}
>
	<a href="/" class="flex items-center gap-3">
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
		{#if isAuthenticated && user}
			<div class="space-y-4">
				<div>
					<p class="text-muted-foreground text-[11px] tracking-[0.35em] uppercase">Balance</p>
					<p class="text-2xl font-semibold">${user.balance.toLocaleString()}</p>
				</div>
				<div class="grid gap-2 text-sm">
					<div
						class="border-border/40 bg-surface/70 flex items-center justify-between rounded-2xl border px-3 py-2"
					>
						<span class="text-muted-foreground text-xs tracking-[0.3em] uppercase">Vault</span>
						<span class="font-medium">$640.00</span>
					</div>
					<div
						class="border-border/40 bg-surface/70 flex items-center justify-between rounded-2xl border px-3 py-2"
					>
						<span class="text-muted-foreground text-xs tracking-[0.3em] uppercase"
							>Withdrawable</span
						>
						<span class="font-medium">$930.00</span>
					</div>
				</div>
				<div class="grid grid-cols-2 gap-3">
					<Button variant="secondary" class="h-11 rounded-2xl text-sm font-semibold">Deposit</Button
					>
					<Button variant="ghost" class="h-11 rounded-2xl text-sm font-semibold">Withdraw</Button>
				</div>
			</div>
		{:else}
			<div class="space-y-3">
				<p class="text-base leading-snug font-semibold">Sign in with Steam</p>
				<p class="text-muted-foreground text-sm leading-relaxed">
					Connect to deposit instantly, track balance, and join premium drops.
				</p>
				<form method="POST" action="/api/auth/steam/login" class="w-full">
					<AuthButton
						class="bg-primary text-primary-foreground shadow-marketplace-md w-full justify-center gap-2"
					/>
				</form>
				<Button
					variant="ghost"
					class="text-muted-foreground hover:text-foreground h-11 w-full gap-2 rounded-2xl text-sm"
				>
					<LogIn class="h-4 w-4" />
					Explore as guest
				</Button>
			</div>
		{/if}
	</div>

	<nav class="space-y-2" aria-label="Primary navigation">
		{#each navItems as item}
			<button
				type="button"
				class={cn(
					'group focus-visible:ring-ring/70 focus-visible:ring-offset-background relative flex h-14 w-full items-center gap-3 rounded-2xl border px-3 text-left text-sm font-semibold transition duration-200 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none',
					isActiveRoute(item.href)
						? 'border-primary/60 bg-primary/15 text-foreground shadow-marketplace-sm'
						: 'text-muted-foreground hover:border-border/60 hover:bg-surface-muted/40 hover:text-foreground border-transparent'
				)}
				onclick={() => handleNavigation(item.href)}
				aria-current={isActiveRoute(item.href) ? 'page' : undefined}
			>
				<span
					class={cn(
						'text-muted-foreground flex h-12 w-12 items-center justify-center rounded-2xl border transition',
						isActiveRoute(item.href)
							? 'border-primary/50 bg-primary/20 text-primary'
							: 'border-border/50 bg-surface-muted/60 group-hover:text-foreground'
					)}
				>
					<item.icon class="h-4 w-4" />
				</span>
				<span>{item.label}</span>
				{#if isActiveRoute(item.href)}
					<span class="absolute inset-y-2 right-3 flex w-10 items-center justify-end">
						<span class="bg-primary/60 h-full w-2 rounded-full"></span>
					</span>
				{/if}
			</button>
		{/each}
	</nav>

	<div class="mt-auto space-y-4">
		<div class="border-border/40 bg-surface/70 rounded-3xl border p-4">
			<div class="text-muted-foreground mb-3 flex items-center justify-between text-xs">
				<span class="tracking-[0.3em] uppercase">Live support</span>
				<ArrowDownUp class="h-4 w-4" />
			</div>
			<div class="grid gap-2">
				{#each supportItems as item}
					<Button
						as="a"
						href={item.href}
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
