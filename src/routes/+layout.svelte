<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import { SidebarLeft, SidebarRight, ShellHeader, BottomNav, ChatDrawer } from '$lib/features/layout';
	import * as SidebarPrimitive from '$lib/components/ui/sidebar/index.js';
	import { MessageCircle } from '@lucide/svelte';
	// ? NEW: Import modern Svelte 5 state management (now colocated with features)
	import { setAuthState } from '$lib/features/auth/auth-state.svelte';
	import { setUIState } from '$lib/features/layout/ui-state.svelte';
	import { setToastsState } from '$lib/features/shared/toasts-state.svelte';
	import type { LayoutData } from './$types';
	import type { Snippet } from 'svelte';

	const { children, data } = $props<{ children: Snippet; data: LayoutData }>();

	// ? NEW: Initialize state in context (runs once at root)
	const auth = setAuthState(data.user);
	const ui = setUIState();
	const toasts = setToastsState();

	// ? NEW: Initialize auth on client-side
	$effect(() => {
		if (typeof window !== 'undefined') {
			auth.initialize();
			
			// Check if we just came back from Steam auth
			const urlParams = new URLSearchParams(window.location.search);
			if (urlParams.get('auth') === 'success') {
				console.log('🔄 Auth success detected, refreshing session...');
				// Remove the auth flag from URL
				urlParams.delete('auth');
				const newUrl = window.location.pathname + (urlParams.toString() ? '?' + urlParams.toString() : '');
				window.history.replaceState({}, '', newUrl);
				// Force session refresh
				setTimeout(() => {
					window.location.reload();
				}, 100);
			}
		}
	});

	// ? NEW: Derived user data for UI
	const authUser = $derived(() => {
		if (auth.isLoading) return data.user; // Use server data during loading
		if (auth.isAuthenticated && auth.user && auth.profile) {
			const user = auth.user;
			const profile = auth.profile;
			return {
				id: user.id,
				steamId: profile.steam_id,
				username: profile.username,
				avatar: profile.avatar_url,
				balance: 1570.0, // TODO: Get from user profile stats
				totalWagered: profile.total_wagered || 0,
				totalProfit: profile.total_profit || 0,
				winRate: profile.win_rate || 0,
				biggestWin: profile.biggest_win || 0,
				caseBattleWins: profile.case_battle_wins || 0
			};
		}
		return null;
	});

	const authIsAuthenticated = $derived(() => {
		if (auth.isLoading) return data.isAuthenticated;
		return auth.isAuthenticated;
	});

	const promoTicker = [
		{ id: 'rain-pot', label: 'Rain pot nearly full', meta: '$12.4k pool � 8 slots left' },
		{ id: 'battle-queue', label: 'VIP battle lobby', meta: 'Avg pot $3.2k � invite only' },
		{ id: 'flash-drop', label: 'Flash drop finale', meta: 'Boosted odds end in 2m' }
	];

	// ? NEW: Use UI state for chat toggle
	const handleChatToggle = () => ui.toggleChat();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<!-- Modern App Shell: Header ? Content Container ? [Sidebar | Main | Chat] -->
<div class="bg-background text-foreground flex h-screen flex-col overflow-hidden">
	<!-- Global Header - Full Width, Fixed Height -->
	<header class="border-border bg-card z-50 flex-shrink-0 border-b backdrop-blur-xl">
		<ShellHeader {promoTicker} isAuthenticated={authIsAuthenticated()} user={authUser()} />
	</header>

	<!-- Main Content Container - Fills remaining height -->
	<div class="bg-background flex flex-1 overflow-hidden">
		<!-- Left Sidebar (Desktop Only) -->
		<aside
			class="border-border bg-card hidden w-[360px] flex-shrink-0 border-r lg:flex lg:flex-col"
		>
			<div class="flex h-full flex-col overflow-y-auto">
				<SidebarLeft isAuthenticated={authIsAuthenticated()} user={authUser()} />
			</div>
		</aside>

		<!-- Main Content Area - Scrollable -->
		<main class="flex-1 overflow-y-auto" aria-label="Primary content">
			<div class="mx-auto h-full w-full max-w-[1600px] px-3 py-4 sm:px-4 sm:py-5 lg:px-6 lg:py-6">
				{@render children?.()}
			</div>
		</main>

		<!-- Right Chat Sidebar (Desktop Only) -->
		<aside
			class="border-border bg-card hidden w-[360px] flex-shrink-0 border-l lg:flex lg:flex-col"
		>
			<div class="flex h-full flex-col overflow-hidden">
				<SidebarRight />
			</div>
		</aside>
	</div>

	<!-- Mobile Bottom Navigation - Only on screens < 1024px -->
	<div class="lg:hidden">
		<BottomNav
			isAuthenticated={authIsAuthenticated()}
			class="border-border/60 bg-card/98 fixed inset-x-0 bottom-0 z-50 border-t pb-[env(safe-area-inset-bottom)] backdrop-blur-xl"
		/>

		<!-- Mobile Chat Button -->
		<button
			type="button"
			class="bg-primary text-primary-foreground shadow-marketplace-md hover:bg-primary/90 hover:shadow-marketplace-lg focus-visible:ring-ring focus-visible:ring-offset-background fixed right-4 bottom-[88px] z-40 flex items-center gap-2 rounded-full px-4 py-3 text-sm font-semibold transition-all focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none md:right-6 md:bottom-[92px]"
			onclick={handleChatToggle}
			aria-pressed={ui.chatOpen}
			aria-label="Toggle chat"
		>
			<MessageCircle class="h-4 w-4" />
			<span class="hidden sm:inline">Chat & Rain Pot</span>
		</button>
	</div>

	<!-- Mobile Chat Drawer -->
	<ChatDrawer />
</div>
