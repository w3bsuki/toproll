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

	interface SidebarProps {
		isAuthenticated?: boolean;
		class?: string;
	}

	let { isAuthenticated = false, class: className = '' }: SidebarProps = $props();

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
</script>

<aside
	class={cn(
		'border-border/60 bg-surface/60 hidden h-full w-64 overflow-hidden border-r backdrop-blur-sm md:block',
		className
	)}
>
	<div class="flex h-full flex-col">
		<div class="border-border/60 border-b px-6 py-5">
			<p class="text-muted-foreground text-xs tracking-[0.3em] uppercase">Navigation</p>
		</div>

		<nav class="flex-1 px-4 py-6" aria-label="Primary">
			<ul class="space-y-1">
				{#each navItems as item}
					<li>
						<button
							type="button"
							class={cn(
								'group duration-subtle ease-market-ease focus-visible:ring-ring/70 focus-visible:ring-offset-background flex w-full items-center justify-between rounded-md border border-transparent px-3 py-2 text-left transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none',
								isActiveRoute(item.href)
									? 'border-primary/60 bg-surface-accent/30 text-foreground shadow-marketplace-sm'
									: 'text-muted-foreground hover:border-border/60 hover:bg-surface-muted/40 hover:text-foreground'
							)}
							onclick={() => goto(item.href)}
							aria-current={isActiveRoute(item.href) ? 'page' : undefined}
						>
							<span class="flex items-center gap-3">
								<span
									class={cn(
										'flex h-9 w-9 items-center justify-center rounded-md border',
										isActiveRoute(item.href)
											? 'border-primary/60 bg-primary/15 text-primary'
											: 'border-border/50 bg-surface-muted/40 text-muted-foreground group-hover:text-foreground'
									)}
								>
									<item.icon class="h-4 w-4" />
								</span>
								<span>
									<span class="text-sm leading-tight font-medium">{item.label}</span>
									<span class="text-muted-foreground/80 block text-xs">{item.description}</span>
								</span>
							</span>
							{#if isActiveRoute(item.href)}
								<Badge variant="outline" class="text-xs">Active</Badge>
							{/if}
						</button>
					</li>
				{/each}
			</ul>
		</nav>

		<div class="border-border/60 border-t px-4 py-5">
			<p class="text-muted-foreground text-xs tracking-[0.3em] uppercase">Support</p>
                        <ul class="mt-3 space-y-2 text-sm">
                                {#each supportItems as item}
                                        <li>
                                                <Button
                                                        as="a"
                                                        href={item.href}
                                                        variant="outline"
                                                        size="sm"
                                                        class="border-border/60 bg-surface-muted/30 text-muted-foreground hover:text-foreground flex w-full items-center justify-start gap-3 rounded-lg"
                                                >
                                                        <span class="border-border/50 bg-surface-muted/50 flex h-8 w-8 items-center justify-center rounded-md border">
                                                                <item.icon class="h-4 w-4" />
                                                        </span>
                                                        {item.label}
                                                </Button>
                                        </li>
                                {/each}
                        </ul>
		</div>

		{#if !isAuthenticated}
			<div class="border-border/60 border-t px-4 py-5">
				<div
					class="border-border/60 bg-surface-muted/40 text-muted-foreground rounded-lg border p-4 text-sm"
				>
					<p class="text-foreground font-medium">Sign in to unlock trading</p>
					<p class="mt-1 text-xs">
						Connect your Steam account to deposit, withdraw, and participate in battles.
					</p>
					<Button class="mt-4 w-full gap-2">
						<LogIn class="h-4 w-4" />
						Sign in with Steam
					</Button>
				</div>
			</div>
		{/if}
	</div>
</aside>
