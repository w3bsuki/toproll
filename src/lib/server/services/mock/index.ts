/**
 * Mock Providers Index
 *
 * Exports all mock providers for the API facade.
 * This file serves as the main entry point for mock functionality.
 */

export { auth } from './auth.mock';
export { pots } from './pots.mock';
export { marketplace } from './marketplace.mock';
export { battles } from './battles.mock';
export { inventory } from './inventory.mock';

// Re-export types for convenience
export type { BattleDetails, BattleSummary } from './battles.mock';
