<script lang="ts">
	import { Badge, Button } from '$lib/components/ui';
	import { Gift, Users, Clock, TrendingUp, Zap } from '@lucide/svelte';

	export interface RainPotFeatureProps {
		totalAmount: number;
		contributorCount: number;
		timeRemaining: number; // in seconds
		averagePayout: number;
		isActive: boolean;
		nextPayoutTime?: number;
		onJoin?: () => void;
		onViewHistory?: () => void;
		compact?: boolean;
		class?: string;
	}

	let {
		totalAmount,
		contributorCount,
		timeRemaining,
		averagePayout,
		isActive,
		nextPayoutTime,
		onJoin,
		onViewHistory,
		compact = false,
		class: className = ''
	}: RainPotFeatureProps = $props();

	const formatCurrency = (amount: number) => {
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: 'USD',
			minimumFractionDigits: 0,
			maximumFractionDigits: 0
		}).format(amount);
	};

	const formatTime = (seconds: number) => {
		const hours = Math.floor(seconds / 3600);
		const minutes = Math.floor((seconds % 3600) / 60);
		const secs = seconds % 60;

		if (hours > 0) {
			return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
		}
		return `${minutes}:${secs.toString().padStart(2, '0')}`;
	};

	// Countdown timer effect
	let countdown = $state(timeRemaining);
	let interval: ReturnType<typeof setInterval>;

	$effect(() => {
		countdown = timeRemaining;

		if (isActive && countdown > 0) {
			interval = setInterval(() => {
				countdown = Math.max(0, countdown - 1);
			}, 1000);
		}

		return () => {
			if (interval) clearInterval(interval);
		};
	});
</script>

<div class={`relative overflow-hidden rounded-3xl border-2 border-white/10 shadow-2xl ${compact ? '' : 'p-8'} ${className}`}
	style="background: radial-gradient(circle at 30% 30%, rgba(34, 197, 94, 0.6), transparent 70%), radial-gradient(circle at 70% 70%, rgba(16, 185, 129, 0.4), transparent 60%), rgba(15, 118, 110, 0.95); min-height: {compact ? '180px' : '240px'};">

	<!-- Glass overlay -->
	<div class="absolute inset-0 bg-white/5 backdrop-blur-[1px]"></div>

	<!-- Decorative elements -->
	<div class="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
	<div class="absolute bottom-0 left-0 w-48 h-48 bg-black/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>

	<div class="relative z-10 h-full flex flex-col justify-between">
		<!-- Header -->
		<div class="flex items-start justify-between">
			<div class="flex items-center gap-3">
				<div class="bg-white/20 backdrop-blur-md rounded-2xl p-3 border border-white/30">
					<Gift class="h-6 w-6 text-white" />
				</div>
				<div>
					<h3 class="text-xl md:text-2xl font-bold text-white">Rain Pot</h3>
					<p class="text-white/80 text-sm">
						{isActive ? 'Active now' : 'Inactive'}
					</p>
				</div>
			</div>

			<Badge class="bg-green-500/20 text-green-300 text-xs font-semibold border border-green-500/30">
				{isActive ? 'LIVE' : 'INACTIVE'}
			</Badge>
		</div>

		<!-- Main stats -->
		<div class="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
			<div class="text-center md:text-left">
				<p class="text-white/60 text-xs uppercase tracking-wider mb-1">Total Pool</p>
				<p class="text-2xl md:text-3xl font-bold text-white">
					{formatCurrency(totalAmount)}
				</p>
			</div>

			<div class="text-center md:text-left">
				<p class="text-white/60 text-xs uppercase tracking-wider mb-1">Contributors</p>
				<p class="text-2xl md:text-3xl font-bold text-white">
					{contributorCount}
				</p>
			</div>

			<div class="text-center md:text-left">
				<p class="text-white/60 text-xs uppercase tracking-wider mb-1">Avg Payout</p>
				<p class="text-2xl md:text-3xl font-bold text-green-300">
					{formatCurrency(averagePayout)}
				</p>
			</div>
		</div>

		<!-- Time and actions -->
		<div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
			<div class="flex items-center gap-2">
				<Clock class="h-4 w-4 text-white/60" />
				<span class="text-white/80 text-sm">
					{isActive ? `Next payout in ${formatTime(countdown)}` : 'No active rain'}
				</span>
			</div>

			<div class="flex gap-3">
				{#if isActive}
					<Button
						class="bg-white text-gray-900 font-bold gap-2"
						onclick={onJoin}
					>
						<Users class="h-4 w-4" />
						Join Rain Pot
					</Button>
				{:else if nextPayoutTime}
					<div class="text-center">
						<p class="text-white/60 text-xs uppercase tracking-wider">Next Rain</p>
						<p class="text-white font-semibold">
							{formatTime(nextPayoutTime)}
						</p>
					</div>
				{/if}

				{#if !compact && onViewHistory}
					<Button
						variant="outline"
						class="bg-white/20 border-white/30 text-white"
						onclick={onViewHistory}
					>
						History
					</Button>
				{/if}
			</div>
		</div>

		<!-- Additional info for non-compact -->
		{#if !compact}
			<div class="pt-4 border-t border-white/20">
				<div class="flex items-center gap-4 text-white/60 text-sm">
					<div class="flex items-center gap-2">
						<TrendingUp class="h-4 w-4" />
						<span>Automatic distribution</span>
					</div>
					<div class="flex items-center gap-2">
						<Zap class="h-4 w-4" />
						<span>Based on activity</span>
					</div>
				</div>
			</div>
		{/if}
	</div>
</div>