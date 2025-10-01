<script lang="ts">
	import { base } from '$app/paths';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { Home, Gamepad2, MessageCircle, LifeBuoy, Settings } from 'lucide-svelte';
	import { cn } from '$lib/utils';
	import { toggleChat } from '$lib/stores/ui';

	type Props = {
		isAuthenticated?: boolean;
		class?: string;
	};

	const props = $props<Props>();
	const className = $derived(props.class ?? '');

	const pageStore = page;
	const currentPage = $derived(pageStore);
	const currentPath = $derived(() => currentPage.url.pathname);

	const items = [
		{ href: '/', label: 'Home', icon: Home },
		{ href: '/cases', label: 'Games', icon: Gamepad2 },
		{ action: 'chat', label: 'Chat', icon: MessageCircle },
		{ href: '/support', label: 'Support', icon: LifeBuoy },
		{ href: '/settings', label: 'Settings', icon: Settings }
	] as const;

	const buildHref = (path: string) => (base ? `${base}${path}` : path);
	const isActiveRoute = (href?: string) => !!href && currentPath === href;

	const handleNavigation = (item: (typeof items)[number]) => {
		if (item.action === 'chat') {
			toggleChat();
			return;
		}

		if (item.href) {
			// eslint-disable-next-line svelte/no-navigation-without-resolve
			goto(buildHref(item.href));
		}
	};
</script>

<nav
	aria-label="Mobile navigation"
	class={cn(
		'gap-xs border-border/60 bg-surface/95 px-sm py-xs shadow-elevated-sm flex items-center justify-between border-t backdrop-blur',
		className
	)}
>
	{#each items as item (item.label)}
		<button
			type="button"
			class={cn(
				'px-xs text-muted-foreground focus-visible:ring-ring focus-visible:ring-offset-background flex flex-1 flex-col items-center gap-1 rounded-lg py-1 text-[11px] font-medium transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none',
				isActiveRoute(item.href)
					? 'bg-primary/15 text-foreground'
					: 'hover:bg-surface-subdued/60 hover:text-foreground'
			)}
			onclick={() => handleNavigation(item)}
			aria-pressed={item.action === 'chat' ? undefined : isActiveRoute(item.href)}
		>
			<span
				class={cn(
					'flex h-11 w-full items-center justify-center rounded-md border border-transparent text-sm transition-colors',
					isActiveRoute(item.href)
						? 'border-primary/40 bg-primary/20 text-primary'
						: 'text-muted-foreground'
				)}
			>
				<item.icon class="h-5 w-5" aria-hidden="true" />
			</span>
			<span class="leading-none">{item.label}</span>
		</button>
	{/each}
</nav>
