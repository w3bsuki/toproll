# Observability (Oct 2025)

## Logging

- Structured JSON: `ts, level, corr_id, user_id?, event, attrs{}`
- Correlation ID middleware on incoming requests and WS sessions

## Metrics

- Auth success/fail; active battles; RTP drift; error rate; latency (p95)

## Dashboards & Alerts (baseline)

- Errors > threshold; WS latency p95 > 150ms; RTP drift > 3σ; failed settlements

## Tracing (optional)

- Lightweight spans for critical flows; sampling in prod disabled by default

## Runbooks

- Battle stuck → restart orchestrator; check idempotency; manual settle fallback
- Pricing stale → delist cases; switch to cache; notify
