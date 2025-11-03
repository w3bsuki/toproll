<script lang="ts">
	// âœ… FIXED: Use $app/state instead of $app/stores
	import { page } from '$app/state';
	import { base } from '$app/paths';
	import {
		Home,
		Package,
		Swords,
		Briefcase,
		Settings,
		LifeBuoy,
		MessageCircle
	} from '@lucide/svelte';
	import { Button } from '$lib/components/ui';
	import { cn } from '$lib/utils';
	import { AuthButton } from '$lib/components/shared';
	import { RainPotCard } from '$lib/features/layout';

	let { isAuthenticated = false, user = null }: { isAuthenticated?: boolean; user?: any } =
		$props();

	// âœ… FIXED: Use page directly (not a store in Svelte 5)
	const currentPath = $derived(page.url.pathname);

	const navItems = [
		{ label: 'Home', icon: Home, href: '/' },
		{ label: 'Cases', icon: Package, href: '/cases' },
		{ label: 'Battles', icon: Swords, href: '/battles' },
		{ label: 'Chat', icon: MessageCircle, href: '/chat' },
		{ label: 'Inventory', icon: Briefcase, href: '/inventory' },
		{ label: 'Support', icon: LifeBuoy, href: '/support' },
		{ label: 'Settings', icon: Settings, href: '/settings' }
	];

	const buildHref = (path: string) => (base ? `${base}${path}` : path);
	const isActiveRoute = (href: string) => currentPath === href;
</script>

<div class="flex h-full flex-col">
	<!-- Main Navigation Section -->
	<div class="flex-1 p-4">
		<nav aria-label="Main" class="flex flex-col gap-2">
			{#each navItems as item}
				<a
					href={buildHref(item.href)}
					class={cn(
						'flex h-12 w-full items-center justify-start gap-3 rounded-lg px-4 text-base font-semibold transition-colors',
						'border border-solid',
						isActiveRoute(item.href)
							? 'bg-primary text-primary-foreground border-primary'
							: 'border-border/50 text-foreground hover:bg-accent hover:border-border'
					)}
				>
					<item.icon class="h-5 w-5 flex-shrink-0" strokeWidth={2} />
					<span class="text-left">{item.label}</span>
				</a>
			{/each}
		</nav>
	</div>

	<!-- Separator -->
	<div class="bg-border/50 mx-4 h-px"></div>

	<!-- Rain Pot Section -->
	<div class="space-y-4 p-4">
		<RainPotCard />

		<!-- Auth Section -->
		{#if isAuthenticated && user}
			<div class="bg-card border-border/50 rounded-xl border p-4">
				<div class="flex items-center gap-3">
					<div
						class="bg-primary/15 text-primary flex h-10 w-10 items-center justify-center rounded-lg"
					>
						<span class="text-sm font-semibold">{user.username?.[0]?.toUpperCase() || 'U'}</span>
					</div>
					<div class="min-w-0 flex-1">
						<p class="text-foreground truncate text-sm font-semibold">{user.username || 'User'}</p>
						<p class="text-primary text-sm font-semibold">
							${((user.balance || 0) / 100).toFixed(2)}
						</p>
					</div>
				</div>
				<div class="mt-3 flex gap-2">
					<Button size="sm" variant="outline" class="flex-1 text-xs">Deposit</Button>
					<Button size="sm" variant="outline" class="flex-1 text-xs">Withdraw</Button>
				</div>
			</div>
		{:else}
			<div class="w-full">
				<AuthButton class="w-full" />
			</div>
		{/if}
	</div>
</div>

