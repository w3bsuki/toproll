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

<section class="bg-surface/30 border-border/40 w-full overflow-hidden border-y backdrop-blur-sm">
	<div class="relative">
		<!-- Gradient overlays for fade effect -->
		<div
			class="from-background pointer-events-none absolute top-0 bottom-0 left-0 z-10 w-24 bg-gradient-to-r to-transparent"
		></div>
		<div
			class="from-background pointer-events-none absolute top-0 right-0 bottom-0 z-10 w-24 bg-gradient-to-l to-transparent"
		></div>

		<div class="animate-scroll flex gap-6 py-3">
			{#each [...drops, ...drops] as drop}
				<div
					class="bg-surface/60 border-border/40 flex shrink-0 items-center gap-3 rounded-xl border px-4 py-2 whitespace-nowrap"
				>
					<Badge variant="outline" class="text-xs {typeColors[drop.type]} border">
						{drop.type}
					</Badge>
					<span class="text-muted-foreground text-sm">
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
