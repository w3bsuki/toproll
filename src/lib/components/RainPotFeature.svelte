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

<div
	class={`relative overflow-hidden rounded-3xl border-2 border-white/10 shadow-2xl ${compact ? '' : 'p-8'} ${className}`}
	style="background: radial-gradient(circle at 30% 30%, rgba(34, 197, 94, 0.6), transparent 70%), radial-gradient(circle at 70% 70%, rgba(16, 185, 129, 0.4), transparent 60%), rgba(15, 118, 110, 0.95); min-height: {compact
		? '180px'
		: '240px'};"
>
	<!-- Glass overlay -->
	<div class="absolute inset-0 bg-white/5 backdrop-blur-[1px]"></div>

	<!-- Decorative elements -->
	<div
		class="absolute top-0 right-0 h-64 w-64 translate-x-1/2 -translate-y-1/2 rounded-full bg-white/10 blur-3xl"
	></div>
	<div
		class="absolute bottom-0 left-0 h-48 w-48 -translate-x-1/2 translate-y-1/2 rounded-full bg-black/20 blur-3xl"
	></div>

	<div class="relative z-10 flex h-full flex-col justify-between">
		<!-- Header -->
		<div class="flex items-start justify-between">
			<div class="flex items-center gap-3">
				<div class="rounded-2xl border border-white/30 bg-white/20 p-3 backdrop-blur-md">
					<Gift class="h-6 w-6 text-white" />
				</div>
				<div>
					<h3 class="text-xl font-bold text-white md:text-2xl">Rain Pot</h3>
					<p class="text-sm text-white/80">
						{isActive ? 'Active now' : 'Inactive'}
					</p>
				</div>
			</div>

			<Badge
				class="border border-green-500/30 bg-green-500/20 text-xs font-semibold text-green-300"
			>
				{isActive ? 'LIVE' : 'INACTIVE'}
			</Badge>
		</div>

		<!-- Main stats -->
		<div class="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-6">
			<div class="text-center md:text-left">
				<p class="mb-1 text-xs tracking-wider text-white/60 uppercase">Total Pool</p>
				<p class="text-2xl font-bold text-white md:text-3xl">
					{formatCurrency(totalAmount)}
				</p>
			</div>

			<div class="text-center md:text-left">
				<p class="mb-1 text-xs tracking-wider text-white/60 uppercase">Contributors</p>
				<p class="text-2xl font-bold text-white md:text-3xl">
					{contributorCount}
				</p>
			</div>

			<div class="text-center md:text-left">
				<p class="mb-1 text-xs tracking-wider text-white/60 uppercase">Avg Payout</p>
				<p class="text-2xl font-bold text-green-300 md:text-3xl">
					{formatCurrency(averagePayout)}
				</p>
			</div>
		</div>

		<!-- Time and actions -->
		<div class="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
			<div class="flex items-center gap-2">
				<Clock class="h-4 w-4 text-white/60" />
				<span class="text-sm text-white/80">
					{isActive ? `Next payout in ${formatTime(countdown)}` : 'No active rain'}
				</span>
			</div>

			<div class="flex gap-3">
				{#if isActive}
					<Button class="gap-2 bg-white font-bold text-gray-900" onclick={onJoin}>
						<Users class="h-4 w-4" />
						Join Rain Pot
					</Button>
				{:else if nextPayoutTime}
					<div class="text-center">
						<p class="text-xs tracking-wider text-white/60 uppercase">Next Rain</p>
						<p class="font-semibold text-white">
							{formatTime(nextPayoutTime)}
						</p>
					</div>
				{/if}

				{#if !compact && onViewHistory}
					<Button
						variant="outline"
						class="border-white/30 bg-white/20 text-white"
						onclick={onViewHistory}
					>
						History
					</Button>
				{/if}
			</div>
		</div>

		<!-- Additional info for non-compact -->
		{#if !compact}
			<div class="border-t border-white/20 pt-4">
				<div class="flex items-center gap-4 text-sm text-white/60">
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
