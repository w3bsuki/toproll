<script lang="ts">
	import { communityPots } from '$lib/stores/homepage';
	import { Badge, Button } from '$lib/components/ui';
	import { ArrowRight, Crown, Users, Timer } from '@lucide/svelte';

	const pots = $derived($communityPots);

	const variantAccent = {
		primary: 'from-primary/20 via-primary/10 to-transparent',
		secondary: 'from-secondary/20 via-secondary/10 to-transparent',
		accent: 'from-accent/20 via-accent/10 to-transparent'
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
				class={`border-border/60 bg-surface/80 hover:shadow-marketplace-lg hover:border-border hover:bg-surface/90 relative overflow-hidden rounded-3xl border p-6 transition-all duration-300`}
			>
				<div
					class={`absolute inset-0 bg-gradient-to-br ${variantAccent[pot.variant]}`}
					aria-hidden="true"
				></div>
				<div class="relative z-[1] flex flex-col gap-6">
					<div class="flex items-center justify-between">
						<div>
							<p class="text-foreground/80 text-xs tracking-[0.3em] uppercase">{pot.title}</p>
							<h3 class="text-foreground text-3xl font-semibold">{pot.jackpot}</h3>
						</div>
						<span
							class="border-border/50 bg-surface/50 text-foreground/85 flex h-12 w-12 items-center justify-center rounded-2xl border"
						>
							<Crown class="h-5 w-5" />
						</span>
					</div>
					<div class="flex items-center justify-between gap-3">
						<div class="text-foreground/80 flex items-center gap-3">
							<span
								class="border-border/50 bg-surface/50 flex h-10 w-10 items-center justify-center rounded-xl border"
							>
								<Timer class="h-4 w-4" />
							</span>
							<div>
								<p class="text-muted-foreground text-[11px] tracking-[0.3em] uppercase">Ends in</p>
								<p class="text-sm font-medium">{pot.expiresIn}</p>
							</div>
						</div>
						<div class="text-foreground/80 flex items-center gap-3">
							<span
								class="border-border/50 bg-surface/50 flex h-10 w-10 items-center justify-center rounded-xl border"
							>
								<Users class="h-4 w-4" />
							</span>
							<div>
								<p class="text-muted-foreground text-[11px] tracking-[0.3em] uppercase">
									Participants
								</p>
								<p class="text-sm font-medium">{pot.participants}</p>
							</div>
						</div>
					</div>
					<div class="flex items-center justify-between">
						{#if pot.streak}
							<Badge
								variant="secondary"
								class="border-border/40 bg-surface/50 text-foreground/80 text-[10px] tracking-[0.3em] uppercase"
							>
								{pot.streak}
							</Badge>
						{:else}
							<span class="text-muted-foreground text-xs tracking-[0.3em] uppercase">Live pot</span>
						{/if}
						<Button size="sm" class="bg-card text-card-foreground hover:bg-card/90 gap-2">
							Join pot
							<ArrowRight class="h-4 w-4" />
						</Button>
					</div>
				</div>
			</article>
		{/each}
	</div>
</section>
