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
<div class="bg-background text-foreground flex h-screen flex-col overflow-hidden">
	<!-- Global Header - Full Width, Fixed Height -->
	<header class="border-border bg-card z-50 flex-shrink-0 border-b backdrop-blur-xl">
		<ShellHeader {promoTicker} isAuthenticated={data.isAuthenticated} user={data.user} />
	</header>

	<!-- Main Content Container - Fills remaining height -->
	<div class="bg-background flex flex-1 overflow-hidden">
		<!-- Left Sidebar (Desktop Only) -->
		<aside
			class="border-border bg-card hidden w-[360px] flex-shrink-0 border-r lg:flex lg:flex-col"
		>
			<div class="flex h-full flex-col overflow-y-auto">
				<SidebarLeft isAuthenticated={data.isAuthenticated} user={data.user} />
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
			isAuthenticated={data.isAuthenticated}
			class="border-border/60 bg-card/98 fixed inset-x-0 bottom-0 z-50 border-t pb-[env(safe-area-inset-bottom)] backdrop-blur-xl"
		/>

		<!-- Mobile Chat Button -->
		<button
			type="button"
			class="bg-primary text-primary-foreground shadow-marketplace-md hover:bg-primary/90 hover:shadow-marketplace-lg focus-visible:ring-ring focus-visible:ring-offset-background fixed right-4 bottom-[88px] z-40 flex items-center gap-2 rounded-full px-4 py-3 text-sm font-semibold transition-all focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none md:right-6 md:bottom-[92px]"
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
