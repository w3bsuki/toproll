<script lang="ts">
	import { Avatar, AvatarImage, AvatarFallback } from '$lib/components/ui/avatar';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui';
	import { Send, Users, Settings, MessageCircle, AlertCircle } from '@lucide/svelte';
	import { cn } from '$lib/utils';
	import { ChatRealtimeClient, type ChatMessage, type ChatUser } from '$lib/features/chat/chat-realtime';
	// âœ… NEW: Get auth state from context
	import { getAuthState } from '$lib/features/auth/auth-state.svelte';

	export interface Props {
		roomId?: string;
		class?: string;
	}

	let { roomId = 'global', class: className = '' }: Props = $props();

	// âœ… NEW: Get auth from context
	const auth = getAuthState();

	// Chat client instance
	let chatClient = $state<ChatRealtimeClient | null>(null);

	// Auth state
	let currentUser = $state<ChatUser>({
		id: 'guest',
		username: 'Guest',
		isOnline: true,
		isVIP: false,
		level: 1
	});

	// Form state
	let newMessage = $state('');
	let messagesEnd = $state<HTMLDivElement>();
	let chatContainer = $state<HTMLDivElement>();

	// âœ… NEW: Initialize user from auth state
	$effect(() => {
		if (auth.user && auth.profile) {
			currentUser = {
				id: auth.user.id,
				username: auth.profile.username ?? auth.user.email?.split('@')[0] ?? 'User',
				avatar: auth.profile.avatar_url ?? undefined,
				isOnline: true,
				isVIP: false, // TODO: Add VIP status to UserProfile if needed
				level: 1 // TODO: Add level to UserProfile if needed
			};
		}
	});

	// Initialize chat client when user is ready
	$effect(() => {
		if (currentUser.id !== 'guest') {
			chatClient = new ChatRealtimeClient();
			chatClient.connect(roomId, currentUser.id, currentUser.username);
		}
	});

	// Auto-scroll to bottom when new messages arrive
	$effect(() => {
		if (messagesEnd && chatClient) {
			messagesEnd.scrollIntoView({ behavior: 'smooth' });
		}
	});

	const formatTime = (timestamp: string) => {
		const date = new Date(timestamp);
		return date.toLocaleTimeString('en-US', {
			hour: '2-digit',
			minute: '2-digit'
		});
	};

	const sendMessage = async () => {
		if (!newMessage.trim() || !chatClient) return;

		const success = await chatClient.sendMessage(newMessage.trim());
		if (success) {
			newMessage = '';
		} else {
			// Error is handled by the chat client state
			console.error('Failed to send message');
		}
	};

	const handleKeyPress = (e: KeyboardEvent) => {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault();
			sendMessage();
		}
	};

	const getUserInitials = (username: string) => {
		return username
			.split(' ')
			.map((word) => word[0])
			.join('')
			.toUpperCase()
			.slice(0, 2);
	};

	const getVIPBadgeColor = (level?: number) => {
		if (!level) return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
		if (level >= 5) return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
		if (level >= 3) return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
		return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
	};

	// Cleanup on unmount
	$effect(() => {
		return () => {
			if (chatClient) {
				chatClient.disconnect();
			}
		};
	});
</script>

<div class={cn('flex h-[600px] gap-4', className)}>
	<!-- Online Users Sidebar -->
	<Card class="border-border/60 bg-surface/70 w-80">
		<CardHeader class="pb-3">
			<CardTitle class="flex items-center gap-2 text-lg">
				<Users class="h-5 w-5" />
				Online Users ({#if chatClient}{chatClient.onlineUsers.length}{:else}0{/if})
			</CardTitle>
		</CardHeader>
		<CardContent class="space-y-3 p-4">
			{#if chatClient}
				{#each chatClient.onlineUsers as user (user.id)}
					<div class="hover:bg-surface/50 flex items-center gap-3 rounded-lg p-2 transition-colors">
						<div class="relative">
							<Avatar class="h-8 w-8">
								<AvatarImage src={user.avatar} alt={user.username} />
								<AvatarFallback class="text-xs font-medium">
									{getUserInitials(user.username)}
								</AvatarFallback>
							</Avatar>
							<div
								class={cn(
									'border-surface absolute -right-0.5 -bottom-0.5 h-3 w-3 rounded-full border-2',
									user.isOnline ? 'bg-success' : 'bg-muted'
								)}
							></div>
						</div>
						<div class="min-w-0 flex-1">
							<div class="flex items-center gap-2">
								<p class="truncate text-sm font-medium">{user.username}</p>
								{#if user.isVIP}
									<div
										class={cn(
											'rounded-full border px-1.5 py-0.5 text-[10px] font-semibold',
											getVIPBadgeColor(user.level)
										)}
									>
										VIP
									</div>
								{/if}
							</div>
							{#if user.level}
								<p class="text-muted-foreground text-xs">Level {user.level}</p>
							{/if}
						</div>
					</div>
				{/each}
			{:else}
				<div class="text-muted-foreground py-4 text-center text-sm">Connecting to chat...</div>
			{/if}
		</CardContent>
	</Card>

	<!-- Chat Area -->
	<Card class="border-border/60 bg-surface/70 flex flex-1 flex-col">
		<CardHeader class="border-border/40 border-b pb-3">
			<CardTitle class="flex items-center justify-between">
				<div class="flex items-center gap-2">
					<MessageCircle class="h-5 w-5" />
					Community Chat
					{#if chatClient?.isConnected}
						<div class="bg-success h-2 w-2 rounded-full"></div>
					{:else if chatClient?.isConnecting}
						<div class="bg-warning h-2 w-2 animate-pulse rounded-full"></div>
					{:else}
						<div class="bg-destructive h-2 w-2 rounded-full"></div>
					{/if}
				</div>
				<Button variant="ghost" size="sm" class="h-8 w-8 p-0">
					<Settings class="h-4 w-4" />
				</Button>
			</CardTitle>
		</CardHeader>

		<!-- Connection Status -->
		{#if chatClient?.error}
			<div
				class="bg-destructive/10 border-destructive/20 mx-4 mt-2 flex items-center gap-2 rounded-lg border p-2"
			>
				<AlertCircle class="text-destructive h-4 w-4" />
				<span class="text-destructive text-sm">{chatClient.error}</span>
			</div>
		{/if}

		<!-- Messages -->
		<CardContent class="flex-1 space-y-4 overflow-y-auto p-4">
			{#if chatClient}
				{#each chatClient.messages as message (message.id)}
					<div
						class={cn(
							'flex gap-3',
							message.user_name === currentUser.username ? 'justify-end' : 'justify-start'
						)}
					>
						{#if message.user_name !== currentUser.username}
							<Avatar class="mt-1 h-8 w-8">
								<AvatarImage src="" alt={message.user_name} />
								<AvatarFallback class="text-xs font-medium">
									{getUserInitials(message.user_name)}
								</AvatarFallback>
							</Avatar>
						{/if}

						<div
							class={cn(
								'max-w-xs lg:max-w-md',
								message.user_name === currentUser.username ? 'text-right' : 'text-left'
							)}
						>
							<div class="mb-1 flex items-center gap-2">
								<span class="text-muted-foreground text-xs font-medium">
									{message.user_name}
								</span>
								{#if message.is_vip}
									<div
										class={cn(
											'rounded-full border px-1.5 py-0.5 text-[10px] font-semibold',
											getVIPBadgeColor(message.level)
										)}
									>
										VIP
									</div>
								{/if}
								<span class="text-muted-foreground text-xs">
									{formatTime(message.created_at)}
								</span>
							</div>

							<div
								class={cn(
									'rounded-lg px-3 py-2 text-sm',
									message.user_name === currentUser.username
										? 'bg-primary text-primary-foreground'
										: 'bg-surface-accent text-surface-accent-foreground'
								)}
							>
								{message.message}
							</div>
						</div>

						{#if message.user_name === currentUser.username}
							<Avatar class="mt-1 h-8 w-8">
								<AvatarImage src={currentUser.avatar} alt={currentUser.username} />
								<AvatarFallback class="text-xs font-medium">
									{getUserInitials(currentUser.username)}
								</AvatarFallback>
							</Avatar>
						{/if}
					</div>
				{/each}
			{:else}
				<div class="text-muted-foreground py-8 text-center text-sm">Connecting to chat...</div>
			{/if}
			<div bind:this={messagesEnd}></div>
		</CardContent>

		<!-- Message Input -->
		<div class="border-border/40 border-t p-4">
			<div class="flex gap-2">
				<Input
					type="text"
					placeholder="Type your message..."
					bind:value={newMessage}
					onkeypress={handleKeyPress}
					disabled={!chatClient?.isConnected}
					class="flex-1"
				/>
				<Button
					onclick={sendMessage}
					disabled={!newMessage.trim() || !chatClient?.isConnected}
					class="gap-2"
				>
					<Send class="h-4 w-4" />
					Send
				</Button>
			</div>
			{#if chatClient?.error && chatClient.error.includes('wait')}
				<p class="text-muted-foreground mt-2 text-xs">
					{chatClient.error}
				</p>
			{/if}
		</div>
	</Card>
</div>

