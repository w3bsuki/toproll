<script lang="ts">
	import { get } from 'svelte/store';
	import { rainPot, type RainPot } from '$lib/stores/homepage';
	import { CloudRain, Users, Clock } from '@lucide/svelte';
	import { Button } from '$lib/components/ui';

	let currentPot = $state<RainPot>(get(rainPot));

	$effect(() => {
		const unsubscribe = rainPot.subscribe((value) => {
			currentPot = value;
		});
		return unsubscribe;
	});
</script>

<section
	class="border-border/50 from-primary/10 via-card to-card relative overflow-hidden rounded-xl border bg-gradient-to-br p-4 shadow-sm"
>
	<!-- Icon & Title -->
	<div class="mb-3 flex items-center gap-3">
		<div
			class="bg-primary/20 border-primary/40 flex h-10 w-10 items-center justify-center rounded-lg border"
		>
			<CloudRain class="text-primary h-5 w-5" strokeWidth={2} />
		</div>
		<div class="flex-1">
			<p class="text-muted-foreground text-xs font-medium tracking-wide uppercase">Rain Pot</p>
			<p class="text-primary text-2xl font-bold tracking-tight">{currentPot.total}</p>
		</div>
	</div>

	<!-- Stats -->
	<div
		class="bg-background/50 border-border/50 mb-3 flex items-center justify-between rounded-lg border px-3 py-2 text-xs"
	>
		<span class="text-muted-foreground flex items-center gap-1.5">
			<Users class="h-3.5 w-3.5" strokeWidth={2} />
			<span class="font-medium">{currentPot.contributors}</span>
		</span>
		<span class="text-muted-foreground flex items-center gap-1.5">
			<Clock class="h-3.5 w-3.5" strokeWidth={2} />
			<span class="font-medium">{currentPot.endsIn}</span>
		</span>
	</div>

	<!-- CTA -->
	<Button class="w-full" size="sm">Join Rain Pot</Button>
</section>
