<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import ShellHeader from '$lib/components/shell/ShellHeader.svelte';
	import Sidebar from '$lib/components/shell/Sidebar.svelte';
	import SidebarCTA from '$lib/components/shell/SidebarCTA.svelte';
	import BottomNav from '$lib/components/shell/BottomNav.svelte';
	import ChatDrawer from '$lib/components/shell/ChatDrawer.svelte';
	import ChatList from '$lib/components/chat/ChatList.svelte';
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
	<div class="mx-auto flex min-h-[100dvh] w-full max-w-[1920px]">
		<aside class="hidden lg:flex lg:w-[min(320px,24vw)] lg:flex-col lg:px-6 xl:px-8">
			<div class="top-lg sticky flex h-[calc(100dvh-var(--space-xl))] flex-col">
				<Sidebar isAuthenticated={data.isAuthenticated} user={data.user} class="flex-1">
					<SidebarCTA />
				</Sidebar>
			</div>
		</aside>

		<div class="flex min-h-[100dvh] flex-1 flex-col lg:pr-6 xl:pr-8">
			<ShellHeader
				class="z-header border-border/50 bg-surface/80 sticky top-0 border-b backdrop-blur"
				{promoTicker}
				isAuthenticated={data.isAuthenticated}
				user={data.user}
			/>

			<div
				class="gap-lg pt-lg flex min-h-0 flex-1 flex-col px-4 pb-[calc(var(--space-xl)+env(safe-area-inset-bottom))] sm:px-6 md:px-8"
			>
				<div
					class="gap-lg flex min-h-0 flex-1 flex-col lg:grid lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start"
				>
					<main aria-label="Primary content" class="flex min-h-0 flex-1 flex-col">
						<div class="scrollbar-elevated flex-1 overflow-y-auto">
							<div class="gap-xl pb-2xl mx-auto flex w-full max-w-[1100px] flex-col">
								{@render children?.()}
							</div>
						</div>
					</main>

					<aside id="chat" class="hidden min-h-0 flex-col lg:flex">
						<div
							class="border-border/60 bg-surface-raised/90 p-md shadow-elevated-md sticky top-[calc(var(--size-header)+var(--space-lg))] flex max-h-[calc(100dvh-var(--size-header)-var(--space-xl)*2)] flex-1 rounded-xl border backdrop-blur"
						>
							<ChatList />
						</div>
					</aside>
				</div>
			</div>
		</div>
	</div>

	<BottomNav
		isAuthenticated={data.isAuthenticated}
		class="z-header border-border/60 bg-surface/95 shadow-elevated-sm fixed inset-x-0 bottom-0 border-t pb-[max(var(--space-sm),env(safe-area-inset-bottom))] lg:hidden"
	/>

	<button
		type="button"
		class="right-lg z-header gap-sm bg-primary px-md py-sm text-primary-foreground shadow-elevated-md hover:bg-accent-500 focus-visible:ring-ring focus-visible:ring-offset-background fixed bottom-[calc(var(--space-xl)+var(--space-lg))] flex items-center rounded-full text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 lg:hidden"
		onclick={handleChatToggle}
		aria-pressed={chatOpen}
	>
		<span
			class="bg-surface-subdued text-primary flex h-10 w-10 items-center justify-center rounded-full"
		>
			<MessageCircle class="h-4 w-4" />
		</span>
		Chat & Rain Pot
	</button>

	<ChatDrawer />

	{#if sidebarOpen}
		<div
			class="z-overlay bg-background/75 fixed inset-0 backdrop-blur-sm lg:hidden"
			role="presentation"
			onclick={handleSidebarClose}
		></div>
		<div
			class="z-popover border-border/60 bg-surface/95 px-lg pt-xl shadow-elevated-lg fixed inset-y-0 left-0 w-[320px] max-w-[88vw] overflow-y-auto border-r pb-[max(var(--space-xl),env(safe-area-inset-bottom))] backdrop-blur lg:hidden"
		>
			<Sidebar isAuthenticated={data.isAuthenticated} user={data.user} class="h-full">
				<SidebarCTA />
			</Sidebar>
		</div>
	{/if}
</div>
