<script lang="ts">
	import { get } from 'svelte/store';
	import { Button } from '$lib/components/ui';
	import ChatList from '$lib/components/chat/ChatList.svelte';
	import ChatComposer from '$lib/components/chat/ChatComposer.svelte';
	import { CloudRain, Users } from 'lucide-svelte';
	import { cn } from '$lib/utils';
	import {
		communityMessages,
		pushCommunityMessage,
		rainPot,
		type CommunityMessage,
		type RainPot
	} from '$lib/stores/homepage';

	type CommunityRailProps = {
		class?: string;
		appearance?: 'rail' | 'panel';
	};

	const props = $props<CommunityRailProps>();
	const className = $derived(() => props.class ?? '');
	const appearance = $derived(() => (props.appearance ?? 'rail') as 'rail' | 'panel');

	let messages = $state<CommunityMessage[]>(get(communityMessages));
	let currentPot = $state<RainPot>(get(rainPot));
	let composerValue = $state('');

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

	const sendMessage = (value: string) => {
		const trimmed = value.trim();
		if (!trimmed) return;
		pushCommunityMessage({ username: 'Guest', message: trimmed });
	};

	const handleComposerSubmit = (event: CustomEvent<string>) => {
		sendMessage(event.detail);
		composerValue = '';
	};

	const handleComposerInput = (event: CustomEvent<string>) => {
		composerValue = event.detail;
	};

	const chatVariant = $derived(() => (appearance === 'rail' ? 'dark' : 'surface'));
	const multilineComposer = $derived(() => appearance !== 'rail');

	const containerClasses = {
		rail: 'border border-white/10 bg-[radial-gradient(circle_at_20%_20%,rgba(45,212,191,0.16),transparent_55%),radial-gradient(circle_at_80%_40%,rgba(59,130,246,0.18),transparent_60%),rgba(15,23,42,0.82)] text-white shadow-[0_36px_140px_rgba(15,23,42,0.45)] backdrop-blur-2xl',
		panel:
			'border border-border/60 bg-surface/80 text-foreground shadow-marketplace-lg backdrop-blur-xl'
	} as const;

	const potCardClasses = {
		rail: 'rounded-3xl border border-white/25 bg-white/10 p-5 text-sm shadow-[0_18px_45px_rgba(12,74,110,0.25)]',
		panel: 'rounded-3xl border border-border/60 bg-surface-muted/60 p-5 text-sm'
	} as const;

	const potLabelClasses = {
		rail: 'text-[11px] tracking-[0.3em] text-white/70 uppercase',
		panel: 'text-[11px] tracking-[0.3em] text-muted-foreground uppercase'
	} as const;
</script>

<aside
	class={cn(
		'flex h-full w-full flex-col overflow-hidden rounded-[32px] p-6',
		containerClasses[appearance],
		className
	)}
>
	<header class="space-y-1">
		<p
			class={cn(
				'text-[11px] tracking-[0.35em] uppercase',
				appearance === 'rail' ? 'text-white/60' : 'text-muted-foreground'
			)}
		>
			Community rail
		</p>
		<h2 id="community-rail-title" class="text-lg font-semibold">
			{appearance === 'rail' ? 'Trading floor chat' : 'Community updates'}
		</h2>
	</header>

	<section class={potCardClasses[appearance]} aria-describedby="rain-pot-meta">
		<div class="flex items-center gap-4">
			<span
				class={cn(
					'flex h-14 w-14 items-center justify-center rounded-2xl border',
					appearance === 'rail'
						? 'border-white/30 bg-white/15 text-white'
						: 'border-border/60 bg-surface/70 text-primary'
				)}
			>
				<CloudRain class="h-5 w-5" />
			</span>
			<div>
				<p class={potLabelClasses[appearance]}>Rain pot</p>
				<p class="text-2xl font-semibold">{currentPot.total}</p>
			</div>
		</div>
		<div
			id="rain-pot-meta"
			class={cn(
				'mt-4 flex items-center justify-between text-[11px] tracking-[0.3em] uppercase',
				appearance === 'rail' ? 'text-white/70' : 'text-muted-foreground'
			)}
		>
			<span class="flex items-center gap-2">
				<Users class="h-3.5 w-3.5" />
				{currentPot.contributors} queued
			</span>
			<span>Ends in {currentPot.endsIn}</span>
		</div>
		<Button
			class={cn(
				'mt-5 w-full rounded-2xl font-semibold',
				appearance === 'rail'
					? 'bg-white/15 text-white hover:bg-white/25'
					: 'bg-primary text-primary-foreground hover:bg-primary/90'
			)}
			variant={appearance === 'rail' ? 'secondary' : 'default'}
		>
			Join rain pot
		</Button>
	</section>

	<div class="mt-5 flex flex-1 flex-col overflow-hidden">
		<ChatList
			{messages}
			variant={chatVariant}
			ariaLive="polite"
			class="flex-1"
			labelledby={appearance === 'rail' ? undefined : 'community-rail-title'}
		/>
		<ChatComposer
			id={appearance === 'rail' ? 'community-message' : 'community-message-panel'}
			class="mt-4"
			value={composerValue}
			on:input={handleComposerInput}
			on:submit={handleComposerSubmit}
			placeholder="Share a drop..."
			variant={chatVariant}
			multiline={multilineComposer}
		/>
	</div>
</aside>
