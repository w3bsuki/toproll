# Steam Auth Testing Guide

## The Problem

The Steam auth was failing with "Missing nonce parameter" because the login and callback handlers had **separate in-memory nonce stores**. The nonce created during login wasn't available during callback.

## The Fix

Created a **shared nonce store** at `src/lib/server/auth/nonceStore.ts` that both handlers now use.

## How to Test Steam Auth

### 1. Make sure dev server is running:
```bash
npm run dev
```

### 2. Open browser to http://localhost:5173

### 3. Click "Sign in with Steam" button

### 4. You'll be redirected to Steam's OpenID login page

### 5. Authorize the app

### 6. You'll be redirected back to your app with a working session!

## What Happens Behind the Scenes

1. **Click "Sign in with Steam"**
   - Navigates to `/api/auth/steam/login`
   - Generates nonce and stores it in **shared nonce store**
   - Sets nonce in cookie
   - Redirects to Steam OpenID

2. **Steam authenticates you**
   - You log in to Steam
   - Steam redirects back to `/api/auth/steam/callback?nonce=...&openid.claimed_id=...`

3. **Callback validates and creates session**
   - Checks nonce from cookie matches nonce in URL
   - Retrieves nonce from **shared nonce store** ✅ (this was broken before!)
   - Validates OpenID response with Steam
   - Creates/updates Supabase Auth user
   - Generates magic link via admin API
   - Exchanges magic link token for real Supabase session
   - Sets session cookies
   - Redirects to `/profile`

## Why Everything Was Broken

❌ **Before**: No authentication = no session = no RLS context = empty database queries = blank UI

✅ **After**: Steam auth works → real Supabase session → RLS with auth.uid() → data loads → UI works!

## Test Locally

The Steam auth should now work locally. Make sure you have these env vars:

```env
# Steam OpenID config
STEAM_API_KEY=your_steam_api_key
STEAM_OPENID_REALM=http://localhost:5173
STEAM_OPENID_RETURN_TO=http://localhost:5173/api/auth/steam/callback

# Supabase
PUBLIC_SUPABASE_URL=https://your-project.supabase.co
PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## Next Steps

Once you successfully log in via Steam:
1. ✅ You'll have a real Supabase session
2. ✅ The sidebar navigation will work (you can see protected routes)
3. ✅ Community pots will load (RLS queries work)
4. ✅ Profile page will show your Steam info
5. ✅ All API calls will be authenticated

## Troubleshooting

**Still getting "Missing nonce parameter"?**
- Restart the dev server (the in-memory store resets on restart)
- Clear cookies and try again
- Check that both login and callback handlers are using the shared store

**Getting "Invalid nonce"?**
- The nonce expires after 5 minutes
- Make sure cookies are enabled
- Try in a different browser/incognito window

**Getting "Nonce expired or not found"?**
- The server may have restarted between login and callback
- In production, use a persistent store (Redis, database)
- For now, complete the auth flow quickly (< 5 min)
