// Realtime configuration for Case Battles system
import type { BattleConfig } from '$lib/types';

/**
 * Realtime battle configuration
 */
export const REALTIME_CONFIG = {
  // Connection settings
  MAX_RECONNECT_ATTEMPTS: 5,
  INITIAL_RECONNECT_DELAY: 1000, // 1 second
  MAX_RECONNECT_DELAY: 30000, // 30 seconds
  HEARTBEAT_INTERVAL: 30000, // 30 seconds
  CONNECTION_TIMEOUT: 10000, // 10 seconds

  // Event broadcasting
  BROADCAST_RETRY_ATTEMPTS: 3,
  BROADCAST_RETRY_DELAY: 1000, // 1 second
  EVENT_RATE_LIMIT: 10, // Max events per second per battle
  EVENT_BATCH_SIZE: 10, // Max events to batch together

  // Supabase realtime settings
  REALTIME_EVENTS_PER_SECOND: 5, // Supabase limit
  CHANNEL_BUFFER_SIZE: 100, // Max events to buffer

  // Spectator limits
  MAX_SPECTATORS_PER_BATTLE: 1000,
  SPECTATOR_TIMEOUT: 300000, // 5 minutes

  // Performance settings
  ANIMATION_DURATION: {
    ROUND_START: 2000, // 2 seconds
    PULL_REVEAL: 1500, // 1.5 seconds per pull
    ROUND_COMPLETE: 1000, // 1 second
    BATTLE_COMPLETE: 3000 // 3 seconds
  },

  // Battle limits
  MAX_PARTICIPANTS: 6,
  MAX_ROUNDS: 10,
  MIN_ROUNDS: 1,

  // Debug settings
  ENABLE_DEBUG_LOGGING: false,
  ENABLE_PERFORMANCE_MONITORING: false
} as const;

/**
 * Battle configuration with economic limits
 */
export const BATTLE_CONFIG: BattleConfig = {
  max_battle_pot: 10000, // $10,000 max pot
  max_daily_loss: 500, // $500 daily loss limit per user
  max_daily_wager: 2000, // $2,000 daily wager limit per user
  case_markup_percentage: 8, // 8% markup on case prices
  mode_rake_percentage: 0 // 0% rake for MVP
};

/**
 * Provably fair configuration
 */
export const PROVABLY_FAIR_CONFIG = {
  SEED_ROTATION_HOURS: 24, // Rotate server seeds every 24 hours
  REVEAL_BUFFER_MINUTES: 15, // Reveal seeds 15 minutes after rotation
  MAX_NONCES_PER_SEED: 10000, // Maximum nonces per server seed
  HASH_ALGORITHM: 'SHA-256' as const,
  HMAC_ALGORITHM: 'HMAC-SHA256' as const
};

/**
 * Battle event rate limiting
 */
export class BattleEventRateLimiter {
  private events: Map<string, number[]> = new Map();
  private readonly windowMs: number;
  private readonly maxEvents: number;

  constructor(windowMs: number = 1000, maxEvents: number = REALTIME_CONFIG.EVENT_RATE_LIMIT) {
    this.windowMs = windowMs;
    this.maxEvents = maxEvents;

    // Clean up old events periodically
    setInterval(() => this.cleanup(), this.windowMs);
  }

  /**
   * Check if an event is allowed for a battle
   */
  isAllowed(battleId: string): boolean {
    const now = Date.now();
    const battleEvents = this.events.get(battleId) || [];

    // Filter events within the time window
    const recentEvents = battleEvents.filter(timestamp => now - timestamp < this.windowMs);

    if (recentEvents.length >= this.maxEvents) {
      return false;
    }

    // Add current event
    recentEvents.push(now);
    this.events.set(battleId, recentEvents);
    return true;
  }

  /**
   * Get current rate limit status for a battle
   */
  getStatus(battleId: string): { current: number; remaining: number; resetTime: number } {
    const now = Date.now();
    const battleEvents = this.events.get(battleId) || [];
    const recentEvents = battleEvents.filter(timestamp => now - timestamp < this.windowMs);

    return {
      current: recentEvents.length,
      remaining: Math.max(0, this.maxEvents - recentEvents.length),
      resetTime: Math.max(...recentEvents, now) + this.windowMs
    };
  }

  /**
   * Clean up old events
   */
  private cleanup(): void {
    const now = Date.now();
    const cutoff = now - this.windowMs;

    for (const [battleId, events] of this.events.entries()) {
      const recentEvents = events.filter(timestamp => timestamp > cutoff);
      if (recentEvents.length === 0) {
        this.events.delete(battleId);
      } else {
        this.events.set(battleId, recentEvents);
      }
    }
  }
}

/**
 * Realtime performance monitor
 */
export class RealtimePerformanceMonitor {
  private metrics: {
    connectionLatency: number[];
    eventProcessingTime: number[];
    broadcastLatency: number[];
    reconnectionCount: number;
    totalEvents: number;
    failedEvents: number;
  } = {
    connectionLatency: [],
    eventProcessingTime: [],
    broadcastLatency: [],
    reconnectionCount: 0,
    totalEvents: 0,
    failedEvents: 0
  };

  /**
   * Record connection latency
   */
  recordConnectionLatency(latency: number): void {
    this.metrics.connectionLatency.push(latency);
    this.trimMetrics(this.metrics.connectionLatency);
  }

  /**
   * Record event processing time
   */
  recordEventProcessingTime(time: number): void {
    this.metrics.eventProcessingTime.push(time);
    this.trimMetrics(this.metrics.eventProcessingTime);
    this.metrics.totalEvents++;
  }

  /**
   * Record broadcast latency
   */
  recordBroadcastLatency(latency: number): void {
    this.metrics.broadcastLatency.push(latency);
    this.trimMetrics(this.metrics.broadcastLatency);
  }

  /**
   * Record reconnection
   */
  recordReconnection(): void {
    this.metrics.reconnectionCount++;
  }

  /**
   * Record failed event
   */
  recordFailedEvent(): void {
    this.metrics.failedEvents++;
  }

  /**
   * Get performance metrics
   */
  getMetrics() {
    const avg = (arr: number[]) => arr.length > 0 ? arr.reduce((a, b) => a + b) / arr.length : 0;
    const p95 = (arr: number[]) => {
      if (arr.length === 0) return 0;
      const sorted = [...arr].sort((a, b) => a - b);
      const index = Math.floor(sorted.length * 0.95);
      return sorted[Math.min(index, sorted.length - 1)];
    };

    return {
      avgConnectionLatency: avg(this.metrics.connectionLatency),
      p95ConnectionLatency: p95(this.metrics.connectionLatency),
      avgEventProcessingTime: avg(this.metrics.eventProcessingTime),
      p95EventProcessingTime: p95(this.metrics.eventProcessingTime),
      avgBroadcastLatency: avg(this.metrics.broadcastLatency),
      p95BroadcastLatency: p95(this.metrics.broadcastLatency),
      reconnectionCount: this.metrics.reconnectionCount,
      totalEvents: this.metrics.totalEvents,
      failedEvents: this.metrics.failedEvents,
      successRate: this.metrics.totalEvents > 0
        ? ((this.metrics.totalEvents - this.metrics.failedEvents) / this.metrics.totalEvents) * 100
        : 100
    };
  }

  /**
   * Keep metrics array size manageable
   */
  private trimMetrics(arr: number[]): void {
    if (arr.length > 1000) {
      arr.splice(0, arr.length - 1000);
    }
  }
}

/**
 * Singleton instances
 */
let eventRateLimiter: BattleEventRateLimiter | null = null;
let performanceMonitor: RealtimePerformanceMonitor | null = null;

/**
 * Get the event rate limiter instance
 */
export function getEventRateLimiter(): BattleEventRateLimiter {
  if (!eventRateLimiter) {
    eventRateLimiter = new BattleEventRateLimiter();
  }
  return eventRateLimiter;
}

/**
 * Get the performance monitor instance
 */
export function getPerformanceMonitor(): RealtimePerformanceMonitor {
  if (!performanceMonitor && REALTIME_CONFIG.ENABLE_PERFORMANCE_MONITORING) {
    performanceMonitor = new RealtimePerformanceMonitor();
  }
  return performanceMonitor!;
}

/**
 * Environment-specific configuration
 */
export function getRealtimeConfig() {
  const isDev = import.meta.env.DEV;

  return {
    ...REALTIME_CONFIG,
    ENABLE_DEBUG_LOGGING: isDev || REALTIME_CONFIG.ENABLE_DEBUG_LOGGING,
    ENABLE_PERFORMANCE_MONITORING: isDev || REALTIME_CONFIG.ENABLE_PERFORMANCE_MONITORING,
    REALTIME_EVENTS_PER_SECOND: isDev ? 10 : REALTIME_CONFIG.REALTIME_EVENTS_PER_SECOND
  };
}

/**
 * Validate battle configuration
 */
export function validateBattleConfig(config: Partial<BattleConfig>): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (config.max_battle_pot !== undefined && config.max_battle_pot <= 0) {
    errors.push('max_battle_pot must be greater than 0');
  }

  if (config.max_daily_loss !== undefined && config.max_daily_loss <= 0) {
    errors.push('max_daily_loss must be greater than 0');
  }

  if (config.max_daily_wager !== undefined && config.max_daily_wager <= 0) {
    errors.push('max_daily_wager must be greater than 0');
  }

  if (config.case_markup_percentage !== undefined &&
      (config.case_markup_percentage < 0 || config.case_markup_percentage > 50)) {
    errors.push('case_markup_percentage must be between 0 and 50');
  }

  if (config.mode_rake_percentage !== undefined &&
      (config.mode_rake_percentage < 0 || config.mode_rake_percentage > 10)) {
    errors.push('mode_rake_percentage must be between 0 and 10');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Calculate battle entry fee with markup
 */
export function calculateEntryFee(casePrice: number, markupPercentage: number): number {
  return casePrice * (1 + markupPercentage / 100);
}

/**
 * Calculate battle rake amount
 */
export function calculateBattleRake(totalPot: number, rakePercentage: number): number {
  return totalPot * (rakePercentage / 100);
}

/**
 * Get battle animation duration based on event type
 */
export function getAnimationDuration(eventType: 'round_start' | 'pull_reveal' | 'round_complete' | 'battle_complete'): number {
  return REALTIME_CONFIG.ANIMATION_DURATION[eventType];
}

/**
 * Validate battle event data for realtime events
 */
export function validateBattleEventData(eventType: string, data: any): { valid: boolean; error?: string } {
  if (!data || typeof data !== 'object') {
    return { valid: false, error: 'Event data must be an object' };
  }

  if (!data.battle_id || typeof data.battle_id !== 'string') {
    return { valid: false, error: 'battle_id is required and must be a string' };
  }

  // Validate specific event types
  switch (eventType) {
    case 'round_start':
      if (!data.round_number || typeof data.round_number !== 'number') {
        return { valid: false, error: 'round_number is required for round_start events' };
      }
      break;

    case 'pull_reveal':
      if (!data.participant_id || typeof data.participant_id !== 'string') {
        return { valid: false, error: 'participant_id is required for pull_reveal events' };
      }
      if (!data.pull_data || typeof data.pull_data !== 'object') {
        return { valid: false, error: 'pull_data is required for pull_reveal events' };
      }
      break;

    case 'battle_settled':
      if (!data.winners || !Array.isArray(data.winners)) {
        return { valid: false, error: 'winners array is required for battle_settled events' };
      }
      break;
  }

  return { valid: true };
}