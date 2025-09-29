<script lang="ts">
	import { communityPots } from '$lib/stores/homepage';
	import { Badge, Button } from '$lib/components/ui';
	import { ArrowRight, Crown, Users, Timer } from 'lucide-svelte';

	const pots = $derived($communityPots);

	const variantAccent = {
		primary:
			'from-primary/20 via-primary/10 to-transparent border-primary/50 shadow-[0_18px_40px_rgba(59,130,246,0.18)]',
		secondary:
			'from-secondary/20 via-secondary/10 to-transparent border-secondary/50 shadow-[0_18px_40px_rgba(14,165,233,0.18)]',
		accent:
			'from-accent/20 via-accent/10 to-transparent border-accent/50 shadow-[0_18px_40px_rgba(34,197,94,0.15)]'
	} as const;
</script>

<section class="space-y-6">
	<div class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
		<div>
			<p class="text-muted-foreground text-xs tracking-[0.35em] uppercase">Now trending</p>
			<h2 class="text-2xl font-semibold tracking-tight">Community pots</h2>
			<p class="text-muted-foreground text-sm">Live jackpots filling with the crowd.</p>
		</div>
		<Button variant="outline" class="gap-2">
			View schedule
			<ArrowRight class="h-4 w-4" />
		</Button>
	</div>
	<div class="grid gap-4 lg:grid-cols-3">
		{#each pots as pot}
			<article
				class={`border-border/60 bg-surface/80 hover:shadow-marketplace-lg relative overflow-hidden rounded-3xl border p-6 transition-all duration-300 hover:-translate-y-1`}
			>
				<div
					class={`absolute inset-0 bg-gradient-to-br ${variantAccent[pot.variant]}`}
					aria-hidden="true"
				></div>
				<div class="relative z-[1] flex flex-col gap-6">
					<div class="flex items-center justify-between">
						<div>
							<p class="text-xs tracking-[0.3em] text-white/70 uppercase">{pot.title}</p>
							<h3 class="text-3xl font-semibold text-white">{pot.jackpot}</h3>
						</div>
						<span
							class="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/30 bg-black/30 text-white/80"
						>
							<Crown class="h-5 w-5" />
						</span>
					</div>
					<div class="flex items-center justify-between gap-3">
						<div class="flex items-center gap-3 text-white/80">
							<span
								class="flex h-10 w-10 items-center justify-center rounded-xl border border-white/30 bg-black/30"
							>
								<Timer class="h-4 w-4" />
							</span>
							<div>
								<p class="text-[11px] tracking-[0.3em] text-white/60 uppercase">Ends in</p>
								<p class="text-sm font-medium">{pot.expiresIn}</p>
							</div>
						</div>
						<div class="flex items-center gap-3 text-white/80">
							<span
								class="flex h-10 w-10 items-center justify-center rounded-xl border border-white/30 bg-black/30"
							>
								<Users class="h-4 w-4" />
							</span>
							<div>
								<p class="text-[11px] tracking-[0.3em] text-white/60 uppercase">Participants</p>
								<p class="text-sm font-medium">{pot.participants}</p>
							</div>
						</div>
					</div>
					<div class="flex items-center justify-between">
						{#if pot.streak}
							<Badge
								variant="secondary"
								class="border-white/20 bg-black/30 text-[10px] tracking-[0.3em] text-white/80 uppercase"
							>
								{pot.streak}
							</Badge>
						{:else}
							<span class="text-xs tracking-[0.3em] text-white/60 uppercase">Live pot</span>
						{/if}
						<Button size="sm" class="gap-2 bg-white/90 text-slate-900 hover:bg-white">
							Join pot
							<ArrowRight class="h-4 w-4" />
						</Button>
					</div>
				</div>
			</article>
		{/each}
	</div>
</section>
