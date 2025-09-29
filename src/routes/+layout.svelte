<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import Navbar from '$lib/components/shell/Navbar.svelte';
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
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<div
	class="bg-background text-foreground relative flex min-h-screen flex-col"
	style="--shell-header-height: 76px"
>
	<Navbar
		isAuthenticated={data.isAuthenticated}
		user={data.user}
		class="border-border/60 border-b"
	/>

	<div class="flex-1 overflow-hidden">
		<div
			class="mx-auto flex h-full w-full max-w-[1600px] gap-6 px-4 pt-6 pb-20 sm:px-6 lg:px-8 xl:gap-7"
		>
			<div class="hidden xl:flex xl:w-[248px] xl:flex-none">
				<div
					class="sticky top-[calc(var(--shell-header-height)+1.5rem)] h-[calc(100vh-var(--shell-header-height)-1.5rem)] w-full"
				>
					<Sidebar isAuthenticated={data.isAuthenticated} user={data.user} class="h-full" />
				</div>
			</div>

			<main class="marketplace-scrollbar flex-1 overflow-y-auto" aria-label="Primary content">
				<div class="mx-auto flex w-full max-w-5xl flex-col gap-12 px-1 pt-6 pb-16 sm:px-2">
					{@render children?.()}
				</div>
			</main>

			<div class="hidden xl:flex xl:w-[296px] xl:flex-none">
				<div
					class="sticky top-[calc(var(--shell-header-height)+1.5rem)] h-[calc(100vh-var(--shell-header-height)-1.5rem)] w-full"
				>
					<CommunityRail />
				</div>
			</div>
		</div>
	</div>

	<BottomNav
		isAuthenticated={data.isAuthenticated}
		class="fixed inset-x-0 bottom-0 z-40 border-t pb-[env(safe-area-inset-bottom)] md:hidden"
	/>

	<button
		type="button"
		class="bg-primary text-primary-foreground shadow-marketplace-lg fixed right-4 bottom-20 z-40 flex h-12 w-12 items-center justify-center rounded-full md:hidden"
		onclick={toggleChat}
		aria-pressed={chatOpen}
	>
		<MessageCircle class="h-6 w-6" />
		<span class="sr-only">Open chat</span>
	</button>

	<ChatDrawer />

	{#if sidebarOpen}
		<div
			class="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm xl:hidden"
			role="presentation"
			onclick={closeSidebar}
		></div>
		<div
			class="bg-surface/95 shadow-marketplace-lg fixed inset-y-0 left-0 z-50 w-[260px] max-w-full overflow-y-auto px-5 pt-6 pb-8 backdrop-blur-xl xl:hidden"
		>
			<Sidebar isAuthenticated={data.isAuthenticated} user={data.user} class="h-full" />
		</div>
	{/if}
</div>
