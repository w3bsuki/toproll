<script lang="ts">
	import ChatPanel from './shell/ChatPanel.svelte';
	import { MessageCircle } from '@lucide/svelte';
</script>

<div class="flex h-full flex-col">
	<!-- Header -->
	<div class="border-border/50 flex h-16 items-center border-b px-4">
		<div class="flex items-center gap-3">
			<div class="bg-primary/15 text-primary flex h-10 w-10 items-center justify-center rounded-lg">
				<MessageCircle class="h-5 w-5" />
			</div>
			<div class="flex flex-col">
				<h2 class="text-sm font-semibold">Chat & Rain Pot</h2>
				<p class="text-muted-foreground text-xs">Live community chat</p>
			</div>
		</div>
	</div>

	<!-- Content -->
	<div class="flex-1 overflow-hidden px-4 py-4">
		<ChatPanel />
	</div>
</div>
