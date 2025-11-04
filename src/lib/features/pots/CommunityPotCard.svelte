<script lang="ts">
	import { Badge, Button, Card, CardContent } from '$lib/components/ui';
	import { Users, Clock, Trophy, Gift, Star, Zap, TrendingUp } from '@lucide/svelte';
	import type { Pot } from '$lib/types/index';

	export interface CommunityPotCardProps {
		pot: Pot;
		compact?: boolean;
		showActions?: boolean;
		onJoin?: (potId: string) => void;
		onView?: (potId: string) => void;
		class?: string;
	}

	let {
		pot,
		compact = false,
		showActions = true,
		onJoin,
		onView,
		class: className = ''
	}: CommunityPotCardProps = $props();

	const formatCurrency = (amount: number) => {
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: 'USD',
			minimumFractionDigits: 0,
			maximumFractionDigits: 0
		}).format(amount);
	};

	const formatTime = (expiresAt: string) => {
		if (!expiresAt) return 'No expiry';

		const now = new Date();
		const expiry = new Date(expiresAt);
		const diff = expiry.getTime() - now.getTime();

		if (diff <= 0) return 'Expired';

		const hours = Math.floor(diff / (1000 * 60 * 60));
		const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

		if (hours > 0) {
			return `${hours}h ${minutes}m`;
		}
		return `${minutes}m`;
	};

	const getPotIcon = (status: string) => {
		switch (status) {
			case 'open':
				return Gift;
			case 'locked':
				return Trophy;
			case 'settling':
				return Zap;
			case 'settled':
				return TrendingUp;
			default:
				return Gift;
		}
	};

	// Reactive icon component using $derived
	const IconComponent = $derived(getPotIcon(pot.status));

	const getPotGradient = (status: string) => {
		// IMPROVED: Lighter backgrounds for better visibility and text contrast
		switch (status) {
			case 'open':
				return 'radial-gradient(circle at 30% 30%, rgba(34, 197, 94, 0.5), transparent 70%), radial-gradient(circle at 70% 70%, rgba(16, 185, 129, 0.35), transparent 60%), oklch(0.32 0.04 160)';
			case 'locked':
				return 'radial-gradient(circle at 25% 25%, rgba(251, 191, 36, 0.6), transparent 70%), radial-gradient(circle at 75% 75%, rgba(245, 158, 11, 0.45), transparent 60%), oklch(0.35 0.05 70)';
			case 'settling':
				return 'radial-gradient(circle at 20% 40%, rgba(239, 68, 68, 0.5), transparent 70%), radial-gradient(circle at 80% 60%, rgba(249, 115, 22, 0.4), transparent 60%), oklch(0.32 0.04 30)';
			case 'settled':
				return 'radial-gradient(circle at 35% 35%, rgba(168, 85, 247, 0.5), transparent 70%), radial-gradient(circle at 65% 65%, rgba(236, 72, 153, 0.35), transparent 60%), oklch(0.32 0.04 300)';
			default:
				return 'radial-gradient(circle at 30% 30%, rgba(107, 114, 128, 0.4), transparent 70%), radial-gradient(circle at 70% 70%, rgba(75, 85, 99, 0.3), transparent 60%), oklch(0.3 0.015 240)';
		}
	};

	const getStatusColor = (status: string) => {
		switch (status) {
			case 'open':
				return 'bg-success/20 text-success border-success/30';
			case 'locked':
				return 'bg-warning/20 text-warning border-warning/30';
			case 'settling':
				return 'bg-info/20 text-info border-info/30';
			case 'settled':
				return 'bg-destructive/20 text-destructive border-destructive/30';
			default:
				return 'bg-muted/20 text-muted-foreground border-muted/30';
		}
	};

	const fillPercentage = $derived(pot.fill_percent || 0);

	const timeRemaining = $derived(formatTime(pot.expires_at || ''));

	const potName = $derived(`Community Pot #${pot.id.slice(0, 8)}`);
</script>

<Card class={`overflow-hidden ${compact ? '' : 'h-full'} ${className} border-2 border-white/10 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-[1.02]`}>
	<div
		class="relative h-full rounded-lg"
		style={`background: ${getPotGradient(pot.status)}; min-height: ${compact ? '140px' : '220px'};`}
	>
		<!-- Subtle glass overlay - reduced for better readability -->
		<div class="absolute inset-0 bg-white/5 backdrop-blur-[0.5px]"></div>

		<!-- Status badge -->
		<div class="absolute top-3 left-3 z-20">
			<Badge class={`text-xs font-semibold ${getStatusColor(pot.status)} border backdrop-blur-sm`}>
				{pot.status.replace('-', ' ').toUpperCase()}
			</Badge>
		</div>

		<!-- Content -->
		<div class="relative z-10 flex h-full flex-col justify-between p-6 pt-16">
			<div class="space-y-4">
				<!-- Icon and title -->
				<div class="flex items-start gap-3">
					<div
						class="rounded-2xl border border-white/30 bg-white/20 p-3 shadow-lg backdrop-blur-md"
					>
						<IconComponent class="h-6 w-6 text-white drop-shadow-sm" />
					</div>
					<div class="flex-1">
						<h3 class="text-xl font-bold text-white drop-shadow-sm">{potName}</h3>
						<p class="text-sm text-white/90 drop-shadow-sm">
							Entry: {formatCurrency(pot.entry_cost)} per ticket
						</p>
					</div>
				</div>

				<!-- Stats -->
				<div class="grid grid-cols-2 gap-4">
					<div>
						<p class="text-xs font-semibold tracking-wider text-white/70 uppercase">Prize Pool</p>
						<p class="text-2xl font-bold text-white drop-shadow-md">
							{formatCurrency(pot.total_value)}
						</p>
					</div>
					<div>
						<p class="text-xs font-semibold tracking-wider text-white/70 uppercase">Tickets</p>
						<p class="text-2xl font-bold text-white drop-shadow-md">
							{pot.total_tickets}
							<span class="text-lg text-white/70">/{pot.max_tickets}</span>
						</p>
					</div>
				</div>

				<!-- Progress bar -->
				<div class="space-y-2">
					<div class="flex justify-between text-xs text-white/60">
						<span>Fill Progress</span>
						<span>{Math.round(fillPercentage)}%</span>
					</div>
					<div class="h-2 overflow-hidden rounded-full bg-white/20">
						<div
							class="h-full bg-white transition-all duration-300"
							style="width: {fillPercentage}%"
						></div>
					</div>
				</div>

				<!-- Time remaining -->
				{#if pot.expires_at}
					<div class="flex items-center gap-2">
						<Clock class="h-4 w-4 text-white/70 drop-shadow-sm" />
						<span class="text-sm font-medium text-white/90 drop-shadow-sm">
							{pot.status === 'settled' ? 'Settled' : `Expires in ${timeRemaining}`}
						</span>
					</div>
				{/if}

				<!-- Entry requirements -->
				<div class="text-xs text-white/60">
					Max {pot.max_per_user} tickets per user
				</div>
			</div>

			<!-- Actions -->
			{#if showActions && pot.status === 'open'}
				<div class="flex gap-3 pt-4">
					<Button class="flex-1 bg-white font-bold text-gray-900" onclick={() => onJoin?.(pot.id)}>
						Join Pot
					</Button>
					{#if !compact}
						<Button
							variant="outline"
							class="border-white/30 bg-white/20 text-white"
							onclick={() => onView?.(pot.id)}
						>
							View Details
						</Button>
					{/if}
				</div>
			{:else if showActions && pot.status === 'settled'}
				<Button
					variant="outline"
					class="w-full border-white/30 bg-white/20 text-white"
					onclick={() => onView?.(pot.id)}
				>
					View Results
				</Button>
			{/if}
		</div>
	</div>
</Card>
