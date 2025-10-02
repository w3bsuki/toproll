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
	class="border-border/40 relative overflow-hidden rounded-xl border p-4"
	style="background: linear-gradient(135deg, oklch(var(--primary) / 0.12), oklch(var(--accent) / 0.08), transparent)"
>
	<!-- Icon & Title -->
	<div class="mb-3 flex items-center gap-3">
		<div
			class="border-primary/40 bg-primary/15 flex h-10 w-10 items-center justify-center rounded-lg border"
		>
			<CloudRain class="text-primary h-5 w-5" />
		</div>
		<div class="flex-1">
			<p class="text-muted-foreground text-xs tracking-wide uppercase">Rain Pot</p>
			<p class="text-foreground text-2xl font-bold">{currentPot.total}</p>
		</div>
	</div>

	<!-- Stats -->
	<div class="mb-4 flex items-center justify-between text-xs">
		<span class="text-muted-foreground flex items-center gap-1.5">
			<Users class="h-3.5 w-3.5" />
			<span class="font-medium">{currentPot.contributors} contributors</span>
		</span>
		<span class="text-muted-foreground flex items-center gap-1.5">
			<Clock class="h-3.5 w-3.5" />
			<span class="font-medium">{currentPot.endsIn}</span>
		</span>
	</div>

	<!-- CTA -->
	<Button class="w-full" size="sm">Join Rain Pot</Button>
</section>
