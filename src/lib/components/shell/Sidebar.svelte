<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import {
		Home,
		Package,
		User,
		LogIn,
		MessageSquare,
		TrendingUp,
		HelpCircle,
		Gift,
		Zap,
		Crown,
		Settings,
		Shield
	} from 'lucide-svelte';
	import { Button, Badge } from '$lib/components/ui';
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
		{ href: '/', icon: Home, label: 'Home', description: 'Dashboard & stats' },
		{ href: '/cases', icon: Package, label: 'Cases', description: 'Browse & open cases' },
		{ href: '/battles', icon: TrendingUp, label: 'Battles', description: 'Compete with players' },
		{ href: '/inventory', icon: Package, label: 'Inventory', description: 'Track your winnings' },
		{ href: '/profile', icon: User, label: 'Profile', description: 'Account & security' }
	];

	const supportItems = [
		{ href: '/faq', icon: HelpCircle, label: 'FAQ' },
		{ href: '/support', icon: MessageSquare, label: 'Support' },
		{ href: '/terms', icon: Shield, label: 'Terms' },
		{ href: '/privacy', icon: Settings, label: 'Privacy' }
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
		'bg-surface/80 border-border/40 flex h-full w-full flex-col rounded-[28px] border p-4 shadow-[0_24px_90px_rgba(15,23,42,0.32)] backdrop-blur-xl',
		className
	)}
>
	<nav class="space-y-2" aria-label="Primary navigation">
		{#each navItems as item}
			<button
				type="button"
				class={cn(
					'group flex w-full items-center justify-between rounded-2xl border border-transparent px-2 py-1.5 text-left transition duration-200',
					'focus-visible:ring-ring/70 focus-visible:ring-offset-background focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none',
					isActiveRoute(item.href)
						? 'border-primary/60 bg-primary/10 text-foreground shadow-marketplace-sm'
						: 'text-muted-foreground hover:border-border/50 hover:bg-surface-muted/40 hover:text-foreground'
				)}
				onclick={() => handleNavigation(item.href)}
				aria-current={isActiveRoute(item.href) ? 'page' : undefined}
			>
				<span class="flex items-center gap-3">
					<span
						class={cn(
							'flex h-14 w-14 items-center justify-center rounded-2xl border text-sm font-semibold transition-colors',
							isActiveRoute(item.href)
								? 'border-primary/60 bg-primary/20 text-primary'
								: 'border-border/50 bg-surface-muted/50 text-muted-foreground group-hover:text-foreground'
						)}
					>
						<item.icon class="h-4 w-4" />
					</span>
					<span class="text-sm font-semibold tracking-tight">{item.label}</span>
				</span>
				{#if isActiveRoute(item.href)}
					<Badge
						variant="outline"
						class="rounded-full px-2 py-0.5 text-[9px] tracking-[0.35em] uppercase">Active</Badge
					>
				{/if}
			</button>
		{/each}
	</nav>

	<div class="mt-auto space-y-3">
		<div class="border-border/50 bg-surface/80 rounded-3xl border p-4">
			{#if isAuthenticated && user}
				<div class="space-y-3 text-sm">
					<div class="flex items-center justify-between">
						<p class="text-muted-foreground text-xs tracking-[0.35em] uppercase">Account</p>
						<span class="text-muted-foreground/80 text-xs font-medium">Live</span>
					</div>
					<p class="text-base font-semibold">{user.username}</p>
					<div class="border-border/40 bg-surface-muted/40 grid gap-2 rounded-2xl border p-3">
						<div>
							<p class="text-muted-foreground text-[10px] tracking-[0.35em] uppercase">Balance</p>
							<p class="text-lg font-semibold">${user.balance.toLocaleString()}</p>
						</div>
						<div>
							<p class="text-muted-foreground text-[10px] tracking-[0.35em] uppercase">Wagered</p>
							<p class="text-sm font-medium">${user.totalWagered.toLocaleString()}</p>
						</div>
						<Button variant="secondary" size="sm" class="w-full justify-center">Manage funds</Button
						>
					</div>
				</div>
			{:else}
				<div class="space-y-3 text-sm">
					<p class="text-base leading-tight font-semibold">Sign in to unlock trading</p>
					<p class="text-muted-foreground text-xs leading-relaxed">
						Connect Steam to deposit instantly and join live battles.
					</p>
					<Button class="w-full gap-2">
						<LogIn class="h-4 w-4" />
						Sign in with Steam
					</Button>
				</div>
			{/if}
		</div>

		<div class="border-border/40 bg-surface/70 rounded-3xl border p-3">
			<p class="text-muted-foreground text-[10px] tracking-[0.35em] uppercase">Support</p>
			<div class="mt-2 grid gap-2">
				{#each supportItems as item}
					<Button
						as="a"
						href={item.href}
						variant="ghost"
						size="sm"
						class="text-muted-foreground hover:text-foreground justify-start gap-3 rounded-2xl px-2 py-1.5 text-sm"
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
