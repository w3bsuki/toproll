<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import type { UserProfile } from '$lib/types/index';
	import {
		Card,
		CardContent,
		CardHeader,
		CardTitle,
		CardDescription,
		Badge,
		Button
	} from '$lib/components/ui';
	import type { BadgeVariant } from '$lib/components/ui';
	import { ExternalLink, User, Shield, Copy, Check, Clock } from '@lucide/svelte';
	import { cn } from '$lib/utils';
	import { formatRelativeTime } from '$lib/utils/time';

	interface ProfileCardProps extends HTMLAttributes<HTMLDivElement> {
		user: UserProfile;
		status?: 'online' | 'offline' | 'away';
		loading?: boolean;
		showSteamLink?: boolean;
		showCopyId?: boolean;
		compact?: boolean;
		onStatusClick?: () => void;
	}

	let {
		user,
		status = 'offline',
		loading = false,
		showSteamLink = true,
		showCopyId = true,
		compact = false,
		onStatusClick,
		class: className = '',
		...restProps
	}: ProfileCardProps = $props();

	let copiedId = $state(false);
	let imageError = $state(false);
	let imageLoading = $state(true);

	const initials = $derived(
		user.username
			.split(' ')
			.map((name) => name.charAt(0).toUpperCase())
			.slice(0, 2)
			.join('')
	);

	const statusVariant = $derived((): BadgeVariant => {
		if (status === 'online') return 'success';
		if (status === 'away') return 'warning';
		return 'outline';
	});

	const statusColor = $derived(() => {
		if (status === 'online') return 'bg-green-500';
		if (status === 'away') return 'bg-yellow-500';
		return 'bg-gray-400';
	});

	function copySteamId() {
		if (user.steam_id) {
			navigator.clipboard.writeText(user.steam_id).then(() => {
				copiedId = true;
				setTimeout(() => {
					copiedId = false;
				}, 2000);
			});
		}
	}

	function handleImageError() {
		imageError = true;
		imageLoading = false;
	}

	function handleImageLoad() {
		imageLoading = false;
	}

	function openSteamProfile() {
		if (user.steam_profile_url) {
			window.open(user.steam_profile_url, '_blank', 'noopener,noreferrer');
		}
	}
</script>

<Card
	class={cn(
		'border-border/60 bg-surface/70 border transition-all duration-200 hover:shadow-md',
		className
	)}
	{...restProps}
>
	{#if loading}
		<div class="flex animate-pulse">
			<div class="bg-surface-muted h-16 w-16 rounded-xl"></div>
			<div class="ml-4 flex-1 space-y-2">
				<div class="bg-surface-muted h-4 w-3/4 rounded"></div>
				<div class="bg-surface-muted h-3 w-1/2 rounded"></div>
			</div>
		</div>
	{:else}
		<CardHeader class={cn('border-0 pb-4', compact && 'pb-2')}>
			<div class="flex items-start justify-between">
				<div class="min-w-0 flex-1">
					<CardTitle class="text-foreground truncate text-lg font-semibold">
						{user.username}
					</CardTitle>
					{#if user.steam_id && !compact}
						<CardDescription class="flex items-center gap-1">
							<Shield class="h-3 w-3" aria-hidden="true" />
							Steam ID {user.steam_id}
						</CardDescription>
					{/if}
				</div>
				{#if !compact}
					<div
						class="flex cursor-pointer items-center"
						onclick={onStatusClick}
						onkeydown={(e) => e.key === 'Enter' && onStatusClick?.()}
						role="button"
						tabindex="0"
						aria-label={`User status: ${status}`}
					>
						<div class="relative">
							<div class={cn('h-3 w-3 rounded-full', statusColor)}></div>
							<div
								class={cn(
									'absolute inset-0 h-3 w-3 animate-ping rounded-full opacity-75',
									statusColor
								)}
							></div>
						</div>
						<Badge variant={statusVariant()} class="ml-2 text-xs">
							{status}
						</Badge>
					</div>
				{/if}
			</div>
		</CardHeader>

		<CardContent class={cn('space-y-4', compact && 'space-y-2')}>
			<div class="flex items-center gap-4">
				<div class="relative">
					{#if user.avatar_url && !imageError}
						<div class="relative">
							<img
								src={user.avatar_url}
								alt={user.username}
								class={cn(
									'border-border/60 rounded-xl border object-cover transition-opacity duration-200',
									compact ? 'h-12 w-12' : 'h-16 w-16',
									imageLoading && 'opacity-0'
								)}
								onerror={handleImageError}
								onload={handleImageLoad}
							/>
							{#if imageLoading}
								<div
									class={cn(
										'border-border/60 bg-surface-muted/60 absolute inset-0 flex items-center justify-center rounded-xl border',
										compact ? 'h-12 w-12' : 'h-16 w-16'
									)}
								>
									<div
										class="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
									></div>
								</div>
							{/if}
						</div>
					{:else}
						<div
							class={cn(
								'border-border/60 bg-surface-muted/60 text-foreground flex items-center justify-center rounded-xl border text-lg font-semibold',
								compact ? 'h-12 w-12 text-sm' : 'h-16 w-16'
							)}
						>
							<User class={cn(compact ? 'h-5 w-5' : 'h-6 w-6')} aria-hidden="true" />
						</div>
					{/if}
				</div>

				<div class="min-w-0 flex-1">
					{#if !compact}
						<div class="text-muted-foreground space-y-1 text-sm">
							<p>
								Member since {user.created_at
									? new Date(user.created_at).toLocaleDateString()
									: 'â€”'}
							</p>
							<p class="flex items-center gap-1">
								<Clock class="h-3 w-3" aria-hidden="true" />
								Last seen: {formatRelativeTime(user.last_seen)}
							</p>
							<p>Country: {user.country ?? 'Unknown'}</p>
						</div>
					{/if}

					<div class="mt-2 flex items-center gap-2">
						{#if showSteamLink && user.steam_profile_url}
							<Button
								variant="ghost"
								size="sm"
								class="h-7 px-2 text-xs"
								onclick={openSteamProfile}
								aria-label="View Steam profile"
							>
								<ExternalLink class="mr-1 h-3 w-3" aria-hidden="true" />
								Steam
							</Button>
						{/if}

						{#if showCopyId && user.steam_id}
							<Button
								variant="ghost"
								size="sm"
								class="h-7 px-2 text-xs"
								onclick={copySteamId}
								aria-label={copiedId ? 'Steam ID copied!' : 'Copy Steam ID'}
							>
								{#if copiedId}
									<Check class="mr-1 h-3 w-3 text-green-600" aria-hidden="true" />
									Copied!
								{:else}
									<Copy class="mr-1 h-3 w-3" aria-hidden="true" />
									Copy ID
								{/if}
							</Button>
						{/if}
					</div>
				</div>
			</div>
		</CardContent>
	{/if}
</Card>

