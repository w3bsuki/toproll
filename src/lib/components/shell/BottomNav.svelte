<script lang="ts">
	import { page } from '$app/stores';
	import { toggleChat } from '$lib/stores/ui';
	import { Home, AppWindow, MessageCircle, Package, User, LogIn } from 'lucide-svelte';

	interface BottomNavProps {
		isAuthenticated?: boolean;
		class?: string;
	}

	let { isAuthenticated = false, class: className }: BottomNavProps = $props();

	function isActiveRoute(href: string): boolean {
		return $page.url.pathname === href;
	}
</script>

<div class="btm-nav {className || ''}">
	<a href="/" class={isActiveRoute('/') ? 'active' : ''}>
		<Home class="h-5 w-5" />
		<span class="btm-nav-label">Home</span>
	</a>

	<a href="/cases" class={isActiveRoute('/battle') || isActiveRoute('/cases') ? 'active' : ''}>
		<AppWindow class="h-5 w-5" />
		<span class="btm-nav-label">Battle</span>
	</a>

	<button onclick={toggleChat}>
		<MessageCircle class="h-5 w-5" />
		<span class="btm-nav-label">Chat</span>
	</button>

	<a href="/case-opening" class={isActiveRoute('/case-opening') ? 'active' : ''}>
		<Package class="h-5 w-5" />
		<span class="btm-nav-label">Open</span>
	</a>

	{#if isAuthenticated}
		<a href="/profile" class={isActiveRoute('/profile') ? 'active' : ''}>
			<User class="h-5 w-5" />
			<span class="btm-nav-label">Profile</span>
		</a>
	{:else}
		<a href="/login">
			<LogIn class="h-5 w-5" />
			<span class="btm-nav-label">Sign In</span>
		</a>
	{/if}
</div>
