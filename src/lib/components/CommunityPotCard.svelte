<script lang="ts">
	import { Badge, Button, Card, CardContent } from '$lib/components/ui';
	import { Users, Clock, Trophy, Gift, Star, Zap, TrendingUp } from '@lucide/svelte';

	export interface CommunityPot {
		id: string;
		name: string;
		type: 'rain' | 'vip' | 'flash' | 'jackpot' | 'tournament';
		description?: string;
		totalAmount: number;
		contributorCount: number;
		maxContributors?: number;
		timeRemaining: number; // in seconds
		status: 'active' | 'ending-soon' | 'full' | 'ended';
		entryRequirement?: string;
		isVIP?: boolean;
		prizePool?: number;
		minimumContribution?: number;
		background?: string;
	}

	export interface CommunityPotCardProps {
		pot: CommunityPot;
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

	const formatTime = (seconds: number) => {
		const hours = Math.floor(seconds / 3600);
		const minutes = Math.floor((seconds % 3600) / 60);
		const secs = seconds % 60;

		if (hours > 0) {
			return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
		}
		return `${minutes}:${secs.toString().padStart(2, '0')}`;
	};

	const getPotIcon = (type: string) => {
		switch (type) {
			case 'rain':
				return Gift;
			case 'vip':
				return Star;
			case 'flash':
				return Zap;
			case 'jackpot':
				return Trophy;
			case 'tournament':
				return TrendingUp;
			default:
				return Gift;
		}
	};

	const getPotGradient = (type: string) => {
		switch (type) {
			case 'rain':
				return 'radial-gradient(circle at 30% 30%, rgba(34, 197, 94, 0.6), transparent 70%), radial-gradient(circle at 70% 70%, rgba(16, 185, 129, 0.4), transparent 60%), rgba(15, 118, 110, 0.95)';
			case 'vip':
				return 'radial-gradient(circle at 25% 25%, rgba(251, 191, 36, 0.6), transparent 70%), radial-gradient(circle at 75% 75%, rgba(245, 158, 11, 0.4), transparent 60%), rgba(120, 53, 15, 0.95)';
			case 'flash':
				return 'radial-gradient(circle at 20% 40%, rgba(239, 68, 68, 0.6), transparent 70%), radial-gradient(circle at 80% 60%, rgba(249, 115, 22, 0.4), transparent 60%), rgba(124, 45, 18, 0.95)';
			case 'jackpot':
				return 'radial-gradient(circle at 35% 35%, rgba(168, 85, 247, 0.6), transparent 70%), radial-gradient(circle at 65% 65%, rgba(236, 72, 153, 0.4), transparent 60%), rgba(88, 28, 135, 0.95)';
			case 'tournament':
				return 'radial-gradient(circle at 30% 20%, rgba(59, 130, 246, 0.6), transparent 70%), radial-gradient(circle at 70% 80%, rgba(99, 102, 241, 0.4), transparent 60%), rgba(30, 27, 75, 0.95)';
			default:
				return 'radial-gradient(circle at 30% 30%, rgba(107, 114, 128, 0.6), transparent 70%), radial-gradient(circle at 70% 70%, rgba(75, 85, 99, 0.4), transparent 60%), rgba(55, 65, 81, 0.95)';
		}
	};

	const getStatusColor = (status: string) => {
		switch (status) {
			case 'active':
				return 'bg-green-500/20 text-green-300 border-green-500/30';
			case 'ending-soon':
				return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
			case 'full':
				return 'bg-red-500/20 text-red-300 border-red-500/30';
			case 'ended':
				return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
			default:
				return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
		}
	};

	const fillPercentage = $derived(
		pot.maxContributors ? (pot.contributorCount / pot.maxContributors) * 100 : 0
	);
</script>

<Card class={`overflow-hidden ${compact ? '' : 'h-full'} ${className}`}>
	<div
		class="relative"
		style={`background: ${pot.background || getPotGradient(pot.type)}; min-height: ${compact ? '140px' : '220px'};`}
	>
		<!-- Glass overlay -->
		<div class="absolute inset-0 bg-white/5 backdrop-blur-[1px]"></div>

		<!-- Status badge -->
		<div class="absolute top-4 left-4">
			<Badge class={`text-xs font-semibold ${getStatusColor(pot.status)} border`}>
				{pot.status.replace('-', ' ').toUpperCase()}
			</Badge>
		</div>

		<!-- VIP badge if applicable -->
		{#if pot.isVIP}
			<div class="absolute top-4 right-4">
				<Badge class="bg-yellow-500/20 text-yellow-300 text-xs font-semibold border border-yellow-500/30">
					<Star class="h-3 w-3 mr-1" />
					VIP
				</Badge>
			</div>
		{/if}

		<!-- Content -->
		<div class="relative z-10 p-6 h-full flex flex-col justify-between">
			<div class="space-y-4">
				<!-- Icon and title -->
				<div class="flex items-center gap-3">
					<div class="bg-white/20 backdrop-blur-md rounded-2xl p-3 border border-white/30">
						<svelte:component this={getPotIcon(pot.type)} class="h-6 w-6 text-white" />
					</div>
					<div>
						<h3 class="text-xl font-bold text-white">{pot.name}</h3>
						{#if pot.description}
							<p class="text-white/80 text-sm">{pot.description}</p>
						{/if}
					</div>
				</div>

				<!-- Stats -->
				<div class="grid grid-cols-2 gap-4">
					<div>
						<p class="text-white/60 text-xs uppercase tracking-wider">Prize Pool</p>
						<p class="text-2xl font-bold text-white">
							{formatCurrency(pot.prizePool || pot.totalAmount)}
						</p>
					</div>
					<div>
						<p class="text-white/60 text-xs uppercase tracking-wider">Contributors</p>
						<p class="text-2xl font-bold text-white">
							{pot.contributorCount}
							{#if pot.maxContributors}
								<span class="text-lg text-white/60">/{pot.maxContributors}</span>
							{/if}
						</p>
					</div>
				</div>

				<!-- Progress bar if max contributors -->
				{#if pot.maxContributors}
					<div class="space-y-2">
						<div class="flex justify-between text-xs text-white/60">
							<span>Progress</span>
							<span>{Math.round(fillPercentage)}%</span>
						</div>
						<div class="bg-white/20 rounded-full h-2 overflow-hidden">
							<div
								class="bg-white h-full transition-all duration-300"
								style="width: {fillPercentage}%"
							></div>
						</div>
					</div>
				{/if}

				<!-- Time remaining -->
				<div class="flex items-center gap-2">
					<Clock class="h-4 w-4 text-white/60" />
					<span class="text-white/80 text-sm">
						{pot.status === 'ended' ? 'Ended' : `Ends in ${formatTime(pot.timeRemaining)}`}
					</span>
				</div>

				<!-- Entry requirement -->
				{#if pot.entryRequirement}
					<div class="text-xs text-white/60">
						{pot.entryRequirement}
					</div>
				{/if}
			</div>

			<!-- Actions -->
			{#if showActions && pot.status === 'active'}
				<div class="flex gap-3 pt-4">
					<Button
						class="flex-1 bg-white text-gray-900 font-bold"
						onclick={() => onJoin?.(pot.id)}
					>
						Join Pot
					</Button>
					{#if !compact}
						<Button
							variant="outline"
							class="bg-white/20 border-white/30 text-white"
							onclick={() => onView?.(pot.id)}
						>
							View Details
						</Button>
					{/if}
				</div>
			{:else if showActions && pot.status === 'ended'}
				<Button
					variant="outline"
					class="w-full bg-white/20 border-white/30 text-white"
					onclick={() => onView?.(pot.id)}
				>
					View Results
				</Button>
			{/if}
		</div>
	</div>
</Card>