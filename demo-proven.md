## Proven v1 Demo — “What’s Real Today” Runbook

This doc is the **demo script + QA checklist** for the current system in this repo (Next.js + Firestore emulator).

### What’s in scope (works today)

- **Markets feed**: browse markets, filter by category, open a market
- **Market detail**: YES/NO price, chart (mock), resolution rules
- **Trading (mocked USDC)**: take a YES/NO position (writes to Firestore)
- **Portfolio**: open positions + trade history
  - Defaults to demo user `user_demo`
  - Supports `?userId=...` or connected wallet address
- **Admin**: create market, resolve market (no auth gating in emulator rules)

### Not in scope yet (don’t demo)

- Network enforcement / balances
- Sorting modes beyond the existing “Trending/Category” tabs
- Chart timeframes / real tick ingestion (chart is mocked on the page)
- Closing positions via UI
- Redeem / payouts

---

## 0) Setup (2 minutes)

### Prereqs

- **Firebase emulator running**
- **Seed data loaded**
- App running on `localhost:3000`

### Commands

In terminal A (emulators):

```bash
firebase emulators:start
```

In terminal B (seed):

```bash
npm run seed:emulator -- --wipe
```

In terminal C (app):

```bash
npm run dev
```

### Sanity URLs

- **App**: `http://localhost:3000`
- **Firestore emulator UI**: `http://localhost:4000`

---

## 1) First impressions (30 seconds)

- **Desktop**: layout looks intentional, no overlap, nav visible
- **Mobile**: no horizontal scroll, buttons are tappable

If anything looks broken, refresh once (dev hot reload sometimes flashes).

---

## 2) Markets feed (1 minute)

### Steps

1. Go to `/` (home).
2. Click tabs: **Trending / Tech / Geo / Crossover**.
3. Pick one **OPEN** market and click into it.

### Expected

- Cards show: **question**, **category**, **status**, **probability**
- Filter actually changes the grid

---

## 3) Market detail page (1 minute)

### Steps

1. Confirm the header shows **question + category + status**.
2. Point out:
   - **YES %** (probability proxy)
   - **Closes** date
   - “Resolution Rules” text
3. Scroll to the chart (note: it’s **mock data** today).

### Expected

- Page loads without errors
- Trading widget shows YES/NO toggle + amount input + CTA

---

## 4) Take a position (1–2 minutes)

### What we’re demoing

This is a **mock USDC flow**: entering “Amount (USDC)” creates a trade + updates your position in Firestore.

### Option A (fastest demo, no wallet)

1. Open `/portfolio`.
2. You should immediately see **seeded positions + trades** for `user_demo`.

### Option B (demo “real user” behavior)

1. Go back to a market detail page.
2. Click **Connect Wallet** and connect.
3. Enter an amount (e.g. `10`).
4. Click **Take YES Position** (or NO).
5. Visit `/portfolio` and confirm you’re “Viewing as” your address.

If you want to force a specific user view:

- `/portfolio?userId=user_demo`
- `/portfolio?userId=0x1111111111111111111111111111111111111111`

### Expected

- CTA shows a loading state (“Confirming…”)
- Success alert appears
- Market query invalidates and refreshes
- Portfolio shows a new trade and updated position

---

## 5) Admin flow: create + resolve (2 minutes)

Go to `/admin`.

### 5.1 Create market

1. Fill: question, category, criteria, date
2. Click **Create Market**
3. Return to `/` and confirm the new market appears

### 5.2 Resolve market

1. Copy a Market ID (from Firestore UI or the URL `/markets/[id]`)
2. Paste into “Market ID”
3. Choose **YES** or **NO**
4. Click **Resolve**
5. Re-open the market and confirm:
   - status becomes **RESOLVED**
   - YES price flips to `1.0` or `0.0` based on outcome

---

## 6) Quick “2-minute demo script” (exact talk track)

1. “Here’s the markets feed — it’s a prediction market UI with Tech/Geo/Crossover.”
2. “Each card shows probability (YES price) and status.”
3. Open an OPEN market: “Here’s the market detail + rules.”
4. “Taking a position is a mocked USDC trade written to Firestore.”
5. Open `/portfolio`: “Here’s the track record — open positions + trade history.”
6. Open `/admin`: “Here’s how markets get created/resolved to become ‘Proven’.”