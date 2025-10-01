<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import ShellHeader from '$lib/components/shell/ShellHeader.svelte';
	import Sidebar from '$lib/components/shell/Sidebar.svelte';
	import SidebarCTA from '$lib/components/shell/SidebarCTA.svelte';
	import BottomNav from '$lib/components/shell/BottomNav.svelte';
	import ChatDrawer from '$lib/components/shell/ChatDrawer.svelte';
	import ChatPanel from '$lib/components/shell/ChatPanel.svelte';
	import { MessageCircle } from 'lucide-svelte';
	import { uiStore, closeSidebar, toggleChat } from '$lib/stores/ui';
	import { get } from 'svelte/store';
	import type { LayoutData } from './$types';
	import type { Snippet } from 'svelte';

	const { children, data } = $props<{ children: Snippet; data: LayoutData }>();
	const uiState = $derived(get(uiStore));
	const chatOpen = $derived(uiState.chatOpen);
	const sidebarOpen = $derived(uiState.sidebarOpen);

	const promoTicker = [
		{ id: 'rain-pot', label: 'Rain pot nearly full', meta: '$12.4k pool • 8 slots left' },
		{ id: 'battle-queue', label: 'VIP battle lobby', meta: 'Avg pot $3.2k • invite only' },
		{ id: 'flash-drop', label: 'Flash drop finale', meta: 'Boosted odds end in 2m' }
	];

	const handleChatToggle = () => toggleChat();
	const handleSidebarClose = () => closeSidebar();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<div class="bg-background text-foreground">
	<div
		class="mx-auto grid min-h-[100dvh] w-full max-w-[1920px] grid-cols-1 gap-4 px-4 pt-4 pb-[92px] sm:px-6 lg:grid-cols-[280px_minmax(0,1fr)_360px] lg:gap-6 lg:px-8 xl:px-10"
	>
		<aside class="block">
			<div class="sticky top-4 flex h-[calc(100dvh-2rem)] flex-col">
				<Sidebar isAuthenticated={data.isAuthenticated} user={data.user} class="flex-1">
					<SidebarCTA />
				</Sidebar>
			</div>
		</aside>

		<div
			class="lg:border-border/50 lg:bg-surface/70 lg:shadow-marketplace-lg relative flex min-h-[100dvh] flex-col rounded-none lg:col-start-2 lg:rounded-[32px] lg:border lg:backdrop-blur"
		>
			<div class="sticky top-0 z-30 lg:rounded-t-[32px]">
				<ShellHeader {promoTicker} isAuthenticated={data.isAuthenticated} user={data.user} />
			</div>
			<main
				class="marketplace-scrollbar flex-1 overflow-y-auto px-1 pt-6 pb-20 sm:px-3 md:px-4 lg:px-8"
				aria-label="Primary content"
			>
				<div class="mx-auto flex w-full max-w-none flex-col gap-10 pb-6 lg:gap-12">
					{@render children?.()}
				</div>
			</main>
		</div>

		<aside class="block">
			<div class="sticky top-4 flex h-[calc(100dvh-2rem)] flex-col">
				<div
					class="border-border/50 bg-surface/80 shadow-marketplace-lg flex-1 rounded-[32px] border p-6 backdrop-blur-xl"
				>
					<ChatPanel />
				</div>
			</div>
		</aside>
	</div>

	<BottomNav
		isAuthenticated={data.isAuthenticated}
		class="fixed inset-x-0 bottom-0 z-40 border-t pb-[env(safe-area-inset-bottom)] lg:hidden"
	/>

	<button
		type="button"
		class="bg-primary text-primary-foreground shadow-marketplace-lg fixed right-4 bottom-[92px] z-40 flex items-center gap-3 rounded-full px-4 py-3 text-sm font-medium md:right-6 md:bottom-[96px] lg:hidden"
		onclick={handleChatToggle}
		aria-pressed={chatOpen}
	>
		<span class="bg-surface/40 flex h-9 w-9 items-center justify-center rounded-full">
			<MessageCircle class="h-4 w-4" />
		</span>
		Chat & Rain Pot
	</button>

	<ChatDrawer />

	{#if sidebarOpen}
		<div
			class="bg-background/75 fixed inset-0 z-40 backdrop-blur-sm lg:hidden"
			role="presentation"
			onclick={handleSidebarClose}
		></div>
		<div
			class="bg-surface/95 shadow-marketplace-lg fixed inset-y-0 left-0 z-50 w-[320px] max-w-[88vw] overflow-y-auto px-6 pt-6 pb-8 backdrop-blur-xl lg:hidden"
		>
			<Sidebar isAuthenticated={data.isAuthenticated} user={data.user} class="h-full">
				<SidebarCTA />
			</Sidebar>
		</div>
	{/if}
</div>
