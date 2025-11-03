# TopRoll API Reference

**Version:** 1.0  
**Last Updated:** October 2025

---

## Base URL

- **Development:** `http://localhost:5173`
- **Production:** `https://toproll.gg` (TBD)

---

## Authentication

All authenticated endpoints require a valid session cookie set by Steam OpenID flow.

### Steam Auth

```http
GET /auth/steam
→ Redirects to Steam OpenID

GET /auth/steam/callback?openid.claimed_id=...
→ Sets session cookie, redirects to dashboard

POST /auth/logout
→ Clears session
```

### Current User

```http
GET /api/user
Authorization: Session cookie

Response 200:
{
  "user": {
    "id": "uuid",
    "steam_id": "76561198...",
    "username": "PlayerName",
    "avatar": "https://...",
    "balance": 1570.00,
    "kyc_tier": 1
  }
}
```

---

## Battles API

### List Battles

```http
GET /api/battles?status=waiting&limit=20

Response 200:
{
  "battles": [
    {
      "id": "uuid",
      "mode": "1v1",
      "case_ids": ["case-1", "case-2"],
      "entry_fee": 10.00,
      "status": "waiting",
      "participants": 1,
      "max_participants": 2,
      "created_at": "2025-10-11T..."
    }
  ]
}
```

### Get Battle

```http
GET /api/battles/:id

Response 200:
{
  "battle": {
    "id": "uuid",
    "mode": "1v1",
    "entry_fee": 10.00,
    "status": "active",
    "participants": [
      {
        "id": "uuid",
        "user_id": "uuid",
        "username": "Player1",
        "total_value": 25.50
      }
    ],
    "rounds": [
      {
        "round_number": 1,
        "participant_id": "uuid",
        "item_won": "AK-47 | Redline",
        "item_value": 12.50
      }
    ],
    "winner_id": null,
    "server_seed_hash": "abc123..."
  }
}
```

### Create Battle

```http
POST /api/battles
Content-Type: application/json

{
  "mode": "1v1",
  "case_ids": ["case-1", "case-2"],
  "client_seed": "optional-user-seed"
}

Response 201:
{
  "battle": {
    "id": "uuid",
    "mode": "1v1",
    "status": "waiting",
    ...
  }
}
```

### Join Battle

```http
POST /api/battles/:id/join
Content-Type: application/json

{
  "client_seed": "optional-user-seed"
}

Response 200:
{
  "participant": {
    "id": "uuid",
    "battle_id": "uuid",
    "user_id": "uuid",
    "joined_at": "2025-10-11T..."
  }
}
```

---

## Pots API

### List Pots

```http
GET /api/pots?status=open&limit=20

Response 200:
{
  "pots": [
    {
      "id": "uuid",
      "entry_fee": 5.00,
      "max_participants": 10,
      "current_participants": 7,
      "status": "open",
      "total_pool": 35.00,
      "created_at": "2025-10-11T..."
    }
  ]
}
```

### Get Pot

```http
GET /api/pots/:id

Response 200:
{
  "pot": {
    "id": "uuid",
    "entry_fee": 5.00,
    "max_participants": 10,
    "current_participants": 10,
    "status": "completed",
    "winner_id": "uuid",
    "winner_username": "LuckyPlayer",
    "total_pool": 50.00,
    "payout_amount": 47.50,
    "server_seed_hash": "abc123...",
    "server_seed": "revealed-after-completion",
    "entries": [
      {
        "id": "uuid",
        "user_id": "uuid",
        "username": "Player1",
        "entry_number": 1,
        "joined_at": "2025-10-11T..."
      }
    ]
  }
}
```

### Create Pot

```http
POST /api/pots
Content-Type: application/json

{
  "entry_fee": 5.00,
  "max_participants": 10
}

Response 201:
{
  "pot": {
    "id": "uuid",
    "entry_fee": 5.00,
    "status": "open",
    ...
  }
}
```

### Join Pot

```http
POST /api/pots/:id/join

Response 200:
{
  "entry": {
    "id": "uuid",
    "pot_id": "uuid",
    "user_id": "uuid",
    "entry_number": 8
  }
}
```

---

## Marketplace API

### List Listings

```http
GET /api/marketplace?rarity=legendary&min_price=10&max_price=100&sort=price_asc&limit=30

Response 200:
{
  "listings": [
    {
      "id": "uuid",
      "item_name": "AWP | Dragon Lore",
      "market_name": "AWP | Dragon Lore (Factory New)",
      "market_value": 4200.00,
      "listed_price": 4200.00,
      "rarity": "legendary",
      "seller_id": "uuid",
      "seller_username": "ProSeller",
      "status": "active",
      "created_at": "2025-10-11T..."
    }
  ],
  "total": 145
}
```

### Get Listing

```http
GET /api/marketplace/:id

Response 200:
{
  "listing": {
    "id": "uuid",
    "item_name": "AK-47 | Redline",
    "market_value": 45.50,
    "listed_price": 45.50,
    "image_url": "https://...",
    "seller_id": "uuid",
    "seller_username": "Seller123",
    "status": "active",
    "created_at": "2025-10-11T..."
  }
}
```

### Create Listing

```http
POST /api/marketplace
Content-Type: application/json

{
  "item_name": "AK-47 | Redline",
  "market_name": "AK-47 | Redline (Field-Tested)",
  "market_value": 45.50,
  "image_url": "https://..."
}

Response 201:
{
  "listing": {
    "id": "uuid",
    "item_name": "AK-47 | Redline",
    "listed_price": 45.50,
    "status": "active",
    ...
  }
}
```

### Purchase Listing

```http
POST /api/marketplace/:id/purchase

Response 200:
{
  "transaction": {
    "id": "uuid",
    "listing_id": "uuid",
    "buyer_id": "uuid",
    "amount": 45.50,
    "created_at": "2025-10-11T..."
  },
  "balance": 1524.50
}

Error 400:
{
  "error": "Insufficient balance",
  "required": 45.50,
  "available": 20.00
}
```

---

## Inventory API

### Get User Inventory

```http
GET /api/inventory

Response 200:
{
  "items": [
    {
      "id": "steam-item-id",
      "name": "AK-47 | Redline",
      "market_name": "AK-47 | Redline (Field-Tested)",
      "market_value": 45.50,
      "rarity": "rare",
      "image_url": "https://...",
      "tradable": true
    }
  ],
  "total_value": 523.75,
  "inventory_public": true
}
```

---

## Transactions API

### List Transactions

```http
GET /api/transactions?type=payout&limit=50

Response 200:
{
  "transactions": [
    {
      "id": "uuid",
      "type": "payout",
      "amount": 47.50,
      "balance_after": 1570.00,
      "reference_type": "pot",
      "reference_id": "uuid",
      "created_at": "2025-10-11T..."
    }
  ],
  "total": 234
}
```

---

## Provably Fair API

### Verify Outcome

```http
POST /api/provably-fair/verify
Content-Type: application/json

{
  "game_type": "pot",
  "game_id": "uuid",
  "server_seed": "revealed-seed",
  "client_seed": "user-seed",
  "nonce": 0
}

Response 200:
{
  "valid": true,
  "server_seed_hash": "abc123...",
  "outcome_hash": "def456...",
  "expected_outcome": "def456..."
}

Error 400:
{
  "valid": false,
  "error": "Server seed hash mismatch"
}
```

---

## WebSocket Events (Supabase Realtime)

### Battle Updates

```typescript
// Subscribe to battle
const channel = supabase
  .channel(`battle:${battleId}`)
  .on('postgres_changes', {
    event: 'UPDATE',
    schema: 'public',
    table: 'case_battles',
    filter: `id=eq.${battleId}`
  }, (payload) => {
    // Battle status changed
  })
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'battle_rounds',
    filter: `battle_id=eq.${battleId}`
  }, (payload) => {
    // New round added
  })
  .subscribe();
```

### Pot Updates

```typescript
// Subscribe to pot
const channel = supabase
  .channel(`pot:${potId}`)
  .on('postgres_changes', {
    event: 'UPDATE',
    schema: 'public',
    table: 'pots'
  }, (payload) => {
    // Pot status or participants changed
  })
  .subscribe();
```

### Live Drops

```typescript
// Subscribe to live drops
const channel = supabase
  .channel('live-drops')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'transactions',
    filter: 'type=eq.payout'
  }, (payload) => {
    if (payload.new.amount >= 50) {
      // Show in live drops ticker
    }
  })
  .subscribe();
```

---

## Error Codes

| Code | Message | Description |
|------|---------|-------------|
| 400 | Bad Request | Invalid request body or parameters |
| 401 | Unauthorized | Missing or invalid session |
| 403 | Forbidden | Insufficient permissions or KYC tier |
| 404 | Not Found | Resource does not exist |
| 409 | Conflict | Resource conflict (e.g., already joined) |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server error, contact support |

---

## Rate Limits

| Endpoint | Limit | Window |
|----------|-------|--------|
| Global (per IP) | 100 requests | 1 minute |
| Global (per user) | 50 requests | 1 minute |
| `/api/battles` POST | 5 requests | 1 hour |
| `/api/pots/*/join` POST | 10 requests | 1 hour |
| `/api/marketplace` POST | 20 requests | 1 hour |

Exceeded limits return `429 Too Many Requests` with `Retry-After` header.

---

## Database Schema (PostgreSQL)

See full schema in ARCHITECTURE.md Section 5.2.

**Key Tables:**
- `users` - User accounts
- `profiles` - Extended user data
- `case_battles` - Battle games
- `pots` - Community pots
- `marketplace_listings` - Item listings
- `transactions` - Financial transactions
- `battle_rounds` - Battle outcomes
- `pot_entries` - Pot participants

---

**Document Owner:** Engineering Team  
**Review Cadence:** Monthly  
**API Versioning:** Follows SemVer (currently v1)
