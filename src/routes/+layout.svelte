<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import ShellHeader from '$lib/components/shell/ShellHeader.svelte';
	import Sidebar from '$lib/components/shell/Sidebar.svelte';
	import BottomNav from '$lib/components/shell/BottomNav.svelte';
	import ChatDrawer from '$lib/components/shell/ChatDrawer.svelte';
	import CommunityRail from '$lib/components/home/CommunityRail.svelte';
	import { MessageCircle } from 'lucide-svelte';
	import { uiStore, closeSidebar, toggleChat } from '$lib/stores/ui';
	import type { LayoutData } from './$types';
	import type { Snippet } from 'svelte';

	const { children, data } = $props<{ children: Snippet; data: LayoutData }>();
	const uiState = $derived(uiStore);
	const chatOpen = $derived(() => uiState.chatOpen);
	const sidebarOpen = $derived(() => uiState.sidebarOpen);

	const promoTicker = [
		{ id: 'rain-pot', label: 'Rain pot nearly full', meta: '$12.4k pool · 8 slots left' },
		{ id: 'battle-queue', label: 'VIP battle lobby', meta: 'Avg pot $3.2k · invite only' },
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
		class="mx-auto grid min-h-[100dvh] w-full max-w-[1920px] grid-cols-1 gap-6 px-4 pt-4 pb-[92px] sm:px-6 lg:px-8 xl:grid-cols-[260px,minmax(0,1fr),320px] xl:items-start xl:gap-8 xl:px-10 xl:pt-6 xl:pb-6"
	>
		<aside class="hidden xl:sticky xl:top-0 xl:flex xl:min-h-[100dvh] xl:flex-col">
			<Sidebar isAuthenticated={data.isAuthenticated} user={data.user} class="flex-1" />
		</aside>

		<div
			class="xl:bg-surface/70 relative flex min-h-[100dvh] flex-col rounded-none xl:col-start-2 xl:min-h-0 xl:overflow-hidden xl:rounded-[32px] xl:border xl:border-white/10 xl:shadow-[0_32px_120px_rgba(15,23,42,0.35)] xl:backdrop-blur"
		>
			<div class="sticky top-0 z-30 xl:rounded-t-[32px]">
				<ShellHeader {promoTicker} isAuthenticated={data.isAuthenticated} user={data.user} />
			</div>
			<main
				class="marketplace-scrollbar flex-1 overflow-y-auto px-1 pt-6 pb-24 sm:px-3 md:px-4 xl:px-8 xl:pb-12"
				aria-label="Primary content"
			>
				<div class="mx-auto flex w-full max-w-none flex-col gap-10 pb-10">
					{@render children?.()}
				</div>
			</main>
		</div>

		<aside class="hidden xl:sticky xl:top-0 xl:flex xl:min-h-[100dvh] xl:flex-col">
			<CommunityRail />
		</aside>
	</div>

	<BottomNav
		isAuthenticated={data.isAuthenticated}
		class="fixed inset-x-0 bottom-0 z-40 border-t pb-[env(safe-area-inset-bottom)] lg:hidden"
	/>

	<button
		type="button"
		class="bg-primary text-primary-foreground shadow-marketplace-lg fixed right-4 bottom-[88px] z-40 flex items-center gap-3 rounded-full px-5 py-3 text-sm font-semibold sm:right-6 sm:bottom-[92px] lg:hidden"
		onclick={handleChatToggle}
		aria-pressed={chatOpen}
	>
		<span class="flex h-9 w-9 items-center justify-center rounded-full bg-white/15">
			<MessageCircle class="h-4 w-4" />
		</span>
		Chat & Rain Pot
	</button>

	<ChatDrawer />

	{#if sidebarOpen}
		<div
			class="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm xl:hidden"
			role="presentation"
			onclick={handleSidebarClose}
		></div>
		<div
			class="bg-surface/95 shadow-marketplace-lg fixed inset-y-0 left-0 z-50 w-[320px] max-w-[88vw] overflow-y-auto px-4 pt-4 pb-8 backdrop-blur-xl xl:hidden"
		>
			<Sidebar
				isAuthenticated={data.isAuthenticated}
				user={data.user}
				class="h-full"
				density="compact"
			/>
		</div>
	{/if}
</div>
