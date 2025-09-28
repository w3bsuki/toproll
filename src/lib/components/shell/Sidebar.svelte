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

	interface SidebarProps {
		isAuthenticated?: boolean;
		class?: string;
	}

	let { isAuthenticated = false, class: className }: SidebarProps = $props();

	const navItems = [
		{ href: '/', icon: Home, label: 'Home' },
		{ href: '/cases', icon: Package, label: 'Cases' },
		{ href: '/battles', icon: TrendingUp, label: 'Battles' },
		{ href: '/inventory', icon: Package, label: 'Inventory' },
		{ href: '/profile', icon: User, label: 'Profile' }
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

	function getNavDescription(label: string): string {
		const descriptions = {
			Home: 'Main dashboard',
			Cases: 'Open cases & win items',
			Battles: 'Compete with others',
			Inventory: 'Your items & rewards',
			Profile: 'Account settings'
		};
		return descriptions[label] || '';
	}
</script>

<aside class="hidden h-full w-64 border-r border-base-300 bg-base-100 md:block {className || ''}">
	<div class="flex h-full flex-col">
		<!-- Navigation -->
		<nav class="flex-1 p-4">
			<ul class="menu">
				{#each navItems as item}
					<li>
						<a href={item.href} class={isActiveRoute(item.href) ? 'active' : ''}>
							<item.icon class="h-5 w-5" />
							{item.label}
						</a>
					</li>
				{/each}
			</ul>
		</nav>

		<!-- Support Section -->
		<div class="border-t border-base-300 p-4">
			<ul class="menu">
				{#each supportItems as item}
					<li>
						<a href={item.href}>
							<item.icon class="h-4 w-4" />
							{item.label}
						</a>
					</li>
				{/each}
			</ul>
		</div>

		<!-- Auth CTA -->
		{#if !isAuthenticated}
			<div class="border-t border-base-300 p-4">
				<button class="btn w-full btn-primary">
					<LogIn class="mr-2 h-4 w-4" />
					Sign in with Steam
				</button>
			</div>
		{/if}
	</div>
</aside>
