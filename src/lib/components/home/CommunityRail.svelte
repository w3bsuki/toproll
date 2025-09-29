<script lang="ts">
	import { get } from 'svelte/store';
	import { Button } from '$lib/components/ui';
	import { CloudRain, Send, Users } from 'lucide-svelte';
	import {
		communityMessages,
		pushCommunityMessage,
		rainPot,
		type CommunityMessage,
		type RainPot
	} from '$lib/stores/homepage';

	let messages = $state<CommunityMessage[]>(get(communityMessages));
	let currentPot = $state<RainPot>(get(rainPot));
	let input = $state('');

	$effect(() => {
		const unsubscribe = communityMessages.subscribe((value) => {
			messages = value;
		});
		return unsubscribe;
	});

	$effect(() => {
		const unsubscribe = rainPot.subscribe((value) => {
			currentPot = value;
		});
		return unsubscribe;
	});

	const sendMessage = () => {
		const trimmed = input.trim();
		if (!trimmed) return;
		pushCommunityMessage({ username: 'Guest', message: trimmed });
		input = '';
	};

	const handleSubmit = (event: SubmitEvent) => {
		event.preventDefault();
		sendMessage();
	};

	const handleKey = (event: KeyboardEvent) => {
		if (event.key === 'Enter' && !event.shiftKey) {
			event.preventDefault();
			sendMessage();
		}
	};

	const handleInput = (event: Event) => {
		const target = event.target as HTMLInputElement | HTMLTextAreaElement;
		input = target.value;
	};
</script>

<aside
	class="hidden h-full w-full flex-col overflow-hidden rounded-[32px] border border-white/10 bg-[radial-gradient(circle_at_20%_20%,rgba(45,212,191,0.16),transparent_55%),radial-gradient(circle_at_80%_40%,rgba(59,130,246,0.18),transparent_60%),rgba(15,23,42,0.82)] p-6 text-white shadow-[0_36px_140px_rgba(15,23,42,0.45)] backdrop-blur-2xl xl:flex"
>
	<header class="space-y-1">
		<p class="text-[11px] tracking-[0.35em] text-white/60 uppercase">Community rail</p>
		<h2 class="text-lg font-semibold">Trading floor chat</h2>
	</header>

	<section
		class="mt-4 rounded-3xl border border-white/25 bg-white/10 p-5 text-sm shadow-[0_18px_45px_rgba(12,74,110,0.25)]"
	>
		<div class="flex items-center gap-4">
			<span
				class="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/30 bg-white/15 text-white"
			>
				<CloudRain class="h-5 w-5" />
			</span>
			<div>
				<p class="text-[11px] tracking-[0.3em] text-white/70 uppercase">Rain pot</p>
				<p class="text-2xl font-semibold">{currentPot.total}</p>
			</div>
		</div>
		<div
			class="mt-4 flex items-center justify-between text-[11px] tracking-[0.3em] text-white/70 uppercase"
		>
			<span class="flex items-center gap-2">
				<Users class="h-3.5 w-3.5" />
				{currentPot.contributors} queued
			</span>
			<span>Ends in {currentPot.endsIn}</span>
		</div>
		<Button
			class="mt-5 w-full rounded-2xl bg-white/15 text-white hover:bg-white/25"
			variant="secondary"
		>
			Join rain pot
		</Button>
	</section>

	<div class="mt-5 flex flex-1 flex-col overflow-hidden">
		<div class="marketplace-scrollbar flex-1 space-y-3 overflow-y-auto pr-2">
			{#each messages as message (message.id)}
				<article
					class="rounded-2xl border border-white/15 bg-black/20 px-4 py-3 text-sm shadow-[0_12px_35px_rgba(12,74,110,0.3)]"
				>
					<div
						class="mb-1 flex items-center justify-between text-[11px] tracking-[0.3em] text-white/60 uppercase"
					>
						<div class="flex items-center gap-2 text-xs normal-case">
							<span class="font-semibold text-white">{message.username}</span>
							{#if message.badge}
								<span
									class={`rounded-full px-2 py-0.5 text-[10px] tracking-[0.3em] uppercase ${
										message.badge === 'vip'
											? 'bg-primary/25 text-white'
											: message.badge === 'staff'
												? 'bg-accent/25 text-white'
												: 'bg-secondary/25 text-white'
									}`}
								>
									{message.badge}
								</span>
							{/if}
						</div>
						<span class="text-[11px] normal-case">{message.timestamp}</span>
					</div>
					<p class="leading-relaxed text-white/80">{message.message}</p>
				</article>
			{/each}
		</div>
		<form
			class="mt-4 flex items-center gap-2 rounded-2xl border border-white/20 bg-black/30 px-4 py-3"
			onsubmit={handleSubmit}
		>
			<label class="sr-only" for="community-message">Message</label>
			<input
				id="community-message"
				class="h-10 flex-1 border-0 bg-transparent text-sm text-white placeholder:text-white/50 focus:outline-none"
				placeholder="Share a drop..."
				value={input}
				oninput={handleInput}
				onkeydown={handleKey}
			/>
			<Button
				size="icon"
				variant="secondary"
				class="h-10 w-10 rounded-full border border-white/30 bg-white/15"
				type="submit"
			>
				<Send class="h-4 w-4" />
				<span class="sr-only">Send</span>
			</Button>
		</form>
	</div>
</aside>
