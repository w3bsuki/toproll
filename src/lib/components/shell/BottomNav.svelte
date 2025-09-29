<script lang="ts">
	import { base } from '$app/paths';
	import { page } from '$app/stores';
	import { Home, Package, Swords, ArrowUpRight, Briefcase } from 'lucide-svelte';
	import { cn } from '$lib/utils';

	type BottomNavProps = {
		isAuthenticated?: boolean;
		class?: string;
	};

	const props = $props<BottomNavProps>();
	const isAuthenticated = $derived(() => props.isAuthenticated ?? false);
	const className = $derived(() => props.class ?? '');

	const pageStore = page;
	const currentPage = $derived(pageStore);
	const currentPath = $derived(() => currentPage.url.pathname);

	const items = [
		{ href: '/', label: 'Home', icon: Home },
		{ href: '/cases', label: 'Cases', icon: Package },
		{ href: '/battles', label: 'Battles', icon: Swords },
		{ href: '/upgrader', label: 'Upgrader', icon: ArrowUpRight },
		{ href: '/inventory', label: 'Inventory', icon: Briefcase }
	] as const;

	const normalizePath = (path: string) => {
		if (!path) return '/';
		if (path === '/') return '/';
		return path.endsWith('/') ? path.slice(0, -1) : path;
	};

	const relativePath = $derived(() => {
		if (!base) return normalizePath(currentPath);
		if (currentPath.startsWith(base)) {
			const trimmed = currentPath.slice(base.length) || '/';
			const normalized = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
			return normalizePath(normalized);
		}
		return normalizePath(currentPath);
	});

	const isActiveRoute = (href: string) => {
		const target = normalizePath(href);
		if (target === '/') {
			return relativePath === '/' || relativePath === '';
		}

		return relativePath === target || relativePath.startsWith(`${target}/`);
	};

	const buildHref = (path: string) => (base ? `${base}${path}` : path);
</script>

<nav
	aria-label="Mobile navigation"
	class={cn(
		'border-border/70 bg-surface/90 flex items-center justify-between gap-1 border-t px-2 py-2 shadow-[0_-20px_60px_rgba(15,23,42,0.55)] backdrop-blur-xl',
		className
	)}
>
	{#each items as item (item.href)}
		<a
			href={buildHref(item.href)}
			class={cn(
				'text-muted-foreground focus-visible:ring-ring/70 focus-visible:ring-offset-background flex flex-1 flex-col items-center justify-center gap-1 rounded-2xl px-2 py-2 text-[11px] font-medium tracking-[0.25em] uppercase transition duration-200 ease-out focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none',
				isActiveRoute(item.href)
					? 'bg-primary/20 text-foreground shadow-marketplace-sm'
					: 'hover:bg-surface-muted/40 hover:text-foreground'
			)}
			aria-current={isActiveRoute(item.href) ? 'page' : undefined}
		>
			<span
				class={cn(
					'flex h-12 w-full items-center justify-center rounded-xl border border-transparent text-sm',
					isActiveRoute(item.href)
						? 'border-primary/60 bg-primary/25 text-primary-foreground'
						: 'text-muted-foreground'
				)}
			>
				<item.icon class="h-5 w-5" />
			</span>
			<span class="leading-tight tracking-normal normal-case">
				{item.href === '/inventory' ? (isAuthenticated ? 'Inventory' : 'Locker') : item.label}
			</span>
		</a>
	{/each}
</nav>
