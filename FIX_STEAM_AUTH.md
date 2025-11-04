# 🔧 How to Fix Steam Authentication

## 🔴 THE PROBLEM

Steam authentication is failing because **you don't have a real Steam API key configured**. Both your local `.env` and Vercel environment variables have placeholder values.

## ✅ THE SOLUTION

### Step 1: Get Your Steam API Key

1. **Go to**: https://steamcommunity.com/dev/apikey
2. **Sign in** with your Steam account
3. **Enter domain name**: `toproll-delta.vercel.app` (or your custom domain)
4. **Copy** the generated API key (it looks like: `ABCDEF1234567890ABCDEF1234567890`)

### Step 2: Update Local Environment

Open `k:\toproll\.env` and replace:

```env
STEAM_API_KEY=YOUR_REAL_STEAM_API_KEY_HERE
STEAM_WEB_API_KEY=YOUR_REAL_STEAM_API_KEY_HERE
```

With your actual Steam API key:

```env
STEAM_API_KEY=ABCDEF1234567890ABCDEF1234567890
STEAM_WEB_API_KEY=ABCDEF1234567890ABCDEF1234567890
```

### Step 3: Update Vercel Environment Variables

**Option A: Via Vercel Dashboard**
1. Go to: https://vercel.com/w3bsuki/toproll-delta/settings/environment-variables
2. Add/Update these variables:
   - `STEAM_API_KEY` = `your_real_api_key`
   - `STEAM_WEB_API_KEY` = `your_real_api_key`
   - `STEAM_OPENID_REALM` = `https://toproll-delta.vercel.app`
   - `STEAM_OPENID_RETURN_TO` = `https://toproll-delta.vercel.app/api/auth/steam/callback`
3. **Redeploy** your application

**Option B: Via Vercel CLI**
```bash
vercel env add STEAM_API_KEY
# Paste your API key when prompted

vercel env add STEAM_WEB_API_KEY
# Paste your API key when prompted

vercel env add STEAM_OPENID_REALM
# Enter: https://toproll-delta.vercel.app

vercel env add STEAM_OPENID_RETURN_TO
# Enter: https://toproll-delta.vercel.app/api/auth/steam/callback
```

Then redeploy:
```bash
vercel --prod
```

### Step 4: Test Locally

```bash
pnpm dev
```

Then open http://localhost:5173 and click "Sign in with Steam"

### Step 5: Test on Vercel

Open https://toproll-delta.vercel.app and click "Sign in with Steam"

---

## 🔍 What Was Happening

When you clicked "Sign in with Steam":

1. ✅ Button worked → redirected to Steam OpenID ✓
2. ✅ Steam OpenID login page loaded ✓
3. ✅ After Steam login, redirected back to your callback ✓
4. ❌ **Callback failed** because:
   - Code tried to fetch user data from Steam API
   - Used `env.STEAM_API_KEY` which was `"your_steam_api_key_here"`
   - Steam API rejected the request
   - User saw error or got stuck

**Error in logs (if you checked):**
```
Steam auth error: Failed to fetch Steam profile
```

---

## 📋 Quick Checklist

- [ ] Get Steam API key from https://steamcommunity.com/dev/apikey
- [ ] Update local `.env` file with real API key
- [ ] Add environment variables to Vercel dashboard
- [ ] Redeploy Vercel app
- [ ] Test locally: `pnpm dev`
- [ ] Test on Vercel: https://toproll-delta.vercel.app

---

## 🧪 Verify It's Working

### Successful Auth Flow Should Show:

1. Click "Sign in with Steam"
2. Redirect to Steam login page
3. Sign in with Steam account
4. Redirect back to your site
5. **See your Steam profile/username displayed** ✓
6. Session persisted in cookies ✓

### Check Browser Console:
```
✅ Initializing Supabase client
✅ Auth state changed: SIGNED_IN true
✅ User authenticated: [Your Steam Name]
```

---

## 🐛 Still Not Working?

Run this test to see detailed error messages:

```bash
npx playwright test e2e/steam-callback-test.spec.ts --config=playwright.vercel.config.ts
```

Check server logs:
```bash
vercel logs [deployment-url]
```

Look for:
```
❌ Steam auth error: [error message]
```

---

## 💡 Pro Tips

1. **Keep your API key secret** - Don't commit it to git
2. **Use different keys** for dev/prod if needed
3. **Check Steam API status**: https://steamstat.us/
4. **Monitor Vercel logs** for auth errors
5. **Test in incognito** to avoid cached sessions

---

## ⚡ Quick Commands

```bash
# Local development
pnpm dev

# Deploy to Vercel
vercel --prod

# Check Vercel environment variables
vercel env ls

# View Vercel logs
vercel logs

# Run auth tests
npx playwright test e2e/steam-callback-test.spec.ts --config=playwright.vercel.config.ts
```
