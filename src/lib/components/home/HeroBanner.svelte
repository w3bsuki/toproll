<script lang="ts">
	import { Users, TrendingUp, Clock, Trophy, Gift } from '@lucide/svelte';
	import { Button } from '$lib/components/ui';

	// Community pot stats (mock data for now)
	const stats = {
		totalPools: 24,
		activePlayers: 1847,
		totalDistributed: 125420,
		averagePoolSize: 3420
	};
</script>

<!-- Horizontal Banner -->
<section
	class="border-border/40 gradient-banner-blue relative h-32 w-full overflow-hidden rounded-xl border sm:h-40 lg:h-48"
>
	<!-- Subtle overlay pattern -->
	<div class="bg-grid-pattern absolute inset-0 opacity-5"></div>

	<!-- Banner content -->
	<div class="relative z-10 flex h-full items-center px-6 sm:px-8 lg:px-12">
		<div class="flex w-full items-center justify-between gap-6">
			<!-- Left side - Main message -->
			<div class="flex items-center gap-4">
				<!-- Icon -->
				<div
					class="bg-banner-primary/20 border-banner-primary/40 flex h-12 w-12 items-center justify-center rounded-xl border text-white shadow-lg backdrop-blur-sm"
				>
					<Gift class="h-6 w-6" />
				</div>

				<!-- Text -->
				<div class="space-y-1">
					<h1 class="text-foreground text-xl font-bold sm:text-2xl lg:text-3xl">
						Community Rain Active
						<span class="font-semibold text-white">
							• ${stats.averagePoolSize.toLocaleString()} avg pool
						</span>
					</h1>
					<p class="text-muted-foreground text-sm sm:text-base">
						{stats.activePlayers.toLocaleString()} players online • {stats.totalPools} active pots •
						${(stats.totalDistributed / 1000).toFixed(0)}k distributed today
					</p>
				</div>
			</div>

			<!-- Right side - CTA and quick stats -->
			<div class="flex shrink-0 items-center gap-4">
				<!-- Quick stat badges -->
				<div class="hidden items-center gap-3 sm:flex">
					<div class="text-center">
						<p class="text-success-foreground text-lg font-bold">{stats.totalPools}</p>
						<p class="text-muted-foreground text-xs">Pots</p>
					</div>
					<div class="text-center">
						<p class="text-primary-foreground text-lg font-bold">
							{(stats.activePlayers / 1000).toFixed(1)}k
						</p>
						<p class="text-muted-foreground text-xs">Players</p>
					</div>
				</div>

				<!-- CTA Button -->
				<Button
					size="lg"
					class="bg-banner-primary hover:bg-banner-primary/90 border-banner-primary/40 gap-2 rounded-xl border px-6 py-3 text-base font-bold text-white shadow-lg transition-all hover:scale-105"
				>
					<Users class="h-4 w-4" />
					Join Now
				</Button>
			</div>
		</div>
	</div>
</section>
