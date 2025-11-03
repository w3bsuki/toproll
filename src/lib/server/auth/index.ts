/**
 * Security module exports
 * Central export point for all security-related functionality
 */

// Rate limiting
export { RateLimiter, apiRateLimiter, authRateLimiter, strictRateLimiter } from './rateLimiter';
export type { RateLimitEntry, RateLimitResult } from './rateLimiter';

// Security headers
export { applySecurityHeaders, getSecurityConfig, securityConfigs } from './headers';
export type { SecurityHeaderConfig } from './headers';

// Configuration
export { SECURITY_CONFIG } from './config';
export type { RateLimitConfig, SecurityHeaderConfig as HeaderConfig } from './config';

// Utilities
export { testRateLimit, validateSecurityHeaders, getClientInfo } from './utils';

// Examples (for documentation and reference)
export * from './examples';
