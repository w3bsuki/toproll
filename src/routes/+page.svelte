<script lang="ts">
	// ✅ FIXED: Use $app/state instead of $app/stores
	import { page } from '$app/state';
	import { HeroBanner, MarketplaceGrid } from '$lib/features/home';
	import { CommunityPotsGrid } from '$lib/features/pots';
	import type { Pot } from '$lib/types/index';
	import Alert from '$lib/components/ui/alert.svelte';
	import { Button } from '$lib/components/ui';
	import { AlertCircle, Users, Clock, Trophy, Gift } from '@lucide/svelte';

	const error = $derived(page.url.searchParams.get('error'));

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
	const mockCommunityPots: Pot[] = [
		{
			id: 'rain-pot-1',
			name: 'Community Rain',
			description: 'Daily community rain event',
			entry_cost: 10,
			max_tickets: 500,
			max_per_user: 10,
			total_tickets: 287,
			total_value: 2870,
			status: 'open',
			fill_percent: (287 / 500) * 100,
			created_at: new Date().toISOString(),
			updated_at: new Date().toISOString(),
			expires_at: new Date(Date.now() + 86400000).toISOString(),
			commit_hash: 'mock-hash-1'
		},
		{
			id: 'vip-rain-1',
			name: 'VIP Elite Rain',
			description: 'Exclusive VIP rain event',
			entry_cost: 25,
			max_tickets: 100,
			max_per_user: 5,
			total_tickets: 45,
			total_value: 1125,
			status: 'open',
			fill_percent: (45 / 100) * 100,
			created_at: new Date().toISOString(),
			updated_at: new Date().toISOString(),
			expires_at: new Date(Date.now() + 43200000).toISOString(),
			commit_hash: 'mock-hash-2'
		},
		{
			id: 'flash-pot-1',
			name: 'Flash Drop',
			description: 'Limited time flash event',
			entry_cost: 5,
			max_tickets: 150,
			max_per_user: 3,
			total_tickets: 89,
			total_value: 445,
			status: 'locked',
			fill_percent: (89 / 150) * 100,
			created_at: new Date().toISOString(),
			updated_at: new Date().toISOString(),
			expires_at: new Date(Date.now() + 3600000).toISOString(),
			commit_hash: 'mock-hash-3'
		},
		{
			id: 'tournament-1',
			name: 'Weekend Tournament',
			description: 'Compete for the grand prize',
			entry_cost: 50,
			max_tickets: 200,
			max_per_user: 10,
			total_tickets: 156,
			total_value: 7800,
			status: 'open',
			fill_percent: (156 / 200) * 100,
			created_at: new Date().toISOString(),
			updated_at: new Date().toISOString(),
			expires_at: new Date(Date.now() + 172800000).toISOString(),
			commit_hash: 'mock-hash-4'
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
