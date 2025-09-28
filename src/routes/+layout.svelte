<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import Navbar from '$lib/components/shell/Navbar.svelte';
	import Sidebar from '$lib/components/shell/Sidebar.svelte';
	import BottomNav from '$lib/components/shell/BottomNav.svelte';
	import ChatDrawer from '$lib/components/shell/ChatDrawer.svelte';
	import { uiStore } from '$lib/stores/ui';
	import type { LayoutData } from './$types';

	let { children, data }: { children: any; data: LayoutData } = $props();

	const chatOpen = $derived($uiStore.chatOpen);
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<div class="mobile-viewport bg-base-100">
	<!-- Desktop Layout (1024px+) -->
	<div class="hidden lg:flex lg:h-screen lg:flex-col">
		<!-- Top Navbar -->
		<Navbar isAuthenticated={data.isAuthenticated} user={data.user} class="border-b-2" />

		<!-- Main Content Area with Sidebar -->
		<div class="flex flex-1 overflow-hidden">
			<!-- Sidebar -->
			<Sidebar isAuthenticated={data.isAuthenticated} class="w-64 border-r-2 border-base-300" />

			<!-- Main Content -->
			<main class="flex-1 overflow-y-auto">
				<div class="mx-auto max-w-7xl px-8 py-12">
					{@render children?.()}
				</div>
			</main>

			<!-- Chat Panel (Desktop Only) -->
			<ChatDrawer />
		</div>
	</div>

	<!-- Tablet Layout (768px - 1023px) -->
	<div class="hidden md:flex md:h-screen md:flex-col lg:hidden">
		<!-- Top Navbar -->
		<Navbar isAuthenticated={data.isAuthenticated} user={data.user} class="border-b-2" />

		<!-- Main Content without Sidebar -->
		<main class="flex-1 overflow-y-auto">
			<div class="mx-auto max-w-4xl px-6 py-8">
				{@render children?.()}
			</div>
		</main>

		<!-- Chat Sheet -->
		<ChatDrawer />
	</div>

	<!-- Mobile Layout (< 768px) - Mobile First -->
	<div class="flex h-screen flex-col md:hidden">
		<!-- Mobile Header with Safe Area -->
		<header class="pt-[env(safe-area-inset-top)]">
			<Navbar isAuthenticated={data.isAuthenticated} user={data.user} class="min-h-[56px] px-4" />
		</header>

		<!-- Main Content with Safe Scrolling -->
		<main class="flex-1 overflow-y-auto overscroll-contain">
			<div class="px-4 py-6 pb-24">
				{@render children?.()}
			</div>
		</main>

		<!-- Bottom Navigation with Safe Area -->
		<div class="fixed right-0 bottom-0 left-0 z-50 pb-[env(safe-area-inset-bottom)]">
			<BottomNav isAuthenticated={data.isAuthenticated} class="min-h-[64px]" />
		</div>

		<!-- Mobile Chat Drawer -->
		<ChatDrawer />
	</div>

	<!-- Global Loading Overlay -->
	{#if chatOpen}
		<div
			class="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
			role="presentation"
		></div>
	{/if}
</div>
