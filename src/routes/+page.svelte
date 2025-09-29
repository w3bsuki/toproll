<script lang="ts">
	import { page } from '$app/stores';
	import HeroCarousel from '$lib/components/home/HeroCarousel.svelte';
	import MarketplaceGrid from '$lib/components/home/MarketplaceGrid.svelte';
	import KpiStrip from '$lib/components/home/KpiStrip.svelte';
	import CommunityPots from '$lib/components/home/CommunityPots.svelte';
	import { openChat } from '$lib/stores/ui';
	import { AlertCircle, MessageCircle, Sparkles } from 'lucide-svelte';
	import {
		Alert,
		Button,
		Card,
		CardContent,
		CardHeader,
		CardTitle,
		CardDescription,
		Badge
	} from '$lib/components/ui';

	interface Props {
		data: any;
	}

	let { data }: Props = $props();

	const error = $page.url.searchParams.get('error');

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

	const currentError = error ? errorMessages[error] : null;

	const flashUpdates = [
		{ title: 'Rain pot slots nearly full', caption: '20 spots · $12.4k pool' },
		{ title: 'VIP battle lobby spinning', caption: 'Avg pot $3.2k · invite only' },
		{ title: 'Flash drop ends in 2m', caption: 'Boosted odds live' }
	];

	const quickCtas = [
		{ label: 'Launch battle lobby', icon: Sparkles, action: () => {} },
		{ label: 'Open community chat', icon: MessageCircle, action: openChat }
	];
</script>

<svelte:head>
	<title>TopRoll - CS2 Marketplace</title>
</svelte:head>

<div class="space-y-12">
	{#if currentError}
		<Alert variant="destructive" class="items-start">
			<AlertCircle class="h-5 w-5" />
			<div class="space-y-2">
				<p class="text-sm font-semibold">{currentError.title}</p>
				<p class="text-muted-foreground text-sm">{currentError.description}</p>
				{#if currentError.action === 'Sign In'}
					<form method="POST" action="/api/auth/steam/login">
						<Button type="submit" size="sm" class="mt-1">Sign in with Steam</Button>
					</form>
				{:else if currentError.action === 'Try Again'}
					<form method="POST" action="/api/auth/steam/login">
						<Button type="submit" variant="outline" size="sm" class="mt-1"
							>Retry authentication</Button
						>
					</form>
				{/if}
			</div>
		</Alert>
	{/if}

	<div class="space-y-8">
		<HeroCarousel />
		<MarketplaceGrid />
		<KpiStrip />
	</div>

	<section class="grid gap-8 xl:grid-cols-[1.35fr,1fr]">
		<CommunityPots />
		<Card class="border-border/50 bg-surface/80 border">
			<CardHeader class="gap-2">
				<Badge variant="outline" class="w-fit text-[10px] tracking-[0.35em] uppercase"
					>Desk feed</Badge
				>
				<CardTitle class="text-xl font-semibold tracking-tight">Flash updates</CardTitle>
				<CardDescription class="text-sm">Quick reads from the operations desk.</CardDescription>
			</CardHeader>
			<CardContent class="space-y-4">
				{#each flashUpdates as update}
					<div class="border-border/60 bg-surface-muted/40 rounded-2xl border p-4">
						<p class="text-sm font-semibold tracking-tight">{update.title}</p>
						<p class="text-muted-foreground text-xs leading-relaxed">{update.caption}</p>
					</div>
				{/each}
				<div class="flex flex-wrap gap-3">
					{#each quickCtas as cta}
						<Button variant="secondary" class="gap-2" onclick={cta.action}>
							<cta.icon class="h-4 w-4" />
							{cta.label}
						</Button>
					{/each}
				</div>
			</CardContent>
		</Card>
	</section>
</div>
