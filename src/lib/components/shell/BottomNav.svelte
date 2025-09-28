<script lang="ts">
	import { page } from '$app/stores';
	import { toggleChat } from '$lib/stores/ui';
	import { Home, AppWindow, MessageCircle, Package, User, LogIn } from 'lucide-svelte';
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
		{ href: '/battles', label: 'Battles', icon: AppWindow }
	];
</script>

<nav
	class={cn(
		'border-border/60 bg-surface/80 shadow-marketplace-lg flex items-center justify-between gap-2 border-t px-3 py-2',
		className
	)}
>
	{#each items as item}
		<a
			href={item.href}
			class={cn(
				'text-muted-foreground duration-subtle ease-market-ease flex flex-1 flex-col items-center gap-1 rounded-md px-2 py-2 text-xs font-medium transition-colors',
				isActiveRoute(item.href)
					? 'bg-surface-accent/20 text-foreground shadow-marketplace-sm border-primary/50 border'
					: 'hover:border-border/60 hover:bg-surface-muted/40 hover:text-foreground border border-transparent'
			)}
		>
			<item.icon class="h-5 w-5" />
			<span>{item.label}</span>
		</a>
	{/each}

	<button
		class="text-muted-foreground duration-subtle ease-market-ease hover:border-border/60 hover:bg-surface-muted/40 hover:text-foreground flex flex-1 flex-col items-center gap-1 rounded-md border border-transparent px-2 py-2 text-xs font-medium transition-colors"
		on:click={toggleChat}
	>
		<MessageCircle class="h-5 w-5" />
		<span>Chat</span>
	</button>

	{#if isAuthenticated}
		<a
			href="/profile"
			class={cn(
				'text-muted-foreground duration-subtle ease-market-ease flex flex-1 flex-col items-center gap-1 rounded-md border border-transparent px-2 py-2 text-xs font-medium transition-colors',
				isActiveRoute('/profile')
					? 'bg-surface-accent/20 text-foreground shadow-marketplace-sm border-primary/50 border'
					: 'hover:border-border/60 hover:bg-surface-muted/40 hover:text-foreground'
			)}
		>
			<User class="h-5 w-5" />
			<span>Profile</span>
		</a>
	{:else}
		<a
			href="/login"
			class="border-border/60 bg-primary/15 text-primary duration-subtle ease-market-ease hover:bg-primary/25 flex flex-1 flex-col items-center gap-1 rounded-md border px-2 py-2 text-xs font-medium transition-colors"
		>
			<LogIn class="h-5 w-5" />
			<span>Sign In</span>
		</a>
	{/if}
</nav>
