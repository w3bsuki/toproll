<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import SidebarLeft from '$lib/components/sidebar-left.svelte';
	import SidebarRight from '$lib/components/sidebar-right.svelte';
	import ShellHeader from '$lib/components/shell/ShellHeader.svelte';
	import BottomNav from '$lib/components/shell/BottomNav.svelte';
	import ChatDrawer from '$lib/components/shell/ChatDrawer.svelte';
	import * as SidebarPrimitive from '$lib/components/ui/sidebar/index.js';
	import { MessageCircle } from '@lucide/svelte';
	import { uiStore, toggleChat } from '$lib/stores/ui';
	import { get } from 'svelte/store';
	import type { LayoutData } from './$types';
	import type { Snippet } from 'svelte';

	const { children, data } = $props<{ children: Snippet; data: LayoutData }>();
	const uiState = $derived(get(uiStore));
	const chatOpen = $derived(uiState.chatOpen);

	const promoTicker = [
		{ id: 'rain-pot', label: 'Rain pot nearly full', meta: '$12.4k pool • 8 slots left' },
		{ id: 'battle-queue', label: 'VIP battle lobby', meta: 'Avg pot $3.2k • invite only' },
		{ id: 'flash-drop', label: 'Flash drop finale', meta: 'Boosted odds end in 2m' }
	];

	const handleChatToggle = () => toggleChat();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<!-- Modern App Shell: Header → Content Container → [Sidebar | Main | Chat] -->
<div class="flex h-screen flex-col overflow-hidden bg-background text-foreground">
	<!-- Global Header - Full Width, Fixed Height -->
	<header class="z-50 flex-shrink-0 border-b border-border bg-card backdrop-blur-xl">
		<ShellHeader {promoTicker} isAuthenticated={data.isAuthenticated} user={data.user} />
	</header>

	<!-- Main Content Container - Fills remaining height -->
	<div class="flex flex-1 overflow-hidden bg-background">
		<!-- Left Sidebar (Desktop Only) -->
		<aside class="hidden w-[280px] flex-shrink-0 border-r border-border bg-card lg:flex lg:flex-col">
			<div class="flex h-full flex-col overflow-y-auto">
				<SidebarLeft isAuthenticated={data.isAuthenticated} user={data.user} />
			</div>
		</aside>

		<!-- Main Content Area - Scrollable -->
		<main class="flex-1 overflow-y-auto" aria-label="Primary content">
			<div class="mx-auto h-full w-full max-w-[1400px] px-4 py-6 sm:px-6 lg:px-8">
				{@render children?.()}
			</div>
		</main>

		<!-- Right Chat Sidebar (Desktop Only) -->
		<aside class="hidden w-[360px] flex-shrink-0 border-l border-border bg-card lg:flex lg:flex-col">
			<div class="flex h-full flex-col overflow-hidden">
				<SidebarRight />
			</div>
		</aside>
	</div>

	<!-- Mobile Bottom Navigation - Only on screens < 1024px -->
	<div class="lg:hidden">
		<BottomNav
			isAuthenticated={data.isAuthenticated}
			class="fixed inset-x-0 bottom-0 z-50 border-t border-border/60 bg-card/98 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl"
		/>

		<!-- Mobile Chat Button -->
		<button
			type="button"
			class="fixed right-4 bottom-[88px] z-40 flex items-center gap-2 rounded-full bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-marketplace-md transition-all duration-accent hover:scale-105 hover:shadow-marketplace-lg active:scale-95 md:right-6 md:bottom-[92px]"
			onclick={handleChatToggle}
			aria-pressed={chatOpen}
			aria-label="Toggle chat"
		>
			<MessageCircle class="h-4 w-4" />
			<span class="hidden sm:inline">Chat & Rain Pot</span>
		</button>
	</div>

	<!-- Mobile Chat Drawer -->
	<ChatDrawer />
</div>
