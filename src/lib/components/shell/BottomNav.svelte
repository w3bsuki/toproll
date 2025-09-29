<script lang="ts">
	import { page } from '$app/stores';
	import { Home, Package, Swords, Briefcase } from 'lucide-svelte';
	import { cn } from '$lib/utils';

	interface BottomNavProps {
		isAuthenticated?: boolean;
		class?: string;
	}

	let { isAuthenticated = false, class: className = '' }: BottomNavProps = $props();

	function isActiveRoute(href: string): boolean {
		return $page.url.pathname === href;
	}

	const items = [
		{ href: '/', label: 'Home', icon: Home },
		{ href: '/cases', label: 'Cases', icon: Package },
		{ href: '/battles', label: 'Battles', icon: Swords },
		{ href: '/inventory', label: isAuthenticated ? 'Inventory' : 'Locker', icon: Briefcase }
	];
</script>

<nav
	aria-label="Mobile"
	class={cn(
		'border-border/60 bg-surface/80 shadow-marketplace-lg flex items-center justify-between gap-2 border-t px-3 py-2',
		className
	)}
>
	{#each items as item}
		<a
			href={item.href}
			class={cn(
				'text-muted-foreground duration-subtle ease-market-ease focus-visible:ring-ring/70 focus-visible:ring-offset-background flex flex-1 flex-col items-center gap-1 rounded-xl border border-transparent px-2 py-2 text-xs font-medium transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none',
				isActiveRoute(item.href)
					? 'bg-surface-accent/20 text-foreground shadow-marketplace-sm border-primary/50'
					: 'hover:border-border/60 hover:bg-surface-muted/40 hover:text-foreground'
			)}
			aria-current={isActiveRoute(item.href) ? 'page' : undefined}
		>
			<item.icon class="h-5 w-5" />
			<span>{item.label}</span>
		</a>
	{/each}
</nav>
