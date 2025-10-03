// Realtime battle system for Case Battles
import { browser } from '$app/environment';
import { getSupabaseClient } from '$lib/supabase/client';
import type {
  Battle,
  BattleEvent,
  BattleRound,
  BattlePull,
  BattleParticipant,
  RoundStartEvent,
  RoundPullEvent,
  RoundResultEvent,
  BattleSettledEvent
} from '$lib/types';

// Battle connection state
export interface BattleConnectionState {
  battleId: string | null;
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  lastEvent: BattleEvent | null;
  participantIds: Set<string>;
  currentRound: number;
  battleStatus: Battle['status'];
}

// Realtime battle client class
export class BattleRealtimeClient {
  private supabase = getSupabaseClient();
  private channel: ReturnType<typeof this.supabase.channel> | null = null;
  private battleId: string | null = null;
  private subscriptions: Map<string, ((event: BattleEvent) => void)[]> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000; // Start with 1 second
  private heartbeatInterval: NodeJS.Timeout | null = null;

  // Simple state object (non-reactive for SSR compatibility)
  private _state: BattleConnectionState = {
    battleId: null,
    isConnected: false,
    isConnecting: false,
    error: null,
    lastEvent: null,
    participantIds: new Set(),
    currentRound: 0,
    battleStatus: 'waiting'
  };

  // Public getter for state
  get state(): BattleConnectionState {
    return this._state;
  }

  // Update state method
  private updateState(updates: Partial<BattleConnectionState>) {
    this._state = { ...this._state, ...updates };
  }

  constructor() {
    // Auto-cleanup on page unload
    if (browser) {
      window.addEventListener('beforeunload', () => this.disconnect());
    }
  }

  /**
   * Connect to a battle channel
   */
  async connect(battleId: string): Promise<boolean> {
    if (!browser || !battleId) return false;

    if (this._state.isConnected && this.battleId === battleId) {
      return true; // Already connected
    }

    this.disconnect(); // Clean up existing connection

    this.updateState({ isConnecting: true, error: null });
    this.battleId = battleId;

    try {
      const channelName = `battles:${battleId}`;
      this.channel = this.supabase.channel(channelName, {
        config: {
          broadcast: { self: true },
          presence: { key: `user_${Date.now()}` }
        }
      });

      // Set up channel event handlers
      this.setupChannelHandlers();

      // Subscribe to the channel
      const subscription = await this.channel.subscribe((status) => {
        console.log(`Battle channel ${channelName} status:`, status);

        if (status === 'SUBSCRIBED') {
          this.handleConnected();
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') {
          this.handleDisconnected(status);
        }
      });

      return subscription === 'SUBSCRIBED';
    } catch (error) {
      this.handleError(error);
      return false;
    }
  }

  /**
   * Disconnect from current battle channel
   */
  disconnect() {
    if (this.channel) {
      this.channel.unsubscribe();
      this.channel = null;
    }

    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }

    this.battleId = null;
    this.updateState({
      isConnected: false,
      isConnecting: false,
      error: null,
      participantIds: new Set(),
      battleId: null
    });
  }

  /**
   * Subscribe to specific battle events
   */
  subscribe(eventType: BattleEvent['type'], callback: (event: BattleEvent) => void): () => void {
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
   * Emit an event to the battle channel (for testing/admin)
   */
  async emit(event: BattleEvent): Promise<boolean> {
    if (!this.channel || !this._state.isConnected) {
      return false;
    }

    try {
      await this.channel.send({
        type: 'broadcast',
        event: 'battle_event',
        payload: event
      });
      return true;
    } catch (error) {
      console.error('Failed to emit battle event:', error);
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

    // Handle battle events
    this.channel.on('broadcast', { event: 'battle_event' }, (payload) => {
      this.handleBattleEvent(payload.payload as BattleEvent);
    });

    // Handle presence updates (for spectator count, etc.)
    this.channel.on('presence', { event: 'sync' }, () => {
      this.handlePresenceSync();
    });

    // Handle system events
    this.channel.on('system', {}, (payload) => {
      console.log('Battle system event:', payload);
    });
  }

  private handleBattleEvent(event: BattleEvent) {
    // Update state based on event type
    const updates: Partial<BattleConnectionState> = { lastEvent: event };

    switch (event.type) {
      case 'participant_joined':
        const newParticipantIds = new Set(this._state.participantIds);
        newParticipantIds.add(event.data.participant_id);
        updates.participantIds = newParticipantIds;
        break;

      case 'battle_locked':
        updates.battleStatus = 'in_progress';
        break;

      case 'round_start':
        updates.currentRound = event.data.round_index;
        break;

      case 'battle_settled':
        updates.battleStatus = 'completed';
        break;
    }

    this.updateState(updates);

    // Notify all subscribers
    const callbacks = this.subscriptions.get(event.type) || [];
    callbacks.forEach(callback => {
      try {
        callback(event);
      } catch (error) {
        console.error(`Error in battle event callback for ${event.type}:`, error);
      }
    });
  }

  private handlePresenceSync() {
    if (!this.channel) return;

    const presenceState = this.channel.presenceState();
    const spectatorCount = Object.keys(presenceState).length;

    // Could update UI with spectator count
    console.log(`Battle spectators: ${spectatorCount}`);
  }

  private handleConnected() {
    this.updateState({
      isConnected: true,
      isConnecting: false,
      error: null,
      battleId: this.battleId
    });
    this.reconnectAttempts = 0;
    this.reconnectDelay = 1000;

    // Start heartbeat to detect connection issues
    this.startHeartbeat();

    console.log(`Connected to battle channel: ${this.battleId}`);
  }

  private handleDisconnected(reason: string) {
    this.updateState({
      isConnected: false,
      isConnecting: false
    });

    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }

    console.log(`Disconnected from battle channel: ${reason}`);

    // Attempt reconnection if it wasn't intentional
    if (this.battleId && reason !== 'UNSUBSCRIBED') {
      this.attemptReconnect();
    }
  }

  private handleError(error: any) {
    this.updateState({
      isConnecting: false,
      error: error?.message || 'Connection failed'
    });
    console.error('Battle connection error:', error);
  }

  private startHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }

    this.heartbeatInterval = setInterval(() => {
      if (this.channel && this.state.isConnected) {
        // Send ping to keep connection alive
        this.channel.send({
          type: 'heartbeat',
          timestamp: Date.now()
        });
      }
    }, 30000); // 30 seconds
  }

  private async attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      this.state.error = 'Failed to reconnect after multiple attempts';
      return;
    }

    this.reconnectAttempts++;

    // Exponential backoff with jitter
    const delay = this.reconnectDelay * Math.pow(1.5, this.reconnectAttempts - 1) +
                  Math.random() * 1000;

    console.log(`Attempting to reconnect to battle (${this.reconnectAttempts}/${this.maxReconnectAttempts}) in ${delay}ms`);

    await new Promise(resolve => setTimeout(resolve, delay));

    if (this.battleId) {
      this.connect(this.battleId);
    }
  }
}

// Singleton instance for app-wide battle realtime
let battleRealtimeInstance: BattleRealtimeClient | null = null;

/**
 * Get the singleton battle realtime client instance
 */
export function getBattleRealtimeClient(): BattleRealtimeClient {
  if (!battleRealtimeInstance) {
    battleRealtimeInstance = new BattleRealtimeClient();
  }
  return battleRealtimeInstance;
}

// Helper functions for common patterns

/**
 * Join a battle and set up standard event handlers
 */
export function joinBattleChannel(battleId: string) {
  if (!browser) return null;

  const client = getBattleRealtimeClient();
  client.connect(battleId);

  return client;
}

/**
 * Set up battle room with state management
 */
export function createBattleRoom(battleId: string) {
  const client = getBattleRealtimeClient();

  // Battle state (simple objects for SSR compatibility)
  let battle: Partial<Battle> | null = null;
  let rounds: BattleRound[] = [];
  let pulls: Map<string, BattlePull[]> = new Map();
  let participants: BattleParticipant[] = [];

  // Computed values
  const isLoading = () => client.state.isConnecting;
  const isConnected = () => client.state.isConnected;
  const error = () => client.state.error;

  // Connect to battle
  client.connect(battleId);

  // Set up event subscriptions
  const unsubscribers = [
    client.subscribe('participant_joined', (event) => {
      // Update participants list
      console.log('Participant joined:', event.data);
    }),

    client.subscribe('battle_locked', (event) => {
      // Battle is starting
      console.log('Battle locked:', event.data);
    }),

    client.subscribe('round_start', (event) => {
      // New round starting
      console.log('Round started:', event.data);
    }),

    client.subscribe('round_pull', (event) => {
      // Individual pull result
      console.log('Round pull:', event.data);
    }),

    client.subscribe('round_result', (event) => {
      // Complete round results
      console.log('Round result:', event.data);
    }),

    client.subscribe('battle_settled', (event) => {
      // Battle completed
      console.log('Battle settled:', event.data);
    })
  ];

  // Return state and cleanup function
  return {
    // State
    get battle() { return battle; },
    get rounds() { return rounds; },
    get pulls() { return pulls; },
    get participants() { return participants; },
    isLoading,
    isConnected,
    error,

    // Methods
    disconnect: () => {
      unsubscribers.forEach(unsub => unsub());
      client.disconnect();
    },

    // Access to client for custom subscriptions
    client
  };
}

/**
 * Create a battle spectator view with minimal overhead
 */
export function createBattleSpectator(battleId: string) {
  const client = getBattleRealtimeClient();

  // Minimal spectator state
  let spectatorCount = 0;
  let lastUpdate: Date | null = null;

  // Computed values
  const isLive = () => client.state.isConnected;
  const currentRound = () => client.state.currentRound;

  client.connect(battleId);

  // Only subscribe to essential events for spectating
  const unsubscribers = [
    client.subscribe('round_start', () => {
      lastUpdate = new Date();
    }),

    client.subscribe('round_result', () => {
      lastUpdate = new Date();
    }),

    client.subscribe('battle_settled', () => {
      lastUpdate = new Date();
    })
  ];

  return {
    get isLive() { return isLive(); },
    get currentRound() { return currentRound(); },
    get spectatorCount() { return spectatorCount; },
    get lastUpdate() { return lastUpdate; },
    disconnect: () => {
      unsubscribers.forEach(unsub => unsub());
      client.disconnect();
    }
  };
}

// Utility functions for battle event handling

/**
 * Validate battle event structure
 */
export function validateBattleEvent(event: any): event is BattleEvent {
  return (
    event &&
    typeof event === 'object' &&
    typeof event.type === 'string' &&
    typeof event.battle_id === 'string' &&
    typeof event.timestamp === 'string' &&
    ['participant_joined', 'participant_left', 'battle_locked', 'round_start', 'round_pull', 'round_result', 'battle_settled'].includes(event.type)
  );
}

/**
 * Format battle event for display
 */
export function formatBattleEvent(event: BattleEvent): string {
  switch (event.type) {
    case 'participant_joined':
      return `Player joined the battle`;
    case 'battle_locked':
      return `Battle is starting!`;
    case 'round_start':
      return `Round ${event.data.round_index + 1} started`;
    case 'round_pull':
      return `${event.data.item.name} pulled!`;
    case 'round_result':
      return `Round ${event.data.round_index + 1} complete`;
    case 'battle_settled':
      return `Battle completed! Winner: ${event.data.winner_id || 'Unknown'}`;
    default:
      return 'Battle event occurred';
  }
}

// Export types for external use
export type { BattleConnectionState, BattleRealtimeClient };

