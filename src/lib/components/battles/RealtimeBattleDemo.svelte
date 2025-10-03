<!-- Realtime Battle Demo Component -->
<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { getBattleRealtimeClient, createBattleRoom, createBattleSpectator } from '$lib/realtime';
  import { formatBattleEvent } from '$lib/realtime';
  import type { BattleEvent, Battle } from '$lib/types';

  // Props
  let { battleId, mode = 'participant' }: { battleId: string; mode?: 'participant' | 'spectator' } = $props();

  // Reactive state
  let isConnected = $state(false);
  let isLoading = $state(false);
  let error = $state<string | null>(null);
  let battleEvents = $state<BattleEvent[]>([]);
  let currentBattle = $state<Partial<Battle> | null>(null);
  let currentRound = $state(0);
  let lastUpdate = $state<Date | null>(null);

  // Realtime client
  let realtimeClient: ReturnType<typeof getBattleRealtimeClient> | null = null;
  let cleanup: (() => void) | null = null;

  onMount(() => {
    initRealtime();
  });

  onDestroy(() => {
    if (cleanup) {
      cleanup();
    }
  });

  function initRealtime() {
    if (!battleId) return;

    isLoading = true;
    error = null;

    try {
      if (mode === 'participant') {
        // Full battle room for participants
        const room = createBattleRoom(battleId);

        // Set up reactive bindings
        $effect(() => {
          isConnected = room.isConnected();
          isLoading = room.isLoading();
          error = room.error();
          currentBattle = room.battle;
          currentRound = room.client.state.currentRound;
        });

        // Custom event subscriptions
        const unsubscribers = [
          room.client.subscribe('participant_joined', (event) => {
            addBattleEvent(event);
          }),

          room.client.subscribe('battle_locked', (event) => {
            addBattleEvent(event);
          }),

          room.client.subscribe('round_start', (event) => {
            addBattleEvent(event);
          }),

          room.client.subscribe('round_pull', (event) => {
            addBattleEvent(event);
          }),

          room.client.subscribe('round_result', (event) => {
            addBattleEvent(event);
          }),

          room.client.subscribe('battle_settled', (event) => {
            addBattleEvent(event);
          })
        ];

        cleanup = () => {
          unsubscribers.forEach(unsub => unsub());
          room.disconnect();
        };

      } else {
        // Spectator mode - minimal overhead
        const spectator = createBattleSpectator(battleId);

        $effect(() => {
          isConnected = spectator.isLive;
          currentRound = spectator.currentRound;
          lastUpdate = spectator.lastUpdate;
        });

        cleanup = () => {
          spectator.disconnect();
        };
      }

    } catch (err) {
      error = err instanceof Error ? err.message : 'Failed to initialize realtime';
      isLoading = false;
    }
  }

  function addBattleEvent(event: BattleEvent) {
    battleEvents = [...battleEvents.slice(-49), event]; // Keep last 50 events
    lastUpdate = new Date();
    isLoading = false;
  }

  function getEventIcon(eventType: BattleEvent['type']) {
    switch (eventType) {
      case 'participant_joined': return '👤';
      case 'battle_locked': return '🔒';
      case 'round_start': return '🎲';
      case 'round_pull': return '🎁';
      case 'round_result': return '✅';
      case 'battle_settled': return '🏆';
      default: return '📡';
    }
  }

  function getEventColor(eventType: BattleEvent['type']) {
    switch (eventType) {
      case 'participant_joined': return 'text-blue-600';
      case 'battle_locked': return 'text-yellow-600';
      case 'round_start': return 'text-purple-600';
      case 'round_pull': return 'text-green-600';
      case 'round_result': return 'text-indigo-600';
      case 'battle_settled': return 'text-yellow-500';
      default: return 'text-gray-600';
    }
  }

  // Simulate connection status changes for demo
  function toggleConnection() {
    if (isConnected) {
      cleanup?.();
      isConnected = false;
    } else {
      initRealtime();
    }
  }

  // Simulate receiving a battle event (for demo purposes)
  function simulateEvent() {
    const mockEvent: BattleEvent = {
      type: 'round_pull',
      battle_id: battleId,
      timestamp: new Date().toISOString(),
      data: {
        participant_id: 'demo-participant',
        item: {
          id: 'demo-item',
          name: 'AK-47 | Redline',
          market_name: 'AK-47 | Redline (Field-Tested)',
          image_url: '',
          rarity: 'Rare',
          market_value: 125.50
        },
        hash: 'demo-hash',
        nonce: 42,
        client_seed: 'demo-seed'
      }
    };

    addBattleEvent(mockEvent);
  }
</script>

<div class="realtime-battle-demo p-6 bg-white rounded-lg shadow-lg max-w-2xl mx-auto">
  <!-- Header -->
  <div class="flex items-center justify-between mb-6">
    <div>
      <h2 class="text-2xl font-bold text-gray-900">
        Realtime Battle {mode === 'spectator' ? 'Spectator' : 'Participant'}
      </h2>
      <p class="text-sm text-gray-600">Battle ID: {battleId}</p>
    </div>

    <!-- Connection Status -->
    <div class="flex items-center space-x-4">
      <div class="flex items-center space-x-2">
        <div class={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
        <span class="text-sm font-medium">
          {isConnected ? 'Connected' : 'Disconnected'}
        </span>
      </div>

      {#if mode === 'participant'}
        <div class="flex items-center space-x-2">
          <span class="text-sm text-gray-600">Round:</span>
          <span class="text-sm font-bold">{currentRound + 1}</span>
        </div>
      {/if}
    </div>
  </div>

  <!-- Loading/Error States -->
  {#if isLoading}
    <div class="flex items-center justify-center py-8">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      <span class="ml-2 text-gray-600">Connecting to battle...</span>
    </div>
  {:else if error}
    <div class="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
      <div class="flex items-center">
        <div class="text-red-500 mr-2">⚠️</div>
        <div>
          <h3 class="text-sm font-medium text-red-800">Connection Error</h3>
          <p class="text-sm text-red-700">{error}</p>
        </div>
      </div>
    </div>
  {/if}

  <!-- Battle Info -->
  {#if currentBattle}
    <div class="bg-gray-50 rounded-lg p-4 mb-6">
      <h3 class="text-lg font-semibold mb-2">Battle Details</h3>
      <div class="grid grid-cols-2 gap-4 text-sm">
        <div>
          <span class="text-gray-600">Status:</span>
          <span class="ml-2 font-medium">{currentBattle.status}</span>
        </div>
        <div>
          <span class="text-gray-600">Mode:</span>
          <span class="ml-2 font-medium">{currentBattle.mode}</span>
        </div>
        <div>
          <span class="text-gray-600">Participants:</span>
          <span class="ml-2 font-medium">{currentBattle.current_participants}/{currentBattle.max_participants}</span>
        </div>
        <div>
          <span class="text-gray-600">Pot:</span>
          <span class="ml-2 font-medium">${currentBattle.total_pot?.toFixed(2) || '0.00'}</span>
        </div>
      </div>
    </div>
  {/if}

  <!-- Battle Events Feed -->
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <h3 class="text-lg font-semibold">Live Events</h3>
      {#if lastUpdate}
        <span class="text-xs text-gray-500">
          Last update: {lastUpdate.toLocaleTimeString()}
        </span>
      {/if}
    </div>

    {#if battleEvents.length === 0}
      <div class="text-center py-8 text-gray-500">
        <div class="text-4xl mb-2">⏳</div>
        <p>Waiting for battle events...</p>
      </div>
    {:else}
      <div class="space-y-2 max-h-96 overflow-y-auto">
        {#each battleEvents.slice().reverse() as event (event.timestamp)}
          <div class="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
            <span class="text-xl">{getEventIcon(event.type)}</span>
            <div class="flex-1 min-w-0">
              <div class="flex items-center justify-between">
                <p class="text-sm font-medium text-gray-900">
                  {formatBattleEvent(event)}
                </p>
                <span class="text-xs text-gray-500">
                  {new Date(event.timestamp).toLocaleTimeString()}
                </span>
              </div>

              {#if event.type === 'round_pull' && event.data.item}
                <div class="mt-1 text-xs text-gray-600">
                  {event.data.item.name} (${event.data.item.market_value?.toFixed(2) || '0.00'})
                </div>
              {/if}
            </div>
          </div>
        {/each}
      </div>
    {/if}
  </div>

  <!-- Demo Controls (remove in production) -->
  {#if import.meta.env.DEV}
    <div class="mt-6 pt-6 border-t border-gray-200">
      <h3 class="text-sm font-semibold text-gray-900 mb-3">Demo Controls (Dev Only)</h3>
      <div class="flex space-x-3">
        <button
          onclick={toggleConnection}
          class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
        >
          {isConnected ? 'Disconnect' : 'Connect'}
        </button>

        <button
          onclick={simulateEvent}
          class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
          disabled={!isConnected}
        >
          Simulate Event
        </button>

        <button
          onclick={() => battleEvents = []}
          class="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
        >
          Clear Events
        </button>
      </div>
    </div>
  {/if}

  <!-- Spectator-specific info -->
  {#if mode === 'spectator' && lastUpdate}
    <div class="mt-4 p-3 bg-blue-50 rounded-lg">
      <div class="flex items-center text-sm text-blue-800">
        <span class="mr-2">👁️</span>
        <span>Spectating live - Round {currentRound + 1}</span>
      </div>
    </div>
  {/if}
</div>

<style>
  .realtime-battle-demo {
    font-family: system-ui, -apple-system, sans-serif;
  }
</style>