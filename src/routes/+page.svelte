<script lang="ts">
	import { page } from '$app/stores';
	import HeroBanner from '$lib/components/home/HeroBanner.svelte';
	import MarketplaceGrid from '$lib/components/home/MarketplaceGrid.svelte';
	import CommunityPotsGrid from '$lib/components/CommunityPotsGrid.svelte';
	import type { CommunityPot } from '$lib/components/CommunityPotCard.svelte';
	import { Alert, Button } from '$lib/components/ui';
	import { AlertCircle, Users, Clock, Trophy, Gift } from '@lucide/svelte';

	const error = $derived($page.url.searchParams.get('error'));

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

	// Mock data for Community Pots
	const mockCommunityPots: CommunityPot[] = [
		{
			id: 'rain-pot-1',
			name: 'Community Rain',
			type: 'rain',
			description: 'Daily community rain event',
			totalAmount: 15420,
			contributorCount: 287,
			maxContributors: 500,
			timeRemaining: 86400, // 24 hours
			status: 'active',
			prizePool: 15420,
			isVIP: false
		},
		{
			id: 'vip-rain-1',
			name: 'VIP Elite Rain',
			type: 'vip',
			description: 'Exclusive VIP rain event',
			totalAmount: 8750,
			contributorCount: 45,
			maxContributors: 100,
			timeRemaining: 43200, // 12 hours
			status: 'active',
			prizePool: 8750,
			isVIP: true,
			entryRequirement: 'VIP Level 3+'
		},
		{
			id: 'flash-pot-1',
			name: 'Flash Drop',
			type: 'flash',
			description: 'Limited time flash event',
			totalAmount: 3200,
			contributorCount: 89,
			maxContributors: 150,
			timeRemaining: 3600, // 1 hour
			status: 'ending-soon',
			prizePool: 3200,
			isVIP: false
		},
		{
			id: 'tournament-1',
			name: 'Weekend Tournament',
			type: 'tournament',
			description: 'Compete for the grand prize',
			totalAmount: 25000,
			contributorCount: 156,
			maxContributors: 200,
			timeRemaining: 172800, // 48 hours
			status: 'active',
			prizePool: 25000,
			isVIP: false
		}
	];
</script>

<svelte:head>
	<title>TopRoll - CS2 Community Pots & Marketplace</title>
</svelte:head>

<div class="space-y-6">
	<!-- Hero Banner - Community Pots Focus -->
	<HeroBanner />

	<!-- Community Pots Grid -->
	<CommunityPotsGrid
		pots={mockCommunityPots}
		onJoinPot={(potId) => console.log('Join pot:', potId)}
		onViewPot={(potId) => console.log('View pot:', potId)}
		onRefresh={() => console.log('Refresh pots')}
	/>

	<!-- Live Marketplace -->
	<MarketplaceGrid />
</div>
