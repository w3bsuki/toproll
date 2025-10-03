/**
 * Battle Limits and Constraints Configuration
 *
 * This file defines all limits, constraints, and validation rules
 * for the Case Battles system to ensure responsible gaming and
 * prevent abuse while maintaining good user experience.
 */

// Basic monetary limits (in credits)
export const MONETARY_LIMITS = {
  MAX_BATTLE_POT: 5000,           // Maximum total value of items in a single battle
  MAX_CASE_PRICE: 1000,           // Maximum price for an individual case
  MIN_CASE_PRICE: 10,             // Minimum price for an individual case
  USER_DAILY_LOSS: 10000,         // Maximum loss per user per day
  USER_DAILY_WAGER: 25000,        // Maximum total wager per user per day
  USER_WEEKLY_LOSS: 50000,        // Maximum loss per user per week
  USER_MONTHLY_LOSS: 150000,      // Maximum loss per user per month
  MAX_CONCURRENT_BATTLES: 5,      // Maximum concurrent battles per user
} as const;

// Battle configuration limits
export const BATTLE_LIMITS = {
  MAX_PARTICIPANTS: 6,            // Maximum participants in any battle
  MIN_PARTICIPANTS: 2,            // Minimum participants to start a battle
  MAX_ROUNDS: 10,                 // Maximum rounds per battle
  MIN_ROUNDS: 1,                  // Minimum rounds per battle
  MAX_CASES_PER_BATTLE: 20,       // Maximum cases in battle sequence
  MIN_CASES_PER_BATTLE: 1,        // Minimum cases in battle sequence
  BATTLE_CREATION_TIMEOUT: 300,   // Seconds before unfilled battle is cancelled
  ROUND_EXECUTION_TIMEOUT: 60,    // Seconds per round max execution time
  SETTLEMENT_TIMEOUT: 120,        // Seconds for settlement to complete
} as const;

// User level limits based on verification/KYC tier
export const TIER_LIMITS = {
  UNVERIFIED: {
    MAX_BATTLE_POT: 100,
    USER_DAILY_WAGER: 500,
    USER_DAILY_LOSS: 200,
    MAX_CONCURRENT_BATTLES: 2,
  },
  VERIFIED: {
    MAX_BATTLE_POT: 1000,
    USER_DAILY_WAGER: 5000,
    USER_DAILY_LOSS: 2000,
    MAX_CONCURRENT_BATTLES: 3,
  },
  KYC_TIER_1: {
    MAX_BATTLE_POT: 2500,
    USER_DAILY_WAGER: 15000,
    USER_DAILY_LOSS: 6000,
    MAX_CONCURRENT_BATTLES: 4,
  },
  KYC_TIER_2: {
    MAX_BATTLE_POT: 5000,
    USER_DAILY_WAGER: 25000,
    USER_DAILY_LOSS: 10000,
    MAX_CONCURRENT_BATTLES: 5,
  },
} as const;

// Rate limiting and anti-abuse
export const RATE_LIMITS = {
  BATTLE_CREATION: {
    MAX_PER_MINUTE: 3,            // Max battles created per minute
    MAX_PER_HOUR: 20,             // Max battles created per hour
    MAX_PER_DAY: 100,             // Max battles created per day
  },
  BATTLE_JOINING: {
    MAX_PER_MINUTE: 10,           // Max battles joined per minute
    MAX_PER_HOUR: 50,             // Max battles joined per hour
  },
  API_REQUESTS: {
    MAX_PER_MINUTE: 100,          // General API rate limit
    MAX_PER_HOUR: 1000,           // Hourly API rate limit
  },
} as const;

// Collusion detection thresholds
export const COLLUSION_THRESHOLDS = {
  MAX_SAME_IP_PARTICIPANTS: 2,    // Max participants from same IP in battle
  MAX_SAME_DEVICE_PARTICIPANTS: 1, // Max participants from same device
  SUSPICIOUS_WIN_RATE: 0.75,      // Win rate threshold for flagging
  SUSPICIOUS_PATTERN_SCORE: 0.8,  // Pattern analysis threshold
  FREQUENT_OPPONENT_THRESHOLD: 5, // Times facing same opponent before flag
} as const;

// Economic controls and circuit breakers
export const ECONOMIC_CONTROLS = {
  MAX_PAYOUT_TO_WAGER_RATIO: 10,  // Circuit breaker threshold
  MAX_SITE_HOURLY_PAYOUT: 50000,  // Max site-wide hourly payout
  MAX_SITE_DAILY_PAYOUT: 1000000, // Max site-wide daily payout
  VOLATILITY_THRESHOLD: 0.3,      // Price volatility trigger
  LIQUIDITY_RESERVE_RATIO: 0.1,   // Reserve ratio requirement
} as const;

// Game mode specific limits
export const MODE_LIMITS = {
  STANDARD: {
    MAX_PARTICIPANTS: 6,
    MAX_ROUNDS: 10,
    AVAILABLE_TO_ALL: true,
  },
  CRAZY: {
    MAX_PARTICIPANTS: 4,
    MAX_ROUNDS: 5,
    AVAILABLE_TO_ALL: true,
    REQUIRE_VERIFICATION: false,
  },
  TOURNAMENT: {
    MAX_PARTICIPANTS: 16,
    MAX_ROUNDS: 20,
    AVAILABLE_TO_ALL: false,
    REQUIRE_VERIFICATION: true,
  },
} as const;

// Time-based restrictions
export const TIME_RESTRICTIONS = {
  MIN_AGE_RESTRICTION: 18,         // Minimum age in years
  RESTRICTED_HOURS: {
    START: 2,                      // 2 AM
    END: 6,                        // 6 AM
    REDUCE_LIMITS: true,           // Reduce limits during restricted hours
    REDUCTION_FACTOR: 0.5,         // Reduce limits by 50%
  },
  COOLDOWNS: {
    AFTER_LOSS_STREAK: 300,        // 5 minutes cooldown after 3 losses
    AFTER_BIG_WIN: 60,             // 1 minute cooldown after big win
    AFTER_SUSPICIOUS_ACTIVITY: 3600, // 1 hour after suspicious activity
  },
} as const;

// Validation functions
export class LimitValidator {
  /**
   * Validate if a battle configuration is within limits
   */
  static validateBattleConfig(config: {
    caseIds: string[];
    mode: 'standard' | 'crazy' | 'tournament';
    maxParticipants: number;
    userTier: keyof typeof TIER_LIMITS;
  }): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    const tierLimits = TIER_LIMITS[config.userTier];

    // Validate case count
    if (config.caseIds.length < BATTLE_LIMITS.MIN_CASES_PER_BATTLE) {
      errors.push(`Minimum ${BATTLE_LIMITS.MIN_CASES_PER_BATTLE} cases required`);
    }
    if (config.caseIds.length > BATTLE_LIMITS.MAX_CASES_PER_BATTLE) {
      errors.push(`Maximum ${BATTLE_LIMITS.MAX_CASES_PER_BATTLE} cases allowed`);
    }

    // Validate participants
    if (config.maxParticipants < BATTLE_LIMITS.MIN_PARTICIPANTS) {
      errors.push(`Minimum ${BATTLE_LIMITS.MIN_PARTICIPANTS} participants required`);
    }
    if (config.maxParticipants > BATTLE_LIMITS.MAX_PARTICIPANTS) {
      errors.push(`Maximum ${BATTLE_LIMITS.MAX_PARTICIPANTS} participants allowed`);
    }

    // Validate mode limits
    const modeLimits = MODE_LIMITS[config.mode.toUpperCase() as keyof typeof MODE_LIMITS];
    if (modeLimits && !modeLimits.AVAILABLE_TO_ALL) {
      if (config.userTier === 'UNVERIFIED') {
        errors.push(`Game mode '${config.mode}' requires verification`);
      }
    }

    return { valid: errors.length === 0, errors };
  }

  /**
   * Check if user can create a battle based on rate limits
   */
  static canCreateBattle(userId: string, userStats: {
    battlesCreatedToday: number;
    battlesCreatedHour: number;
    battlesCreatedMinute: number;
  }): { allowed: boolean; reason?: string } {
    if (userStats.battlesCreatedMinute >= RATE_LIMITS.BATTLE_CREATION.MAX_PER_MINUTE) {
      return { allowed: false, reason: 'Rate limit: Too many battles created per minute' };
    }
    if (userStats.battlesCreatedHour >= RATE_LIMITS.BATTLE_CREATION.MAX_PER_HOUR) {
      return { allowed: false, reason: 'Rate limit: Too many battles created per hour' };
    }
    if (userStats.battlesCreatedToday >= RATE_LIMITS.BATTLE_CREATION.MAX_PER_DAY) {
      return { allowed: false, reason: 'Rate limit: Daily battle creation limit reached' };
    }

    return { allowed: true };
  }

  /**
   * Get user-specific limits based on their tier
   */
  static getUserLimits(userTier: keyof typeof TIER_LIMITS) {
    return {
      ...MONETARY_LIMITS,
      ...TIER_LIMITS[userTier],
    };
  }

  /**
   * Check if battle pot is within limits for user tier
   */
  static validatePotSize(potSize: number, userTier: keyof typeof TIER_LIMITS): boolean {
    const userLimits = this.getUserLimits(userTier);
    return potSize <= userLimits.MAX_BATTLE_POT;
  }

  /**
   * Check if current time is in restricted hours
   */
  static isRestrictedTime(): boolean {
    const now = new Date();
    const currentHour = now.getHours();
    const { START, END } = TIME_RESTRICTIONS.RESTRICTED_HOURS;

    if (START <= END) {
      return currentHour >= START && currentHour < END;
    } else {
      // Handle overnight restriction (e.g., 22:00 to 06:00)
      return currentHour >= START || currentHour < END;
    }
  }

  /**
   * Get adjusted limits during restricted hours
   */
  static getRestrictedHoursLimits(baseLimit: number): number {
    if (this.isRestrictedTime()) {
      return Math.floor(baseLimit * TIME_RESTRICTIONS.RESTRICTED_HOURS.REDUCTION_FACTOR);
    }
    return baseLimit;
  }

  /**
   * Validate against collusion detection rules
   */
  static validateCollusionDetection(participants: Array<{
    userId: string;
    ipAddress?: string;
    deviceId?: string;
  }>): { valid: boolean; flags: string[] } {
    const flags: string[] = [];
    const ipCount = new Map<string, number>();
    const deviceCount = new Map<string, number>();

    participants.forEach(p => {
      if (p.ipAddress) {
        ipCount.set(p.ipAddress, (ipCount.get(p.ipAddress) || 0) + 1);
      }
      if (p.deviceId) {
        deviceCount.set(p.deviceId, (deviceCount.get(p.deviceId) || 0) + 1);
      }
    });

    // Check IP-based collusion
    for (const [ip, count] of ipCount) {
      if (count > COLLUSION_THRESHOLDS.MAX_SAME_IP_PARTICIPANTS) {
        flags.push(`Multiple participants from same IP: ${ip}`);
      }
    }

    // Check device-based collusion
    for (const [device, count] of deviceCount) {
      if (count > COLLUSION_THRESHOLDS.MAX_SAME_DEVICE_PARTICIPANTS) {
        flags.push(`Multiple participants from same device: ${device}`);
      }
    }

    return { valid: flags.length === 0, flags };
  }
}

// Legacy export for backward compatibility
export const LIMITS = MONETARY_LIMITS;

// Export all configuration objects
export {
  MONETARY_LIMITS,
  BATTLE_LIMITS,
  TIER_LIMITS,
  RATE_LIMITS,
  COLLUSION_THRESHOLDS,
  ECONOMIC_CONTROLS,
  MODE_LIMITS,
  TIME_RESTRICTIONS,
};

