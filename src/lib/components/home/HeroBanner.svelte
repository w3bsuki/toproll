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
<section class="relative w-full h-32 sm:h-40 lg:h-48 overflow-hidden rounded-xl border border-border/40 gradient-banner-blue">
	<!-- Subtle overlay pattern -->
	<div class="absolute inset-0 bg-grid-pattern opacity-5"></div>

	<!-- Banner content -->
	<div class="relative z-10 h-full flex items-center px-6 sm:px-8 lg:px-12">
		<div class="w-full flex items-center justify-between gap-6">
			<!-- Left side - Main message -->
			<div class="flex items-center gap-4">
				<!-- Icon -->
				<div class="bg-banner-primary/20 border-banner-primary/40 text-white flex h-12 w-12 items-center justify-center rounded-xl border backdrop-blur-sm shadow-lg">
					<Gift class="h-6 w-6" />
				</div>

				<!-- Text -->
				<div class="space-y-1">
					<h1 class="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground">
						Community Rain Active
						<span class="text-white font-semibold">
							• ${stats.averagePoolSize.toLocaleString()} avg pool
						</span>
					</h1>
					<p class="text-muted-foreground text-sm sm:text-base">
						{stats.activePlayers.toLocaleString()} players online • {stats.totalPools} active pots • ${(stats.totalDistributed / 1000).toFixed(0)}k distributed today
					</p>
				</div>
			</div>

			<!-- Right side - CTA and quick stats -->
			<div class="flex items-center gap-4 shrink-0">
				<!-- Quick stat badges -->
				<div class="hidden sm:flex items-center gap-3">
					<div class="text-center">
						<p class="text-lg font-bold text-success-foreground">{stats.totalPools}</p>
						<p class="text-xs text-muted-foreground">Pots</p>
					</div>
					<div class="text-center">
						<p class="text-lg font-bold text-primary-foreground">{(stats.activePlayers / 1000).toFixed(1)}k</p>
						<p class="text-xs text-muted-foreground">Players</p>
					</div>
				</div>

				<!-- CTA Button -->
				<Button
					size="lg"
					class="bg-banner-primary text-white hover:bg-banner-primary/90 font-bold rounded-xl px-6 py-3 text-base gap-2 shadow-lg transition-all hover:scale-105 border border-banner-primary/40"
				>
					<Users class="h-4 w-4" />
					Join Now
				</Button>
			</div>
		</div>
	</div>
</section>
