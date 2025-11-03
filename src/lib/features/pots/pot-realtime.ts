// Realtime pot system for Community Pots
import { browser } from '$app/environment';
import { getSupabaseClient } from '$lib/supabase/client';
import type { Pot, PotEntry, PotEvent } from '$lib/types/index';

// Pot connection state
export interface PotConnectionState {
	potId: string | null;
	isConnected: boolean;
	isConnecting: boolean;
	error: string | null;
	lastEvent: PotEvent | null;
	participantCount: number;
	potStatus: Pot['status'];
	totalValue: number;
	fillPercent: number;
}

// Realtime pot client class
export class PotRealtimeClient {
	private supabase = getSupabaseClient();
	private channel: ReturnType<typeof this.supabase.channel> | null = null;
	private potId: string | null = null;
	private subscriptions: Map<string, ((event: PotEvent) => void)[]> = new Map();
	private reconnectAttempts = 0;
	private maxReconnectAttempts = 5;
	private reconnectDelay = 1000; // Start with 1 second

	// Simple state object (non-reactive for SSR compatibility)
	private _state: PotConnectionState = {
		potId: null,
		isConnected: false,
		isConnecting: false,
		error: null,
		lastEvent: null,
		participantCount: 0,
		potStatus: 'open',
		totalValue: 0,
		fillPercent: 0
	};

	// Public getter for state
	get state(): PotConnectionState {
		return this._state;
	}

	// Update state method
	private updateState(updates: Partial<PotConnectionState>) {
		this._state = { ...this._state, ...updates };
	}

	constructor() {
		// Auto-cleanup on page unload
		if (browser) {
			window.addEventListener('beforeunload', () => this.disconnect());
		}
	}

	/**
	 * Connect to a pot channel
	 */
	async connect(potId: string): Promise<boolean> {
		if (!browser || !potId) return false;

		if (this._state.isConnected && this.potId === potId) {
			return true; // Already connected
		}

		this.disconnect(); // Clean up existing connection

		this.updateState({ isConnecting: true, error: null });
		this.potId = potId;

		try {
			const channelName = `pots:${potId}`;
			this.channel = this.supabase.channel(channelName, {
				config: {
					broadcast: { self: true },
					presence: { key: `user_${Date.now()}` }
				}
			});

			// Set up channel event handlers
			this.setupChannelHandlers();

			// Subscribe to the channel
			await this.channel.subscribe((status) => {
				console.log(`Pot channel ${channelName} status:`, status);

				if (status === 'SUBSCRIBED') {
					this.handleConnected();
				} else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') {
					this.handleDisconnected(status);
				}
			});

			return true;
		} catch (error) {
			this.handleError(error);
			return false;
		}
	}

	/**
	 * Disconnect from current pot channel
	 */
	disconnect() {
		if (this.channel) {
			this.channel.unsubscribe();
			this.channel = null;
		}

		this.potId = null;
		this.updateState({
			isConnected: false,
			isConnecting: false,
			error: null,
			participantCount: 0,
			potId: null
		});
	}

	/**
	 * Subscribe to specific pot events
	 */
	subscribe(eventType: PotEvent['type'], callback: (event: PotEvent) => void): () => void {
		if (!this.subscriptions.has(eventType)) {
			this.subscriptions.set(eventType, []);
		}

		const callbacks = this.subscriptions.get(eventType)!;
		callbacks.push(callback);

		// Return unsubscribe function
		return () => {
			const index = callbacks.indexOf(callback);
			if (index > -1) {
				callbacks.splice(index, 1);
			}
		};
	}

	/**
	 * Emit an event to the pot channel (for testing/admin)
	 */
	async emit(event: PotEvent): Promise<boolean> {
		if (!this.channel || !this._state.isConnected) {
			return false;
		}

		try {
			await this.channel.send({
				type: 'broadcast',
				event: 'pot_event',
				payload: event
			});
			return true;
		} catch (error) {
			console.error('Failed to emit pot event:', error);
			return false;
		}
	}

	/**
	 * Get current connection state as a readonly value
	 */
	get connectionState() {
		return {
			...this._state,
			isReconnecting: this.reconnectAttempts > 0,
			reconnectAttempts: this.reconnectAttempts
		};
	}

	// Private methods

	private setupChannelHandlers() {
		if (!this.channel) return;

		// Handle pot events
		this.channel.on('broadcast', { event: 'pot_event' }, (payload) => {
			this.handlePotEvent(payload.payload as PotEvent);
		});

		// Handle database changes
		this.channel.on(
			'postgres_changes',
			{ event: 'UPDATE', schema: 'public', table: 'pots' },
			(payload) => {
				this.handlePotUpdate(payload.new as Pot);
			}
		);

		this.channel.on(
			'postgres_changes',
			{ event: 'INSERT', schema: 'public', table: 'pot_entries' },
			(payload) => {
				this.handleEntryAdded(payload.new as PotEntry);
			}
		);

		// Handle presence updates (for participant count)
		this.channel.on('presence', { event: 'sync' }, () => {
			this.handlePresenceSync();
		});

		// Handle system events
		this.channel.on('system', {}, (payload) => {
			console.log('Pot system event:', payload);
		});
	}

	private handlePotEvent(event: PotEvent) {
		// Update state based on event type
		const updates: Partial<PotConnectionState> = { lastEvent: event };

		switch (event.type) {
			case 'entry_added':
				const entryData = event.data;
				updates.totalValue =
					entryData.new_total_value ||
					this._state.totalValue + (entryData.entry?.credits_spent || 0);
				break;

			case 'pot_locked':
				updates.potStatus = 'locked';
				break;

			case 'pot_settled':
				updates.potStatus = 'settled';
				break;

			case 'pot_cancelled':
				updates.potStatus = 'cancelled';
				break;
		}

		this.updateState(updates);

		// Notify all subscribers
		const callbacks = this.subscriptions.get(event.type) || [];
		callbacks.forEach((callback) => {
			try {
				callback(event);
			} catch (error) {
				console.error(`Error in pot event callback for ${event.type}:`, error);
			}
		});
	}

	private handlePotUpdate(pot: Pot) {
		const updates: Partial<PotConnectionState> = {
			potStatus: pot.status,
			totalValue: pot.total_value,
			fillPercent: pot.fill_percent || 0
		};

		this.updateState(updates);

		// Emit pot_updated event
		const event: PotEvent = {
			type: 'pot_updated',
			pot_id: pot.id,
			data: pot,
			timestamp: new Date().toISOString()
		};

		const callbacks = this.subscriptions.get('pot_updated') || [];
		callbacks.forEach((callback) => {
			try {
				callback(event);
			} catch (error) {
				console.error('Error in pot_updated callback:', error);
			}
		});
	}

	private handleEntryAdded(entry: PotEntry) {
		const updates: Partial<PotConnectionState> = {
			totalValue: this._state.totalValue + entry.credits_spent,
			participantCount: this._state.participantCount + 1
		};

		this.updateState(updates);

		// Emit entry_added event
		const event: PotEvent = {
			type: 'entry_added',
			pot_id: entry.pot_id,
			data: { entry, new_total_value: updates.totalValue },
			timestamp: new Date().toISOString()
		};

		const callbacks = this.subscriptions.get('entry_added') || [];
		callbacks.forEach((callback) => {
			try {
				callback(event);
			} catch (error) {
				console.error('Error in entry_added callback:', error);
			}
		});
	}

	private handlePresenceSync() {
		if (!this.channel) return;

		const presenceState = this.channel.presenceState();
		const spectatorCount = Object.keys(presenceState).length;

		// Could update UI with spectator count
		console.log(`Pot spectators: ${spectatorCount}`);
	}

	private handleConnected() {
		this.updateState({
			isConnected: true,
			isConnecting: false,
			error: null,
			potId: this.potId
		});
		this.reconnectAttempts = 0;
		this.reconnectDelay = 1000;

		console.log(`Connected to pot channel: ${this.potId}`);
	}

	private handleDisconnected(reason: string) {
		this.updateState({
			isConnected: false,
			isConnecting: false
		});

		console.log(`Disconnected from pot channel: ${reason}`);

		// Attempt reconnection if it wasn't intentional
		if (this.potId && reason !== 'UNSUBSCRIBED') {
			this.attemptReconnect();
		}
	}

	private handleError(error: any) {
		this.updateState({
			isConnecting: false,
			error: error?.message || 'Connection failed'
		});
		console.error('Pot connection error:', error);
	}

	private async attemptReconnect() {
		if (this.reconnectAttempts >= this.maxReconnectAttempts) {
			this._state.error = 'Failed to reconnect after multiple attempts';
			return;
		}

		this.reconnectAttempts++;

		// Exponential backoff with jitter
		const delay =
			this.reconnectDelay * Math.pow(1.5, this.reconnectAttempts - 1) + Math.random() * 1000;

		console.log(
			`Attempting to reconnect to pot (${this.reconnectAttempts}/${this.maxReconnectAttempts}) in ${delay}ms`
		);

		await new Promise((resolve) => setTimeout(resolve, delay));

		if (this.potId) {
			this.connect(this.potId);
		}
	}
}

// Singleton instance for app-wide pot realtime
let potRealtimeInstance: PotRealtimeClient | null = null;

/**
 * Get the singleton pot realtime client instance
 */
export function getPotRealtimeClient(): PotRealtimeClient {
	if (!potRealtimeInstance) {
		potRealtimeInstance = new PotRealtimeClient();
	}
	return potRealtimeInstance;
}

// Helper functions for common patterns

/**
 * Join a pot and set up standard event handlers
 */
export function joinPotChannel(potId: string) {
	if (!browser) return null;

	const client = getPotRealtimeClient();
	client.connect(potId);

	return client;
}

/**
 * Set up pot room with state management
 */
export function createPotRoom(potId: string) {
	const client = getPotRealtimeClient();

	// Pot state (simple objects for SSR compatibility)
	let pot: Partial<Pot> | null = null;
	let entries: PotEntry[] = [];

	// Computed values
	const isLoading = () => client.state.isConnecting;
	const isConnected = () => client.state.isConnected;
	const error = () => client.state.error;

	// Connect to pot
	client.connect(potId);

	// Set up event subscriptions
	const unsubscribers = [
		client.subscribe('pot_created', (event) => {
			console.log('Pot created:', event.data);
		}),

		client.subscribe('pot_updated', (event) => {
			console.log('Pot updated:', event.data);
			if (event && event.data) {
				// event.data may be a full Pot or a partial update object
				pot = event.data as Partial<Pot>;
			}
		}),

		client.subscribe('entry_added', (event) => {
			console.log('Entry added:', event.data);
		}),

		client.subscribe('pot_locked', (event) => {
			console.log('Pot locked:', event.data);
		}),

		client.subscribe('pot_settled', (event) => {
			console.log('Pot settled:', event.data);
		}),

		client.subscribe('pot_cancelled', (event) => {
			console.log('Pot cancelled:', event.data);
		})
	];

	// Return state and cleanup function
	return {
		// State
		get pot() {
			return pot;
		},
		get entries() {
			return entries;
		},
		isLoading,
		isConnected,
		error,

		// Methods
		disconnect: () => {
			unsubscribers.forEach((unsub) => unsub());
			client.disconnect();
		},

		// Access to client for custom subscriptions
		client
	};
}

// Utility functions for pot event handling

/**
 * Validate pot event structure
 */
export function validatePotEvent(event: any): event is PotEvent {
	return (
		event &&
		typeof event === 'object' &&
		typeof event.type === 'string' &&
		typeof event.pot_id === 'string' &&
		typeof event.timestamp === 'string' &&
		[
			'pot_created',
			'pot_updated',
			'entry_added',
			'pot_locked',
			'pot_settling',
			'pot_settled',
			'pot_cancelled'
		].includes(event.type)
	);
}

/**
 * Format pot event for display
 */
export function formatPotEvent(event: PotEvent): string {
	switch (event.type) {
		case 'pot_created':
			return 'New pot created!';
		case 'pot_updated':
			return 'Pot details updated';
		case 'entry_added':
			return 'Someone joined the pot!';
		case 'pot_locked':
			return 'Pot is now locked';
		case 'pot_settling':
			return 'Determining winner...';
		case 'pot_settled':
			return 'Pot has been settled!';
		case 'pot_cancelled':
			return 'Pot has been cancelled';
		default:
			return 'Pot event occurred';
	}
}
