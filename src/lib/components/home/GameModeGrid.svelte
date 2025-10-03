<script lang="ts">
	import { Button, Badge } from '$lib/components/ui';
	import { Package, Swords, TrendingUp, Users, Gift, Zap } from '@lucide/svelte';

	const gameModes = [
		{
			id: 'cases',
			title: 'Cases',
			description: 'Open curated CS2 cases',
			icon: Package,
			image: 'radial-gradient(circle at 30% 30%, rgba(34, 197, 94, 0.6), transparent 70%), radial-gradient(circle at 70% 70%, rgba(16, 185, 129, 0.4), transparent 60%), rgba(15, 118, 110, 0.95)',
			badge: 'Popular',
			badgeVariant: 'default' as const,
			href: '/cases'
		},
		{
			id: 'battles',
			title: 'Case Battles',
			description: 'Compete against others',
			icon: Swords,
			image: 'radial-gradient(circle at 25% 30%, rgba(239, 68, 68, 0.6), transparent 70%), radial-gradient(circle at 75% 70%, rgba(249, 115, 22, 0.5), transparent 60%), rgba(124, 45, 18, 0.95)',
			badge: 'Live',
			badgeVariant: 'destructive' as const,
			href: '/battles'
		},
		{
			id: 'upgrade',
			title: 'Upgrader',
			description: 'Upgrade your skins',
			icon: TrendingUp,
			image: 'radial-gradient(circle at 35% 35%, rgba(59, 130, 246, 0.6), transparent 70%), radial-gradient(circle at 70% 65%, rgba(99, 102, 241, 0.5), transparent 60%), rgba(30, 27, 75, 0.95)',
			badge: null,
			badgeVariant: 'secondary' as const,
			href: '/upgrade'
		},
		{
			id: 'double',
			title: 'Double',
			description: 'Double or nothing',
			icon: Zap,
			image: 'radial-gradient(circle at 30% 70%, rgba(168, 85, 247, 0.6), transparent 70%), radial-gradient(circle at 70% 30%, rgba(236, 72, 153, 0.5), transparent 60%), rgba(88, 28, 135, 0.95)',
			badge: null,
			badgeVariant: 'secondary' as const,
			href: '/double'
		},
		{
			id: 'crash',
			title: 'Crash',
			description: 'Multiplier game',
			icon: TrendingUp,
			image: 'radial-gradient(circle at 25% 20%, rgba(45, 212, 191, 0.6), transparent 70%), radial-gradient(circle at 75% 80%, rgba(56, 189, 248, 0.5), transparent 60%), rgba(8, 47, 73, 0.95)',
			badge: null,
			badgeVariant: 'secondary' as const,
			href: '/crash'
		},
		{
			id: 'pots',
			title: 'Rain Pots',
			description: 'Community rewards',
			icon: Gift,
			image: 'radial-gradient(circle at 20% 50%, rgba(251, 191, 36, 0.6), transparent 70%), radial-gradient(circle at 80% 40%, rgba(245, 158, 11, 0.5), transparent 60%), rgba(120, 53, 15, 0.95)',
			badge: 'Active',
			badgeVariant: 'default' as const,
			href: '/pots'
		}
	];
</script>

<section class="space-y-6">
	<div class="space-y-2">
		<h2 class="text-3xl font-bold tracking-tight">Game Modes</h2>
		<p class="text-muted-foreground text-base">
			Choose your game and start winning
		</p>
	</div>

	<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
		{#each gameModes as mode}
			<a
				href={mode.href}
				class="relative overflow-hidden rounded-3xl border-2 border-white/10 shadow-2xl"
				style="background: {mode.image}; min-height: 220px;"
			>
				<!-- Glass overlay -->
				<div class="absolute inset-0 bg-white/5 backdrop-blur-[1px]"></div>

				<div class="relative z-10 p-6 h-full flex flex-col justify-between">
					<!-- Top section with badge -->
					<div class="flex items-start justify-between">
						<div class="bg-white/20 backdrop-blur-md rounded-2xl p-3 border border-white/30">
							<svelte:component this={mode.icon} class="h-7 w-7 text-white" />
						</div>
						{#if mode.badge}
							<Badge variant={mode.badgeVariant} class="text-xs font-semibold">
								{mode.badge}
							</Badge>
						{/if}
					</div>

					<!-- Bottom section with title and description -->
					<div class="space-y-2">
						<h3 class="text-2xl font-bold text-white">
							{mode.title}
						</h3>
						<p class="text-white/80 text-sm">
							{mode.description}
						</p>
					</div>
				</div>
			</a>
		{/each}
	</div>
</section>
