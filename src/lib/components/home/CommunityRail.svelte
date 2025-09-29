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

<aside
	class="hidden h-full w-full flex-col gap-5 rounded-[28px] border border-white/10 bg-[radial-gradient(circle_at_20%_20%,rgba(45,212,191,0.16),transparent_55%),radial-gradient(circle_at_80%_40%,rgba(59,130,246,0.18),transparent_60%),rgba(15,23,42,0.78)] p-6 text-white shadow-[0_32px_120px_rgba(15,23,42,0.4)] backdrop-blur-xl xl:flex"
>
	<header class="space-y-1">
		<p class="text-[11px] tracking-[0.35em] text-white/60 uppercase">Community rail</p>
		<h2 class="text-lg font-semibold text-white">Trading floor chat</h2>
	</header>

	<div
		class="rounded-3xl border border-white/20 bg-gradient-to-br from-white/10 via-white/5 to-transparent p-5 shadow-[0_18px_45px_rgba(12,74,110,0.25)]"
	>
		<div class="flex items-center gap-3">
			<span
				class="flex h-12 w-12 items-center justify-center rounded-xl border border-white/25 bg-white/10 text-white"
			>
				<CloudRain class="h-5 w-5" />
			</span>
			<div>
				<p class="text-[11px] tracking-[0.3em] text-white/70 uppercase">Rain pot</p>
				<p class="text-2xl font-semibold text-white">{currentPot.total}</p>
			</div>
		</div>
		<div
			class="mt-4 flex items-center justify-between text-[10px] tracking-[0.3em] text-white/60 uppercase"
		>
			<span class="flex items-center gap-2"
				><Users class="h-3.5 w-3.5" /> {currentPot.contributors} online</span
			>
			<span>Ends in {currentPot.endsIn}</span>
		</div>
	</div>

	<div class="flex flex-1 flex-col gap-3">
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
		class="flex items-center gap-2 rounded-2xl border border-white/15 bg-black/20 px-4 py-3"
		onsubmit={handleSubmit}
	>
		<label class="sr-only" for="community-message">Message</label>
		<input
			id="community-message"
			class="h-10 flex-1 border-0 bg-transparent text-sm text-white placeholder:text-white/50 focus:outline-none"
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
