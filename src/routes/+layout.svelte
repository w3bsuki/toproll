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

	let { children, data }: { children: any; data: LayoutData } = $props();

	const chatOpen = $derived($uiStore.chatOpen);
	const sidebarOpen = $derived($uiStore.sidebarOpen);

	const promoTicker = [
		{ id: 'rain-pot', label: 'Rain pot nearly full', meta: '$12.4k pool · 8 slots left' },
		{ id: 'battle-queue', label: 'VIP battle lobby', meta: 'Avg pot $3.2k · invite only' },
		{ id: 'flash-drop', label: 'Flash drop finale', meta: 'Boosted odds end in 2m' }
	];
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<div class="bg-background text-foreground relative min-h-screen">
	<div
		class="mx-auto flex w-full max-w-[1920px] flex-col px-4 pt-4 pb-[92px] sm:px-6 lg:px-8 xl:px-10"
	>
		<div class="grid flex-1 gap-4 xl:grid-cols-[280px,minmax(0,1fr),360px] xl:gap-6">
			<aside class="hidden xl:block">
				<div class="sticky top-4 h-[calc(100vh-2rem)]">
					<Sidebar isAuthenticated={data.isAuthenticated} user={data.user} class="h-full" />
				</div>
			</aside>

			<div
				class="xl:bg-surface/70 relative flex min-h-[calc(100vh-4rem)] flex-col overflow-hidden xl:rounded-[32px] xl:border xl:border-white/10 xl:shadow-[0_32px_120px_rgba(15,23,42,0.35)] xl:backdrop-blur"
			>
				<div class="sticky top-0 z-30">
					<ShellHeader {promoTicker} isAuthenticated={data.isAuthenticated} user={data.user} />
				</div>
				<main
					class="marketplace-scrollbar flex-1 overflow-y-auto px-1 pt-6 pb-16 sm:px-3 md:px-4 xl:px-8"
					aria-label="Primary content"
				>
					<div class="mx-auto flex w-full max-w-[1140px] flex-col gap-12 pb-6">
						{@render children?.()}
					</div>
				</main>
			</div>

			<aside class="hidden xl:block">
				<div class="sticky top-4 h-[calc(100vh-2rem)]">
					<CommunityRail />
				</div>
			</aside>
		</div>
	</div>

	<BottomNav
		isAuthenticated={data.isAuthenticated}
		class="fixed inset-x-0 bottom-0 z-40 border-t pb-[env(safe-area-inset-bottom)] xl:hidden"
	/>

	<button
		type="button"
		class="bg-primary text-primary-foreground shadow-marketplace-lg fixed right-4 bottom-[92px] z-40 flex items-center gap-3 rounded-full px-4 py-3 text-sm font-medium md:right-6 md:bottom-[96px] xl:hidden"
		onclick={toggleChat}
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
			onclick={closeSidebar}
		></div>
		<div
			class="bg-surface/95 shadow-marketplace-lg fixed inset-y-0 left-0 z-50 w-[320px] max-w-[88vw] overflow-y-auto px-6 pt-6 pb-8 backdrop-blur-xl xl:hidden"
		>
			<Sidebar isAuthenticated={data.isAuthenticated} user={data.user} class="h-full" />
		</div>
	{/if}
</div>
