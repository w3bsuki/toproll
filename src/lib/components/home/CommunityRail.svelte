<script lang="ts">
	import { get } from 'svelte/store';
	import { Button } from '$lib/components/ui';
	import { CloudRain, Send, Users } from '@lucide/svelte';
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
	class="border-border/50 text-foreground shadow-marketplace-lg hidden h-full w-full flex-col overflow-hidden rounded-[32px] border bg-[radial-gradient(circle_at_20%_20%,oklch(var(--accent)/0.16),transparent_55%),radial-gradient(circle_at_80%_40%,oklch(var(--primary)/0.18),transparent_60%),oklch(var(--surface)/0.85)] p-6 backdrop-blur-2xl xl:flex"
>
	<header class="space-y-1">
		<p class="text-muted-foreground text-[11px] tracking-[0.35em] uppercase">Community rail</p>
		<h2 class="text-lg font-semibold">Trading floor chat</h2>
	</header>

	<section
		class="border-border/50 bg-surface/60 shadow-marketplace-md mt-4 rounded-3xl border p-5 text-sm"
	>
		<div class="flex items-center gap-4">
			<span
				class="border-border/50 bg-surface/50 text-foreground flex h-14 w-14 items-center justify-center rounded-2xl border"
			>
				<CloudRain class="h-5 w-5" />
			</span>
			<div>
				<p class="text-muted-foreground text-[11px] tracking-[0.3em] uppercase">Rain pot</p>
				<p class="text-2xl font-semibold">{currentPot.total}</p>
			</div>
		</div>
		<div
			class="text-muted-foreground mt-4 flex items-center justify-between text-[11px] tracking-[0.3em] uppercase"
		>
			<span class="flex items-center gap-2">
				<Users class="h-3.5 w-3.5" />
				{currentPot.contributors} queued
			</span>
			<span>Ends in {currentPot.endsIn}</span>
		</div>
		<Button
			class="bg-surface/40 text-foreground hover:bg-surface/60 mt-5 w-full rounded-2xl"
			variant="secondary"
		>
			Join rain pot
		</Button>
	</section>

	<div class="mt-5 flex flex-1 flex-col overflow-hidden">
		<div class="marketplace-scrollbar flex-1 space-y-3 overflow-y-auto pr-2">
			{#each messages as message (message.id)}
				<article
					class="border-border/40 bg-surface/50 shadow-marketplace-sm rounded-2xl border px-4 py-3 text-sm"
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
											? 'bg-primary/20 text-primary-foreground'
											: message.badge === 'staff'
												? 'bg-accent/20 text-accent-foreground'
												: 'bg-secondary/20 text-secondary-foreground'
									}`}
								>
									{message.badge}
								</span>
							{/if}
						</div>
						<span class="text-[11px] normal-case">{message.timestamp}</span>
					</div>
					<p class="text-foreground/80 leading-relaxed">{message.message}</p>
				</article>
			{/each}
		</div>
		<form
			class="border-border/40 bg-surface/60 mt-4 flex items-center gap-2 rounded-2xl border px-4 py-3"
			onsubmit={handleSubmit}
		>
			<label class="sr-only" for="community-message">Message</label>
			<input
				id="community-message"
				class="text-foreground placeholder:text-muted-foreground h-10 flex-1 border-0 bg-transparent text-sm focus:outline-none"
				placeholder="Share a drop..."
				value={input}
				oninput={handleInput}
				onkeydown={handleKey}
			/>
			<Button
				size="icon"
				variant="secondary"
				class="border-border/50 bg-surface/40 h-10 w-10 rounded-full border"
				type="submit"
			>
				<Send class="h-4 w-4" />
				<span class="sr-only">Send</span>
			</Button>
		</form>
	</div>
</aside>
