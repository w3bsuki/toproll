<script lang="ts">
	import { page } from '$app/stores';
	import { base } from '$app/paths';
	import { Home, Package, Swords, Briefcase, Settings, LifeBuoy } from '@lucide/svelte';
	import { Button } from '$lib/components/ui';
	import { cn } from '$lib/utils';
	import AuthButton from './AuthButton.svelte';
	import RainPotCard from './shell/RainPotCard.svelte';

	let { isAuthenticated = false, user = null }: { isAuthenticated?: boolean; user?: any } =
		$props();

	const currentPath = $derived($page.url.pathname);

	const navItems = [
		{ label: 'Home', icon: Home, href: '/' },
		{ label: 'Cases', icon: Package, href: '/cases' },
		{ label: 'Battles', icon: Swords, href: '/battles' },
		{ label: 'Inventory', icon: Briefcase, href: '/inventory' },
		{ label: 'Support', icon: LifeBuoy, href: '/support' },
		{ label: 'Settings', icon: Settings, href: '/settings' }
	];

	const buildHref = (path: string) => (base ? `${base}${path}` : path);
	const isActiveRoute = (href: string) => currentPath === href;
</script>

<div class="flex h-full flex-col gap-4 p-6">
	<!-- Navigation -->
	<nav aria-label="Main" class="flex flex-col gap-1">
		{#each navItems as item}
			<Button
				as="a"
				href={buildHref(item.href)}
				variant={isActiveRoute(item.href) ? 'default' : 'ghost'}
				class={cn(
					'justify-start gap-3 text-sm font-medium',
					isActiveRoute(item.href) ? 'shadow-sm' : ''
				)}
			>
				<item.icon class="h-4 w-4" />
				{item.label}
			</Button>
		{/each}
	</nav>

	<!-- Rain Pot Section -->
	<div class="mt-auto space-y-3">
		<RainPotCard />

		<!-- Auth Section -->
		{#if isAuthenticated && user}
			<div class="border-border/50 bg-card/60 rounded-xl border p-4">
				<div class="flex items-center gap-3">
					<div
						class="bg-primary/15 text-primary flex h-10 w-10 items-center justify-center rounded-full"
					>
						<span class="text-sm font-semibold">{user.username?.[0]?.toUpperCase() || 'U'}</span>
					</div>
					<div class="min-w-0 flex-1">
						<p class="text-foreground truncate text-sm font-semibold">{user.username || 'User'}</p>
						<p class="text-muted-foreground text-xs">
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
			<form method="POST" action="/api/auth/steam/login" class="w-full">
				<AuthButton class="w-full" />
			</form>
		{/if}
	</div>
</div>
