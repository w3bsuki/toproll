// Realtime chat system for TopRoll
import { browser } from '$app/environment';
import { getSupabaseClient } from '$lib/supabase/client';
import type { RealtimeChannel, RealtimePresenceState } from '@supabase/supabase-js';

export interface ChatMessage {
	id: string;
	room_id: string;
	user_id: string | null;
	user_name: string;
	message: string;
	created_at: string;
	is_vip?: boolean;
	level?: number;
}

export interface ChatUser {
	id: string;
	username: string;
	avatar?: string;
	isOnline: boolean;
	isVIP?: boolean;
	level?: number;
}

export interface ChatConnectionState {
	roomId: string | null;
	isConnected: boolean;
	isConnecting: boolean;
	error: string | null;
	messages: ChatMessage[];
	onlineUsers: ChatUser[];
}

export class ChatRealtimeClient {
	private supabase = getSupabaseClient();
	private channel: RealtimeChannel | null = null;
	private roomId: string | null = null;
	private userId: string | null = null;
	private username: string = 'Guest';
	private reconnectAttempts = 0;
	private maxReconnectAttempts = 5;
	private reconnectDelay = 1000; // Start with 1 second

	// Rate limiting
	private messageTimestamps: number[] = [];
	private readonly RATE_LIMIT = 3; // messages
	private readonly RATE_WINDOW = 10000; // 10 seconds

	// Reactive state with Svelte 5 runes
	messages = $state<ChatMessage[]>([]);
	onlineUsers = $state<ChatUser[]>([]);
	isConnected = $state(false);
	isConnecting = $state(false);
	error = $state<string | null>(null);

	constructor() {
		// Auto-cleanup on page unload
		if (browser) {
			window.addEventListener('beforeunload', () => this.disconnect());
			window.addEventListener('visibilitychange', () => {
				if (document.hidden) {
					this.pauseHeartbeat();
				} else {
					this.resumeHeartbeat();
				}
			});
		}
	}

	/**
	 * Connect to a chat room
	 */
	async connect(roomId: string, userId?: string | null, username?: string): Promise<boolean> {
		if (!browser || !roomId) return false;

		if (this.isConnected && this.roomId === roomId) {
			return true; // Already connected
		}

		this.disconnect(); // Clean up existing connection

		this.isConnecting = true;
		this.error = null;
		this.roomId = roomId;
		this.userId = userId || null;
		this.username = username || 'Guest';

		try {
			const channelName = `chat:${roomId}`;
			this.channel = this.supabase.channel(channelName, {
				config: {
					broadcast: { self: true },
					presence: { key: this.userId || `guest_${Date.now()}` }
				}
			});

			// Set up channel event handlers
			this.setupChannelHandlers();

			// Subscribe to the channel
			await this.channel.subscribe((status) => {
				console.log(`Chat channel ${channelName} status:`, status);

				if (status === 'SUBSCRIBED') {
					this.isConnected = true;
					this.isConnecting = false;
					this.reconnectAttempts = 0;
					this.reconnectDelay = 1000;

					// Track user in presence
					this.trackPresence();

					// Load recent messages
					this.loadRecentMessages();
				} else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') {
					this.handleConnectionError(status);
				}
			});

			return true;
		} catch (err) {
			this.isConnecting = false;
			this.error = err instanceof Error ? err.message : 'Failed to connect to chat';
			console.error('Chat connection error:', err);
			return false;
		}
	}

	/**
	 * Set up channel event handlers
	 */
	private setupChannelHandlers() {
		if (!this.channel) return;

		// Listen for new messages
		this.channel.on(
			'postgres_changes',
			{
				event: 'INSERT',
				schema: 'public',
				table: 'chat_messages',
				filter: `room_id=eq.${this.roomId}`
			},
			(payload) => {
				const newMessage = payload.new as ChatMessage;
				this.messages = [...this.messages, newMessage];

				// Keep only last 100 messages
				if (this.messages.length > 100) {
					this.messages = this.messages.slice(-100);
				}
			}
		);

		// Handle presence events
		this.channel.on('presence', { event: 'sync' }, () => {
			const state = this.channel?.presenceState();
			this.updateOnlineUsers(state);
		});

		this.channel.on('presence', { event: 'join' }, ({ key, newPresences }) => {
			console.log('User joined chat:', key, newPresences);
			const state = this.channel?.presenceState();
			this.updateOnlineUsers(state);
		});

		this.channel.on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
			console.log('User left chat:', key, leftPresences);
			const state = this.channel?.presenceState();
			this.updateOnlineUsers(state);
		});
	}

	/**
	 * Load recent messages from the database
	 */
	private async loadRecentMessages() {
		if (!this.roomId) return;

		try {
			const { data: messages, error } = await this.supabase
				.from('chat_messages')
				.select('*')
				.eq('room_id', this.roomId)
				.order('created_at', { ascending: false })
				.limit(50);

			if (error) {
				console.error('Error loading recent messages:', error);
				return;
			}

			this.messages = messages.reverse(); // Show oldest first
		} catch (err) {
			console.error('Error loading recent messages:', err);
		}
	}

	/**
	 * Update online users from presence state
	 */
	private updateOnlineUsers(state: RealtimePresenceState | undefined) {
		if (!state) return;

		const users: ChatUser[] = [];

		for (const [key, presences] of Object.entries(state)) {
			for (const presence of presences) {
				const user = presence as any;
				users.push({
					id: user.user_id || key,
					username: user.username || 'Anonymous',
					avatar: user.avatar,
					isOnline: true,
					isVIP: user.is_vip,
					level: user.level
				});
			}
		}

		this.onlineUsers = users;
	}

	/**
	 * Track current user in presence
	 */
	private async trackPresence() {
		if (!this.channel || !this.isConnected) return;

		try {
			await this.channel.track({
				user_id: this.userId,
				username: this.username,
				online_at: new Date().toISOString()
			});
		} catch (err) {
			console.error('Error tracking presence:', err);
		}
	}

	/**
	 * Send a message
	 */
	async sendMessage(message: string): Promise<boolean> {
		if (!message.trim()) return false;

		// Rate limiting check
		if (!this.canSendMessage()) {
			this.error = 'Please wait before sending more messages';
			return false;
		}

		if (!this.isConnected || !this.roomId) {
			this.error = 'Not connected to chat';
			return false;
		}

		try {
			const { error } = await this.supabase.from('chat_messages').insert({
				room_id: this.roomId,
				user_id: this.userId,
				user_name: this.username,
				message: message.trim()
			});

			if (error) {
				this.error = error.message;
				return false;
			}

			// Track for rate limiting
			this.messageTimestamps.push(Date.now());
			this.error = null;
			return true;
		} catch (err) {
			this.error = err instanceof Error ? err.message : 'Failed to send message';
			return false;
		}
	}

	/**
	 * Check if user can send message (rate limiting)
	 */
	private canSendMessage(): boolean {
		const now = Date.now();
		// Remove old timestamps outside window
		this.messageTimestamps = this.messageTimestamps.filter((ts) => now - ts < this.RATE_WINDOW);
		return this.messageTimestamps.length < this.RATE_LIMIT;
	}

	/**
	 * Handle connection errors with reconnection
	 */
	private handleConnectionError(status: string) {
		this.isConnected = false;
		this.isConnecting = false;
		this.error = `Connection lost: ${status}`;

		if (this.reconnectAttempts < this.maxReconnectAttempts) {
			this.reconnectAttempts++;
			console.log(
				`Attempting reconnection ${this.reconnectAttempts}/${this.maxReconnectAttempts} in ${this.reconnectDelay}ms`
			);

			setTimeout(() => {
				if (this.roomId) {
					this.connect(this.roomId, this.userId, this.username);
				}
			}, this.reconnectDelay);

			// Exponential backoff
			this.reconnectDelay = Math.min(this.reconnectDelay * 2, 30000);
		} else {
			this.error = 'Unable to reconnect to chat. Please refresh the page.';
		}
	}

	/**
	 * Pause heartbeat when tab is hidden
	 */
	private pauseHeartbeat() {
		// Implementation for presence heartbeat pausing
		// This helps with performance when tab is not visible
	}

	/**
	 * Resume heartbeat when tab becomes visible
	 */
	private resumeHeartbeat() {
		// Implementation for presence heartbeat resumption
		// Re-sync presence when tab becomes visible
		if (this.isConnected) {
			this.trackPresence();
		}
	}

	/**
	 * Disconnect from chat
	 */
	disconnect() {
		if (this.channel) {
			this.channel.unsubscribe();
			this.channel = null;
		}

		this.isConnected = false;
		this.isConnecting = false;
		this.roomId = null;
		this.userId = null;
		this.reconnectAttempts = 0;
		this.reconnectDelay = 1000;
	}

	/**
	 * Get current connection state
	 */
	getState(): ChatConnectionState {
		return {
			roomId: this.roomId,
			isConnected: this.isConnected,
			isConnecting: this.isConnecting,
			error: this.error,
			messages: [...this.messages],
			onlineUsers: [...this.onlineUsers]
		};
	}
}
