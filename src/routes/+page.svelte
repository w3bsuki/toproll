<script lang="ts">
	import { page } from '$app/stores';
	import HeroCarousel from '$lib/components/home/HeroCarousel.svelte';
	import MarketplaceGrid from '$lib/components/home/MarketplaceGrid.svelte';
	import HorizontalScroller, {
		type HorizontalItem
	} from '$lib/components/home/HorizontalScroller.svelte';
	import ScrollableTabs, {
		type ScrollableTab
	} from '$lib/components/ui/navigation/ScrollableTabs.svelte';
	import { Alert, Button } from '$lib/components/ui';
	import { AlertCircle } from '@lucide/svelte';

	const pageStore = page;
	const currentPage = $derived(pageStore);
	const error = $derived(() => currentPage.url.searchParams.get('error'));

	const errorMessages: Record<string, { title: string; description: string; action?: string }> = {
		auth_required: {
			title: 'Authentication Required',
			description: 'Please sign in with Steam to access your profile and inventory.',
			action: 'Sign In'
		},
		steam_auth_failed: {
			title: 'Steam Authentication Failed',
			description: 'There was a problem authenticating with Steam. Please try again.',
			action: 'Try Again'
		},
		steam_profile_not_found: {
			title: 'Steam Profile Not Found',
			description: "We couldn't find your Steam profile. Please make sure your profile is public.",
			action: 'Try Again'
		},
		config_error: {
			title: 'Configuration Error',
			description: "There's a temporary issue with our Steam integration. Please try again later.",
			action: 'Try Later'
		},
		auth_failed: {
			title: 'Authentication Failed',
			description: 'Something went wrong during authentication. Please try signing in again.',
			action: 'Try Again'
		}
	};

	const currentError = $derived(() => (error ? (errorMessages[error] ?? null) : null));

	const categoryTabs: ScrollableTab[] = [
		{ id: 'featured', label: 'Featured', badge: 'Live' },
		{ id: 'cases', label: 'Cases' },
		{ id: 'battles', label: 'Battles' },
		{ id: 'upgrader', label: 'Upgrader' },
		{ id: 'pots', label: 'Pots' }
	];

	let activeTab = $state(categoryTabs[0].id);

	const featuredRows: { title: string; caption?: string; items: HorizontalItem[] }[] = [
		{
			title: 'Community Pots',
			caption: 'Active rain pots and community bonuses',
			items: [
				{
					id: 'rain-pot-active',
					title: 'Rain Pot Active',
					subtitle: '312 contributors · Active now',
					meta: 'Live',
					highlight: '$12,400 pool',
					cta: 'Join Rain Pot',
					background:
						'radial-gradient(circle at 20% 20%, rgba(16, 185, 129, 0.55), transparent 55%), radial-gradient(circle at 80% 30%, rgba(45, 212, 191, 0.35), transparent 50%), rgba(12, 74, 110, 0.88)'
				},
				{
					id: 'vip-rain-cycle',
					title: 'VIP Rain Cycle',
					subtitle: 'Daily guaranteed · 3 invites',
					meta: 'VIP',
					highlight: 'Pool $12.4k',
					cta: 'View invites',
					background:
						'radial-gradient(circle at 30% 70%, rgba(59, 130, 246, 0.45), transparent 60%), radial-gradient(circle at 70% 30%, rgba(147, 197, 253, 0.3), transparent 55%), rgba(15, 23, 42, 0.92)'
				},
				{
					id: 'flash-rain-boost',
					title: 'Flash Rain Boost',
					subtitle: 'Limited time · 6 slots left',
					meta: 'Flash',
					highlight: '2x multiplier',
					cta: 'Secure slot',
					background:
						'radial-gradient(circle at 25% 30%, rgba(34, 197, 94, 0.55), transparent 60%), radial-gradient(circle at 75% 70%, rgba(16, 185, 129, 0.35), transparent 55%), rgba(15, 118, 110, 0.85)'
				}
			]
		}
	];

	const casesRows = [
		{
			title: 'Curated community cases',
			items: [
				{
					id: 'spectrum',
					title: 'Spectrum II Refresh',
					subtitle: 'Live demand spikes · Transparent odds',
					meta: 'Community',
					cta: 'Browse cases',
					background:
						'radial-gradient(circle at 30% 30%, rgba(34, 197, 94, 0.5), transparent 60%), radial-gradient(circle at 70% 70%, rgba(74, 222, 128, 0.4), transparent 55%), rgba(17, 24, 39, 0.92)'
				},
				{
					id: 'recoil',
					title: 'Recoil Reloaded',
					subtitle: 'Stable odds with boosted streak multipliers',
					meta: 'Stable',
					cta: 'Inspect lineup',
					background:
						'radial-gradient(circle at 30% 35%, rgba(99, 102, 241, 0.5), transparent 60%), radial-gradient(circle at 75% 65%, rgba(165, 180, 252, 0.4), transparent 55%), rgba(30, 41, 59, 0.92)'
				}
			]
		}
	];

	const battlesRows = [
		{
			title: 'Live battle rotations',
			items: [
				{
					id: 'double-up',
					title: 'Double-Up Frenzy',
					subtitle: '4 case rotation · Transparent rake 5%',
					meta: '2v2',
					cta: 'Join queue',
					background:
						'radial-gradient(circle at 25% 30%, rgba(59, 130, 246, 0.45), transparent 55%), radial-gradient(circle at 70% 70%, rgba(29, 78, 216, 0.35), transparent 50%), rgba(15, 23, 42, 0.92)'
				},
				{
					id: 'clash-night',
					title: 'Clash Night Finals',
					subtitle: 'Average pot $2.1k · 3 seats remaining',
					meta: 'Finals',
					cta: 'Spectate',
					background:
						'radial-gradient(circle at 20% 70%, rgba(253, 186, 116, 0.6), transparent 55%), radial-gradient(circle at 80% 30%, rgba(248, 113, 113, 0.4), transparent 50%), rgba(24, 24, 27, 0.9)'
				}
			]
		}
	];

	const upgraderRows = [
		{
			title: 'Smart upgrade paths',
			items: [
				{
					id: 'safe-upgrade',
					title: 'Safe climb 1.5x',
					subtitle: 'Low variance ladder · Auto cashout',
					meta: 'Secure',
					cta: 'Start ladder',
					background:
						'radial-gradient(circle at 25% 20%, rgba(45, 212, 191, 0.5), transparent 60%), radial-gradient(circle at 75% 70%, rgba(56, 189, 248, 0.45), transparent 55%), rgba(12, 74, 110, 0.85)'
				},
				{
					id: 'all-in',
					title: 'All-in 5x push',
					subtitle: 'Manual commit with safety net rollbacks',
					meta: 'High risk',
					cta: 'Configure odds',
					background:
						'radial-gradient(circle at 35% 35%, rgba(236, 72, 153, 0.6), transparent 60%), radial-gradient(circle at 80% 70%, rgba(79, 70, 229, 0.45), transparent 55%), rgba(24, 24, 27, 0.95)'
				}
			]
		}
	];

	const potsRows = [
		{
			title: 'Community rain cycles',
			items: [
				{
					id: 'flash-rain',
					title: 'Flash rain boost',
					subtitle: 'Ends in 1m · 6 slots left',
					meta: 'Flash',
					cta: 'Secure slot',
					background:
						'radial-gradient(circle at 20% 50%, rgba(34, 197, 94, 0.55), transparent 60%), radial-gradient(circle at 80% 40%, rgba(16, 185, 129, 0.35), transparent 55%), rgba(15, 118, 110, 0.85)'
				},
				{
					id: 'vip-cycle',
					title: 'VIP cycle',
					subtitle: 'Guaranteed daily payout · 3 invites pending',
					meta: 'VIP',
					cta: 'View invites',
					background:
						'radial-gradient(circle at 70% 30%, rgba(59, 130, 246, 0.45), transparent 60%), radial-gradient(circle at 30% 70%, rgba(147, 197, 253, 0.3), transparent 55%), rgba(15, 23, 42, 0.92)'
				}
			]
		}
	];

	const tabRows: Record<string, { title: string; caption?: string; items: HorizontalItem[] }[]> = {
		featured: featuredRows,
		cases: casesRows,
		battles: battlesRows,
		upgrader: upgraderRows,
		pots: potsRows
	};
</script>

<svelte:head>
	<title>TopRoll - CS2 Marketplace</title>
</svelte:head>

<div class="space-y-12">

	<HeroCarousel />

	<section class="space-y-6">
		<ScrollableTabs
			tabs={categoryTabs}
			activeId={activeTab}
			on:change={(event) => (activeTab = event.detail)}
		/>
		<div class="space-y-8">
			{#each tabRows[activeTab] as row (row.title)}
				<HorizontalScroller title={row.title} caption={row.caption} items={row.items} />
			{/each}
		</div>
	</section>

	<MarketplaceGrid />
</div>
