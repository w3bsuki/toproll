# Design Document

## Overview

The Steam Authentication & User Profiles system provides secure, Steam-only authentication integrated with Supabase Auth, automatic profile management, and CS2 inventory access. The system uses Steam OpenID for authentication, Supabase for user data storage and session management, and the Steam Web API for inventory and profile data retrieval.

## Architecture

### Authentication Flow

```text
User → SvelteKit App → Steam OpenID → Steam Auth → Supabase Auth → JWT Token → Protected Routes
```

### Data Flow

```text
Steam API ← → Supabase Functions ← → Supabase Database ← → SvelteKit Frontend
```

### Key Components

- **Steam OpenID Integration**: Handles Steam authentication redirects and callbacks
- **Supabase Auth Custom Provider**: Manages JWT tokens and session state
- **Profile Management Service**: Handles profile creation and updates
- **Steam API Service**: Fetches inventory and profile data
- **Authentication Guards**: Protects routes and API endpoints

## Components and Interfaces

### Frontend Components

#### AuthButton Component

```typescript
interface AuthButtonProps {
	loading?: boolean;
	onSignIn?: () => void;
}
```

- Displays "Sign in with Steam" button
- Handles loading states during authentication
- Redirects to Steam OpenID endpoint

#### ProfileCard Component

```typescript
interface ProfileCardProps {
	user: UserProfile;
	showStats?: boolean;
	compact?: boolean;
}
```

- Displays user avatar, username, Steam profile link
- Shows gamification stats when enabled
- Responsive design for different contexts

#### InventoryGrid Component

```typescript
interface InventoryGridProps {
	items: CS2Item[];
	loading: boolean;
	onItemSelect?: (item: CS2Item) => void;
	selectable?: boolean;
}
```

- Grid layout for CS2 inventory items
- Item filtering and sorting capabilities
- Loading states and error handling

### Backend Services

#### Steam Auth Service

```typescript
interface SteamAuthService {
	generateAuthUrl(): string;
	validateCallback(params: URLSearchParams): Promise<SteamUser>;
	createSupabaseUser(steamUser: SteamUser): Promise<User>;
}
```

#### Profile Service

```typescript
interface ProfileService {
	createProfile(steamUser: SteamUser): Promise<UserProfile>;
	updateProfile(userId: string): Promise<UserProfile>;
	getProfile(userId: string): Promise<UserProfile>;
}
```

#### Steam API Service

```typescript
interface SteamAPIService {
	getPlayerSummary(steamId: string): Promise<SteamPlayerSummary>;
	getCS2Inventory(steamId: string): Promise<CS2Item[]>;
	validateInventoryPublic(steamId: string): Promise<boolean>;
}
```

## Data Models

### UserProfile Table

```sql
-- Finalized schema aligned with Supabase Auth
CREATE TABLE user_profiles (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  steam_id text UNIQUE NOT NULL,
  username text NOT NULL,
  avatar_url text,
  steam_profile_url text,
  total_wagered numeric(10,2) DEFAULT 0,
  total_profit numeric(10,2) DEFAULT 0,
  win_rate numeric(5,2) DEFAULT 0,
  biggest_win numeric(10,2) DEFAULT 0,
  case_battle_wins integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Keep data fresh
create or replace function set_updated_at() returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end; $$;

drop trigger if exists user_profiles_set_updated_at on user_profiles;
create trigger user_profiles_set_updated_at
before update on user_profiles
for each row execute function set_updated_at();
```

### CS2Item Interface

```typescript
interface CS2Item {
	assetid: string;
	classid: string;
	instanceid: string;
	name: string;
	market_name: string;
	icon_url: string;
	tradable: boolean;
	marketable: boolean;
	market_value: number;
	rarity: string;
	type: string;
	wear?: string;
}
```

### SteamUser Interface

```typescript
interface SteamUser {
	steamid: string;
	personaname: string;
	avatar: string;
	avatarmedium: string;
	avatarfull: string;
	profileurl: string;
	communityvisibilitystate: number;
}
```

## Error Handling

### Authentication Errors

- **Steam API Unavailable**: Display maintenance message with retry option
- **Invalid Steam Response**: Log error and redirect to sign-in with error message
- **Supabase Auth Failure**: Display generic error and provide support contact
- **Session Expired**: Automatically redirect to re-authentication

### Profile Management Errors

- **Profile Creation Failed**: Log error, prevent access, display support message
- **Profile Update Failed**: Use cached data, log error, retry in background
- **Steam Data Unavailable**: Use cached profile data, display warning

### Inventory Errors

- **Private Inventory**: Display instructions for making inventory public
- **Steam API Rate Limit**: Implement exponential backoff, show loading state
- **Network Errors**: Display retry button with error message
- **Empty Inventory**: Show appropriate empty state message

## Testing Strategy

### Unit Tests

- Steam OpenID URL generation and validation
- Profile creation and update logic
- Steam API response parsing
- Authentication token validation
- Error handling for all services

### Integration Tests

- Complete authentication flow from Steam to Supabase
- Profile creation on first login
- Profile updates on subsequent logins
- Inventory fetching with various Steam API responses
- Session management and token refresh

### End-to-End Tests

- User signs in with Steam successfully
- New user profile is created automatically
- Returning user profile is updated
- User can view their CS2 inventory
- User can access their profile page
- Authentication guards protect routes properly
- User can sign out successfully

### Security Tests

- JWT token validation and expiration
- Steam OpenID response validation
- SQL injection prevention in profile queries
- Rate limiting on Steam API calls
- CSRF protection on authentication endpoints

## Performance Considerations

### Caching Strategy

- Steam profile data: 1 hour cache
- CS2 inventory data: 5 minute cache
- User profile data: Session-based cache
- Steam API responses: Redis cache with TTL

### Rate Limiting

- Steam API calls: Max 100 requests per minute per user
- Profile updates: Max 1 per minute per user
- Authentication attempts: Max 5 per minute per IP

### Database Optimization

- Index on steam_id for fast profile lookups
- Index on created_at for recent user queries
- Connection pooling for Supabase connections
- Row Level Security policies for data protection

## API Endpoints

- Auth
  - GET `/api/auth/steam/login`
    - Action: Redirects (302) to Steam OpenID provider with `state`/`nonce`
  - GET `/api/auth/steam/callback`
    - Action: Validates OpenID response, creates/links Supabase user, sets session, redirects to `/profile`
    - Errors: 400 invalid callback, 500 internal error
- Profile
  - GET `/api/profile`
    - Returns current user's profile (200) or 401 if unauthenticated
  - POST `/api/profile/refresh`
    - Refreshes Steam player summary, updates `username`/`avatar_url` (200); 401/503 on error
- Inventory
  - GET `/api/inventory`
    - Returns parsed CS2 inventory for current user (200)
    - Errors: 401 unauthenticated, 403 private inventory, 503 Steam API failure

## Supabase RLS Policies

```sql
alter table user_profiles enable row level security;

-- Read own profile
create policy select_own_profile on user_profiles
for select using (auth.uid() = user_id);

-- Insert only own row
create policy insert_own_profile on user_profiles
for insert with check (auth.uid() = user_id);

-- Update only own row
create policy update_own_profile on user_profiles
for update using (auth.uid() = user_id)
with check (auth.uid() = user_id);
```

## Environment & Secrets

- Required
  - `PUBLIC_SUPABASE_URL`
  - `PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY` (server-only)
  - `STEAM_API_KEY`
  - `BASE_URL` (e.g., `https://app.toproll.gg`)
  - `SESSION_SECRET` (for cookie/session signing when applicable)
- Optional
  - `REDIS_URL` (or edge KV) for caching Steam API responses
  - `SENTRY_DSN` for error tracking

## Threat Model & Mitigations

- OpenID replay/CSRF → Use `state`/`nonce`, validate issuer/audience, restrict callback origin
- Token theft → HttpOnly, Secure, SameSite cookies; short TTLs; no localStorage
- Inventory privacy → Detect private inventories, provide guidance, never bypass privacy
- API abuse/rate limits → Per-user rate limiting, 429 handling, exponential backoff
- Injection → Parameterized queries, strict input validation
- Enumeration → Generic error messages, consistent timing for auth errors

## Deployment & Operations

- Runtime: SvelteKit (Node adapter) on a managed platform (e.g., Vercel/Node server)
- Supabase: Apply SQL via migrations before deploy; verify RLS enabled
- Env Management: Provide all required variables for each environment (dev/staging/prod)
- Caching: Enable Redis/edge cache for Steam API endpoints with TTLs per Performance section
- Observability: Structured logs, metrics for auth/profile/inventory flows; Sentry optional
- Runbooks: Document Steam outage behavior (serve cache + banner), private inventory guidance, token expiration handling
