<script lang="ts">
	import { goto } from '$app/navigation';
	// ✅ NEW: Use $app/state instead of $app/stores
	import { page } from '$app/state';
	import { Button } from '$lib/components/ui/button';
	import { Avatar, AvatarFallback, AvatarImage } from '$lib/components/ui/avatar';
	import { Loader2, LogIn, LogOut, User, Wallet } from '@lucide/svelte';
	// ✅ NEW: Get auth state from context
	import { getAuthState } from '$lib/features/auth/auth-state.svelte';

	// Props
	let {
		showBalance = true,
		returnUrl,
		class: className = ''
	}: {
		showBalance?: boolean;
		returnUrl?: string;
		class?: string;
	} = $props();

	// ✅ NEW: Get auth state from context
	const auth = getAuthState();

	// Computed values
	const displayName = $derived(auth.profile?.username || 'User');
	const avatarUrl = $derived(auth.profile?.avatar_url);

	async function handleLogin() {
		// Build login URL with return URL
		const loginParams = new URLSearchParams();
		if (returnUrl) {
			loginParams.set('returnUrl', returnUrl);
		} else if (page.url.pathname !== '/') {
			loginParams.set('returnUrl', page.url.pathname + page.url.search);
		}

		const loginUrl = `/api/auth/steam/login${loginParams.toString() ? '?' + loginParams.toString() : ''}`;

		// Navigate to login endpoint
		window.location.href = loginUrl;
	}

	async function handleLogout() {
		try {
			await auth.signOut();
			goto('/');
		} catch (err) {
			console.error('Logout error:', err);
		}
	}

	function handleProfileClick() {
		goto('/profile');
	}

	function handleWalletClick() {
		goto('/wallet');
	}
</script>

{#if auth.isAuthenticated && auth.user && auth.profile}
	<!-- Authenticated state - Simple user menu -->
	<div class="flex items-center gap-3">
		<Avatar class="h-8 w-8">
			<AvatarImage src={avatarUrl} alt={displayName} />
			<AvatarFallback>
				<User class="h-4 w-4" />
			</AvatarFallback>
		</Avatar>
		<span class="hidden text-sm font-medium md:inline">{displayName}</span>

		<Button variant="ghost" size="sm" onclick={handleProfileClick}>Profile</Button>

		{#if showBalance}
			<Button variant="ghost" size="sm" onclick={handleWalletClick}>
				<Wallet class="mr-1 h-4 w-4" />
				Wallet
			</Button>
		{/if}

		<Button variant="ghost" size="sm" onclick={handleLogout} class="text-red-600">
			<LogOut class="mr-1 h-4 w-4" />
			Sign out
		</Button>
	</div>
{:else}
	<!-- Unauthenticated state - Login button -->
	<Button onclick={handleLogin} class={className} disabled={auth.isLoading}>
		{#if auth.isLoading}
			<Loader2 class="mr-2 h-4 w-4 animate-spin" />
			<span>Connecting...</span>
		{:else}
			<LogIn class="mr-2 h-4 w-4" />
			<span>Sign in with Steam</span>
		{/if}
	</Button>
{/if}

<style>
	/* Custom styles for Steam button */
	:global(.steam-button) {
		background: linear-gradient(135deg, #1b2838 0%, #2a475e 100%);
		color: white;
		border: 1px solid #66c0f4;
	}

	:global(.steam-button:hover) {
		background: linear-gradient(135deg, #2a475e 0%, #66c0f4 100%);
		border-color: #c7d5e0;
	}
</style>
