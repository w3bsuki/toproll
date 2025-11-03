<script lang="ts">
	import { ChatComponent } from '$lib/features/chat';
	import type { ChatMessage, ChatUser } from '$lib/features/chat/chat-realtime';
</script>

<svelte:head>
	<title>Community Chat - TopRoll</title>
	<meta name="description" content="Chat with the TopRoll community" />
</svelte:head>

<div class="container mx-auto p-6">
	<div class="mb-6">
		<h1 class="mb-2 text-3xl font-bold">Community Chat</h1>
		<p class="text-muted-foreground">
			Connect with other players, share your wins, and stay updated on community events.
		</p>
	</div>

	<ChatComponent roomId="global" class="h-[calc(100vh-200px)]" />
</div>
