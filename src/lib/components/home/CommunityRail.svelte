<script lang="ts">
	import { communityMessages, pushCommunityMessage, rainPot } from '$lib/stores/homepage';
	import { Button } from '$lib/components/ui';
	import { CloudRain, Send, Users } from 'lucide-svelte';

	const messages = $derived($communityMessages);
	const currentPot = $derived($rainPot);
	let input = $state('');

	function sendMessage() {
		const trimmed = input.trim();
		if (!trimmed) return;
		pushCommunityMessage({ username: 'Guest', message: trimmed });
		input = '';
	}

	function handleSubmit(event: SubmitEvent) {
		event.preventDefault();
		sendMessage();
	}

	function handleKey(event: KeyboardEvent) {
		if (event.key === 'Enter' && !event.shiftKey) {
			event.preventDefault();
			sendMessage();
		}
	}
</script>

<aside class="hidden xl:flex xl:w-[300px] xl:flex-col xl:gap-5 xl:pt-6 xl:pr-4 xl:pl-6">
	<div class="flex items-center justify-between">
		<div>
			<p class="text-muted-foreground text-xs tracking-[0.3em] uppercase">Community</p>
			<p class="text-foreground text-sm font-semibold">Trading floor chat</p>
		</div>
		<span
			class="bg-primary/15 text-primary flex h-9 w-9 items-center justify-center rounded-xl font-semibold"
			>💬</span
		>
	</div>

	<div
		class="border-primary/20 from-primary/15 via-primary/5 rounded-3xl border bg-gradient-to-br to-transparent p-5 shadow-[0_18px_45px_rgba(12,74,110,0.25)] backdrop-blur"
	>
		<div class="flex items-center gap-3">
			<span
				class="flex h-12 w-12 items-center justify-center rounded-xl border border-white/25 bg-white/10 text-white"
			>
				<CloudRain class="h-5 w-5" />
			</span>
			<div>
				<p class="text-xs tracking-[0.3em] text-white/70 uppercase">Rain pot</p>
				<p class="text-xl font-semibold text-white">{currentPot.total}</p>
			</div>
		</div>
		<div
			class="mt-4 flex items-center justify-between text-[11px] tracking-[0.3em] text-white/70 uppercase"
		>
			<span class="flex items-center gap-2"
				><Users class="h-3.5 w-3.5" /> {currentPot.contributors} online</span
			>
			<span>Ends in {currentPot.endsIn}</span>
		</div>
	</div>

	<div class="marketplace-scrollbar flex-1 space-y-3 overflow-y-auto pr-1">
		{#each messages as message}
			<article
				class="border-border/40 bg-surface/70 rounded-2xl border px-4 py-3 text-sm shadow-[0_10px_30px_rgba(15,23,42,0.2)]"
			>
				<div
					class="text-muted-foreground mb-1 flex items-center justify-between text-[11px] tracking-[0.3em] uppercase"
				>
					<div class="flex items-center gap-2 text-xs normal-case">
						<span class="text-foreground font-semibold">{message.username}</span>
						{#if message.badge}
							<span
								class={`rounded-full px-2 py-0.5 text-[10px] tracking-[0.3em] uppercase ${
									message.badge === 'vip'
										? 'bg-primary/20 text-primary'
										: message.badge === 'staff'
											? 'bg-accent/20 text-accent-foreground'
											: 'bg-secondary/20 text-secondary-foreground'
								}`}>{message.badge}</span
							>
						{/if}
					</div>
					<span class="text-[11px] normal-case">{message.timestamp}</span>
				</div>
				<p class="text-foreground/90 text-sm leading-relaxed">{message.message}</p>
			</article>
		{/each}
	</div>
	<form
		class="border-border/40 bg-surface/80 flex items-center gap-2 rounded-2xl border px-4 py-3"
		onsubmit={handleSubmit}
	>
		<label class="sr-only" for="community-message">Message</label>
		<input
			id="community-message"
			class="text-foreground placeholder:text-muted-foreground h-10 flex-1 border-0 bg-transparent text-sm focus:outline-none"
			placeholder="Share a drop..."
			bind:value={input}
			onkeydown={handleKey}
		/>
		<Button size="icon" variant="secondary" class="h-9 w-9 rounded-full" type="submit">
			<Send class="h-4 w-4" />
			<span class="sr-only">Send</span>
		</Button>
	</form>
</aside>
