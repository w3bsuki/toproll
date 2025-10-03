# Realtime Battle System Documentation

## Overview

The realtime battle system provides live updates for Case Battles using Supabase Realtime. It enables:

- Live battle updates in the lobby
- Real-time pull reveals during battles
- Spectator mode with live updates
- Automatic reconnection handling
- Rate limiting and performance monitoring
- Integration with the battle orchestrator

## Architecture

```
┌─────────────────┐    WebSocket Events    ┌──────────────────┐
│ Battle Frontend │ ◄────────────────────► │ Supabase Realtime│
│                 │                        │                  │
│ - Svelte 5      │                        │ - Battle Channels│
│ - Reactive UI   │                        │ - Broadcasting   │
└─────────────────┘                        └──────────────────┘
                                                    │
                                                    │ HTTP/API
                                                    ▼
┌─────────────────┐    Orchestrator Events  ┌──────────────────┐
│ Battle Orchestrator│ ◄────────────────────► │ Realtime Bridge │
│                   │                        │                  │
│ - State Machine  │                        │ - Event Broadcasting│
│ - Game Logic     │                        │ - Rate Limiting │
└─────────────────┘                        └──────────────────┘
```

## Key Components

### 1. Realtime Client (`src/lib/realtime.ts`)

The main client-side component for battle realtime functionality.

#### Key Features:

- **BattleRealtimeClient**: Core class managing WebSocket connections
- **Reactive State**: Svelte 5 `$state` for live UI updates
- **Auto-reconnection**: Exponential backoff with retry logic
- **Event Subscription**: Type-safe event handling
- **Presence Support**: Spectator counting and presence

#### Usage Example:

```typescript
import { getBattleRealtimeClient } from '$lib/realtime';

// Get singleton client
const client = getBattleRealtimeClient();

// Connect to battle
await client.connect('battle-uuid-here');

// Subscribe to events
const unsubscribe = client.subscribe('round_pull', (event) => {
	console.log('Item pulled:', event.data.item);
});

// Disconnect when done
unsubscribe();
client.disconnect();
```

### 2. Battle Room Helper

Convenient wrapper for full battle participation:

```typescript
import { createBattleRoom } from '$lib/realtime';

const room = createBattleRoom('battle-uuid-here');

// Reactive state automatically updates
// room.isConnected, room.battle, room.rounds, etc.

// Custom subscriptions
room.client.subscribe('battle_settled', (event) => {
	console.log('Battle winner:', event.data.winner_id);
});
```

### 3. Spectator Mode

Lightweight spectator interface with minimal overhead:

```typescript
import { createBattleSpectator } from '$lib/realtime';

const spectator = createBattleSpectator('battle-uuid-here');

// Essential spectator state
// spectator.isLive, spectator.currentRound, spectator.lastUpdate
```

### 4. Server-Side Bridge (`src/lib/server/realtime-battle.ts`)

Handles broadcasting events from the battle orchestrator to Supabase Realtime.

#### Key Features:

- **BattleEventBroadcaster**: Broadcasts events to battle channels
- **BattleOrchestratorRealtime**: Integrates with orchestrator events
- **Retry Logic**: Handles failed broadcasts with exponential backoff
- **Event Validation**: Ensures event data integrity

### 5. Configuration (`src/lib/config/realtime.ts`)

Centralized configuration for the realtime system.

#### Settings:

- Connection parameters and retry logic
- Rate limiting thresholds
- Performance monitoring
- Animation timings
- Battle limits and economic settings

## Supported Events

| Event                | Description                          | Data                                      |
| -------------------- | ------------------------------------ | ----------------------------------------- |
| `participant_joined` | User joined battle                   | `participant_id`, `username`, `position`  |
| `battle_locked`      | Battle starting, participants locked | `participant_ids`                         |
| `round_start`        | New round beginning                  | `round_index`, `case_id`                  |
| `round_pull`         | Individual pull result               | `participant_id`, `item`, `hash`, `nonce` |
| `round_result`       | Complete round results               | `round_index`, `pulls`, `subtotals`       |
| `battle_settled`     | Battle completed with winner         | `winner_id`, `totals`, `tie_break`        |

## Integration Guide

### Frontend Integration

1. **Basic Connection**:

```typescript
import { getBattleRealtimeClient } from '$lib/realtime';

const client = getBattleRealtimeClient();
await client.connect(battleId);
```

2. **React Battle Room**:

```typescript
import { createBattleRoom } from '$lib/realtime';

// In component setup
const room = createBattleRoom(battleId);

// Use reactive state in template
$: ({ isConnected, battle, rounds, participants, error } = room);
```

3. **Event Handling**:

```typescript
// Subscribe to specific events
const unsubPull = client.subscribe('round_pull', (event) => {
	// Update UI with pull result
	updatePullAnimation(event.data);
});

const unsubSettled = client.subscribe('battle_settled', (event) => {
	// Show winner animation
	showWinnerAnimation(event.data.winner_id);
});
```

### Backend Integration

1. **Orchestrator Setup**:
   The orchestrator automatically integrates with realtime when initialized:

```typescript
import { getOrchestrator } from '$lib/server/orchestrator/battles';

const orchestrator = getOrchestrator();
// Realtime broadcasting is automatically configured
```

2. **Manual Broadcasting**:

```typescript
import { getBattleEventBroadcaster } from '$lib/server/realtime-battle';

const broadcaster = getBattleEventBroadcaster();
await broadcaster.broadcastRoundStart(battleId, roundIndex, caseId);
```

### Battle Room Page Example

```svelte
<script lang="ts">
	import { onMount } from 'svelte';
	import { createBattleRoom } from '$lib/realtime';

	let { battleId } = $props();

	const room = createBattleRoom(battleId);

	onMount(() => {
		// Auto-connect when component mounts
	});
</script>

{#if room.isLoading}
	<div>Connecting to battle...</div>
{:else if room.error}
	<div>Error: {room.error}</div>
{:else if !room.isConnected}
	<div>Disconnected from battle</div>
{:else}
	<!-- Battle UI -->
	<div>Battle Round: {room.client.state.currentRound + 1}</div>

	{#each room.participants as participant}
		<div>{participant.user?.username}</div>
	{/each}

	<!-- Round results -->
	{#each room.rounds as round}
		<div>Round {round.round_index + 1}</div>
	{/each}
{/if}
```

## Performance Considerations

### Rate Limiting

- Events are rate-limited to 10 events per second per battle
- Automatic throttling prevents spam and protects infrastructure
- Rate limit status can be monitored via `getEventRateLimiter()`

### Connection Management

- Automatic reconnection with exponential backoff
- Maximum 5 reconnection attempts before giving up
- 30-second heartbeat to detect connection issues
- Graceful cleanup on component unmount

### Spectator Optimization

- Spectator mode subscribes to minimal events
- Reduced bandwidth usage for passive viewers
- Presence tracking for spectator counts

### Error Handling

- Comprehensive error logging and recovery
- Failed broadcasts are retried with exponential backoff
- Client-side error states for UI feedback

## Monitoring and Debugging

### Performance Monitoring

Enable performance monitoring in development:

```typescript
// In src/lib/config/realtime.ts
export const REALTIME_CONFIG = {
	// ...
	ENABLE_PERFORMANCE_MONITORING: true,
	ENABLE_DEBUG_LOGGING: true
};
```

### Debug Logging

Realtime events are logged with structured data:

```typescript
// Console output example
[2025-01-03T10:30:45.123Z] Battle abc-123: Round 1 started (Case: case-456)
[2025-01-03T10:30:46.456Z] Battle abc-123: user-789 pulled AK-47 | Redline
```

### Event Validation

All events are validated before broadcasting:

```typescript
// Automatic validation
if (!validateBattleEventData(eventType, data)) {
	console.error('Invalid event data for', eventType);
	return;
}
```

## Security Considerations

### Authentication

- Battle channels are protected by Supabase RLS policies
- Only authenticated users can join battle channels
- Participant actions are validated server-side

### Data Validation

- All event data is validated before broadcasting
- Type safety through TypeScript interfaces
- Sanitization of user-generated content

### Rate Limiting

- Prevents abuse and DoS attacks
- Per-battle rate limiting isolates issues
- Automatic throttling protects infrastructure

## Troubleshooting

### Common Issues

1. **Connection Fails**:
   - Check Supabase credentials
   - Verify network connectivity
   - Check browser console for errors

2. **Events Not Received**:
   - Verify battle ID is correct
   - Check if connected to right channel
   - Monitor rate limiting status

3. **Performance Issues**:
   - Reduce event frequency
   - Enable spectator mode for passive viewing
   - Monitor performance metrics

4. **Reconnection Issues**:
   - Check exponential backoff settings
   - Verify network stability
   - Monitor reconnection attempts

### Debug Commands

```typescript
// Get connection state
const state = client.connectionState;
console.log('Connection state:', state);

// Get rate limit status
const limiter = getEventRateLimiter();
const status = limiter.getStatus(battleId);
console.log('Rate limit:', status);

// Get performance metrics
const monitor = getPerformanceMonitor();
const metrics = monitor.getMetrics();
console.log('Performance:', metrics);
```

## Migration from Existing System

If migrating from an existing battle system:

1. **Replace WebSocket calls** with the new client
2. **Update event handlers** to use the new subscription model
3. **Add reactive state** using Svelte 5 patterns
4. **Configure rate limiting** to prevent abuse
5. **Add error handling** for connection issues

### Example Migration

**Before:**

```typescript
const ws = new WebSocket('ws://localhost:3000/battles/' + battleId);
ws.onmessage = (event) => {
	const data = JSON.parse(event.data);
	// Handle different event types manually
};
```

**After:**

```typescript
const client = getBattleRealtimeClient();
await client.connect(battleId);

client.subscribe('round_pull', (event) => {
	// Type-safe event handling
	handlePullResult(event.data);
});
```

## Future Enhancements

Planned improvements to the realtime system:

1. **Chat Integration**: Real-time battle chat
2. **Tournament Support**: Multi-battle tournaments
3. **Advanced Spectating**: Multiple camera angles, replays
4. **Mobile Optimization**: Reduced bandwidth for mobile
5. **Analytics Integration**: Event tracking for insights
6. **WebRTC Support**: Low-latency video streaming

## Support

For issues or questions about the realtime battle system:

1. Check console logs for error messages
2. Verify Supabase configuration
3. Review rate limiting status
4. Monitor performance metrics
5. Consult this documentation for common patterns
