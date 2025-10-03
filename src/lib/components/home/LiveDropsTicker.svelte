<script lang="ts">
	import { Badge } from '$lib/components/ui';

	const drops = [
		{ user: 'Shaddy', item: 'Snawky', price: '$55.00', type: 'case' },
		{ user: 'Shark', item: 'M4A1-S', price: '$2015.00', type: 'battle' },
		{ user: 'PartyBoy69', item: 'Glock-18', price: '$56.00', type: 'upgrade' },
		{ user: 'DXVOV', item: 'B1maker', price: '$56.00', type: 'case' },
		{ user: 'n1t0ldy', item: 'Nawkey', price: '$55.00', type: 'case' },
		{ user: 'PartyBoy69', item: 'Desert Eagle', price: '$55.00', type: 'battle' },
		{ user: 'Shaddy', item: 'AWP', price: '$55.00', type: 'upgrade' },
		{ user: 'n1x0101', item: 'AK-47', price: '$56.00', type: 'case' }
	];

	const typeColors: Record<string, string> = {
		case: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
		battle: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
		upgrade: 'bg-blue-500/20 text-blue-300 border-blue-500/30'
	};
</script>

<section class="w-full overflow-hidden bg-surface/30 backdrop-blur-sm border-y border-border/40">
	<div class="relative">
		<!-- Gradient overlays for fade effect -->
                <div class="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none"></div>
                <div class="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none"></div>

		<div class="flex animate-scroll py-3 gap-6">
			{#each [...drops, ...drops] as drop}
				<div class="flex items-center gap-3 px-4 py-2 bg-surface/60 rounded-xl border border-border/40 whitespace-nowrap shrink-0">
					<Badge variant="outline" class="text-xs {typeColors[drop.type]} border">
						{drop.type}
					</Badge>
					<span class="text-sm text-muted-foreground">
						<span class="text-foreground font-medium">{drop.user}</span>
						won
						<span class="text-foreground font-medium">{drop.item}</span>
					</span>
					<span class="text-sm font-bold text-emerald-400">
						{drop.price}
					</span>
				</div>
			{/each}
		</div>
	</div>
</section>

<style>
	@keyframes scroll {
		0% {
			transform: translateX(0);
		}
		100% {
			transform: translateX(-50%);
		}
	}

	.animate-scroll {
		animation: scroll 40s linear infinite;
		width: fit-content;
	}
</style>
