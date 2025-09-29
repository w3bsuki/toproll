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
	class={cn('bg-surface/70 flex h-full w-[240px] flex-none flex-col px-5 pt-8 pb-6', className)}
>
	<div class="flex flex-col gap-6">
		<div>
			<p class="text-muted-foreground text-xs tracking-[0.35em] uppercase">Main</p>
			<nav class="mt-4 space-y-2" aria-label="Primary navigation">
				{#each navItems as item}
					<button
						type="button"
						class={cn(
							'group flex w-full items-center justify-between rounded-2xl border border-transparent px-3 py-3 text-left transition duration-200',
							'focus-visible:ring-ring/70 focus-visible:ring-offset-background focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none',
							isActiveRoute(item.href)
								? 'border-primary/60 bg-surface-accent/30 text-foreground shadow-marketplace-sm'
								: 'text-muted-foreground hover:border-border/60 hover:bg-surface-muted/40 hover:text-foreground'
						)}
						onclick={() => handleNavigation(item.href)}
						aria-current={isActiveRoute(item.href) ? 'page' : undefined}
					>
						<span class="flex items-center gap-3">
							<span
								class={cn(
									'flex h-12 w-12 items-center justify-center rounded-xl border',
									isActiveRoute(item.href)
										? 'border-primary/60 bg-primary/15 text-primary'
										: 'border-border/50 bg-surface-muted/40 text-muted-foreground group-hover:text-foreground'
								)}
							>
								<item.icon class="h-4 w-4" />
							</span>
							<span>
								<span class="text-sm leading-tight font-semibold">{item.label}</span>
								<span class="text-muted-foreground/75 block text-xs">{item.description}</span>
							</span>
						</span>
						{#if isActiveRoute(item.href)}
							<Badge
								variant="outline"
								class="rounded-full px-2 py-0.5 text-[10px] tracking-[0.3em] uppercase"
								>Active</Badge
							>
						{/if}
					</button>
				{/each}
			</nav>
		</div>

		<div
			class="border-border/40 bg-surface/80 rounded-3xl border p-5 shadow-[0_18px_40px_rgba(15,23,42,0.25)]"
		>
			{#if isAuthenticated && user}
				<div class="space-y-4">
					<div>
						<p class="text-muted-foreground text-xs tracking-[0.35em] uppercase">Account</p>
						<p class="mt-1 text-base font-semibold">{user.username}</p>
					</div>
					<div class="border-border/30 bg-surface-muted/40 space-y-3 rounded-2xl border p-4">
						<div>
							<p class="text-muted-foreground text-[11px] tracking-[0.3em] uppercase">Balance</p>
							<p class="text-lg font-semibold">${user.balance.toLocaleString()}</p>
						</div>
						<div>
							<p class="text-muted-foreground text-[11px] tracking-[0.3em] uppercase">
								Total wagered
							</p>
							<p class="text-sm font-medium">${user.totalWagered.toLocaleString()}</p>
						</div>
						<Button variant="secondary" class="w-full">Manage funds</Button>
					</div>
				</div>
			{:else}
				<div class="space-y-4 text-sm">
					<div>
						<p class="text-foreground text-base font-semibold">Sign in to unlock trading</p>
						<p class="text-muted-foreground text-xs leading-relaxed">
							Connect your Steam account to deposit, withdraw, and battle with the floor.
						</p>
					</div>
					<Button class="w-full gap-2">
						<LogIn class="h-4 w-4" />
						Sign in with Steam
					</Button>
				</div>
			{/if}
		</div>

		<div class="border-border/40 bg-surface/60 rounded-3xl border p-4">
			<p class="text-muted-foreground text-xs tracking-[0.35em] uppercase">Support</p>
			<div class="mt-3 grid gap-2">
				{#each supportItems as item}
					<Button
						as="a"
						href={item.href}
						variant="ghost"
						size="sm"
						class="text-muted-foreground hover:text-foreground justify-start rounded-full px-3 py-2 text-sm"
					>
						<span
							class="border-border/40 bg-surface-muted/40 mr-2 flex h-8 w-8 items-center justify-center rounded-full border"
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
