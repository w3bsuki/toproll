# Security & Compliance (Oct 2025)

## Auth & Sessions
- Steam OpenID; Supabase Auth; HttpOnly, Secure cookies; short TTL
- CSRF protections for stateful actions; origin checks

## Data & RLS
- RLS enabled by default; policies per table
- Profiles: owner-only; battles/pulls: participant/creator; catalogs: public read

## PF Secrets
- Server seeds stored server-side only; rotation schedule; commit/reveal logs

## KYC & Region Gating
- Tiered KYC before wagering for restricted regions; age gating

## Abuse & Fraud
- Collusion heuristics; limits per user/day; circuit breakers

## Privacy & Retention
- Minimal PII; segregate KYC data; deletion upon request; retention policy

