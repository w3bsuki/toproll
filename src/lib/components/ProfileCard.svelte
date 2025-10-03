<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import type { UserProfile } from '$lib/types';
	import {
		Card,
		CardContent,
		CardHeader,
		CardTitle,
		CardDescription,
		Badge
	} from '$lib/components/ui';
	import type { BadgeVariant } from '$lib/components/ui';
	import { cn } from '$lib/utils';

	interface ProfileCardProps extends HTMLAttributes<HTMLDivElement> {
		user: UserProfile;
		status?: 'online' | 'offline' | 'away';
	}

	let {
		user,
		status = 'offline',
		class: className = '',
		...restProps
	}: ProfileCardProps = $props();

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
</script>

<Card class={cn('border-border/60 bg-surface/70 border', className)} {...restProps}>
	<CardHeader class="border-0 pb-4">
		<CardTitle class="text-foreground text-lg font-semibold">{user.username}</CardTitle>
		{#if user.steam_id}
			<CardDescription>Steam ID {user.steam_id}</CardDescription>
		{/if}
	</CardHeader>
	<CardContent class="space-y-4">
		<div class="flex items-center gap-4">
			<div class="relative">
				{#if user.avatar_url}
					<img
						src={user.avatar_url}
						alt={user.username}
						class="border-border/60 h-16 w-16 rounded-xl border object-cover"
					/>
				{:else}
					<div
						class="border-border/60 bg-surface-muted/60 text-foreground flex h-16 w-16 items-center justify-center rounded-xl border text-lg font-semibold"
					>
						{initials}
					</div>
				{/if}
				<span
					class="border-background bg-surface-muted/80 absolute -right-1 -bottom-1 flex h-5 w-5 items-center justify-center rounded-full border"
				>
					<Badge variant={statusVariant()} class="px-2 text-[10px] tracking-wide uppercase">
						{status}
					</Badge>
				</span>
			</div>
			<div class="text-muted-foreground space-y-1 text-sm">
				<p>Member since {user.created_at ? new Date(user.created_at).toLocaleDateString() : '—'}</p>
				<p>Country: {user.country ?? 'Unknown'}</p>
			</div>
		</div>
	</CardContent>
</Card>
