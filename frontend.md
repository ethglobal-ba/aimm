## 0. TL;DR – Frontend Direction

**Primary surface for the hackathon demos:**

- **Dedicated web dashboard** (Next.js + TS) as the main product.
- **Optional / stretch:** minimal **browser extension overlay** that reuses the same backend and shows a sidebar with what the orders the agent has placed

---

## 1. Users & Demo Story

### Primary users

1. **Market makers / quants** working behind platforms like Limitless / Kalshi / Trump.fun.
   - They want to see which markets are mispriced and have a one‑click way to have the AI rebalance.
2. **Hackathon judges**.
   - They need to understand the value prop in under 2 minutes.
   - They need to see: live data, AI price, order placement / integration with Base + Chainlink + Pyth.

### Demo narrative (for judges)

1. "Here’s a dashboard of markets we’re market‑making on Limitless."
2. "You can see live market price vs our AI fair price, and the mispricing gap."
3. "Let’s open one market that’s clearly off – here’s the price history and the AI’s research/ reasoning trail."
4. "Now I click **Recompute fair price** – that hits the LangGraph agent, pulls Pyth/CDP/Limitless, and returns a new fair price."
5. "Now I click **Auto‑rebalance** – this calls our backend, which places orders via the institution wallet on Base (or simulates it)."
6. Optional: "The same fair price is available to other agents via x402 / CRE, and we can even overlay it directly on Limitless with this small browser extension."

Everything in the UI should support this narrative.

---

## 2. Scope

- **Core surfaces** (must‑have):
  - **Markets Overview** page (home) showing many markets, live vs AIMM price, and mispricing.
  - **Market Detail** page for a single market with history, reasoning log, and controls to recompute / rebalance.
- **Stretch** (nice‑to‑have if time):
  - Minimal **browser extension overlay** that reuses the same backend and displays live vs fair price and recent agent orders as a sidebar / floating panel on Limitless/Polymarket.

---

## 3. Screen 1 – Markets Overview

### Purpose

Single page where judges instantly see:

**“Many markets, live price vs AI price, where’s the edge, what can I click?”**

### Layout

- Top bar:
  - Project name + short tagline (e.g. "AIMM – AI Market Maker").
  - Wallet connection
  - Filters & controls row:
    - **Search** by market title / symbol.
    - **Platform filter**: Limitless / Polymarket / Kalshi / Trump.fun (checkboxes). Right now we can disable all platforms that we dont support.
    - **Status filter**: Open / Suspended / Closed.
    - **Sort dropdown**:
      - `Mispricing (abs)` – default.
      - `Time to close`.
      - `Volume`.
- Main table (or card list) with columns:
  1. **Market** – title + platform pill + underlying asset symbol.
  2. **Live price** – current market odds (from Limitless / order book mid).
  3. **AIMM fair price** – last AI estimate.
  4. **Δ (mispricing)** – absolute and relative difference, color‑coded.
  5. **Agent position / last action** – net position (e.g. `+750 YES`) and short label like "Rebalanced 3m ago" or "No position".
  6. **Last AI run** – timestamp + status (✅ success / ⚠️ stale / ⏳ running).
  7. **Actions** – buttons:
     - `Details` (link to Market Detail screen).
     - `Recompute` (trigger agent run via backend).

### Interactions

- Clicking a row → navigates to Market Detail.
- Clicking **Recompute** on a row:
  - Immediately shows a loading state on that row.
  - Polls backend for run status.
  - When done, row animates to show new fair price & Δ.

### API contracts (suggested)

- `GET /markets`
  - Returns array with basic info + last live price + last AI price.
- `POST /markets/:id/recompute`
  - Triggers AI run; returns run id.
- `GET /runs/:id`
  - Polling endpoint to check status.

---

## 4. Screen 2 – Market Detail

### Purpose

Deep‑dive demo of a **single market**: price history, reasoning, order flow, and controls to recompute/rebalance.

### Layout

**Header:**

- Market title, platform pill, external link to Limitless/Polymarket.
- Chip for status: Open / Closed / Settled.
- Underlying asset / token + link to Pyth price feed.

**Top stats strip (horizontal cards):**

- Live price now.
- AIMM fair price now.
- Mispricing.
- 24h volume / OI (if available from API).
- Time to close.

**Section A – Price history chart**

- Line chart with two series:
  - Live market price (from Limitless / Polymarket).
  - AIMM fair price (from our agent).
- X axis: time.
- Y axis: price / probability.
- Hover shows both values at that timestamp.

**Section B – AI runs & reasoning**

- Vertical timeline or table of AI runs:
  - Each row: timestamp, fair price, Δ vs live at that moment, duration, model version.
  - Expandable details section with:
    - Natural‑language summary: "We increased odds from 0.42 → 0.56 based on...".
    - Bullet list of **signals** used:
      - Pyth price movement.
      - On‑chain flows from CDP SQL.
      - Social sentiment from X.com.
      - Cross‑market comparison from Polymarket.
    - Links to sources (URLs, tx hashes, tweet links, etc.).

**Section C – Execution summary (lightweight)**

- Keep this **very simple** on the dashboard:
  - "Agent position" (e.g. `+750 YES` / `Flat`).
  - "Last action" (e.g. `Rebalanced 3m ago`, `No recent trades`).
- We **do not** rebuild the full order book or tick-by-tick feed here.
- If we want to show exact recent trades the agent placed, the browser extension overlay will handle that directly on top of the native Limitless/Polymarket UI.

**Section D – Controls**

- Primary actions:
  - `Recompute fair price` – triggers fast agent run.
  - `Auto-rebalance` – triggers backend order placement with institution wallet. On success, the "Agent position" and "Last action" fields update.
- Secondary actions:
  - `Simulate rebalance` – show what orders would be placed without actually hitting the chain (safe mode for demo).
  - `Open in Limitless`.
- Primary actions:
  - `Recompute fair price` – triggers fast agent run.
  - `Auto‑rebalance` – triggers backend order placement with institution wallet. On success, new **agent orders** appear in the Order flow and the "Agent position / last action" field updates.
- Secondary actions:
  - `Simulate rebalance` – show what orders would be placed without actually hitting the chain (safe mode for demo).
  - `Open in Limitless`.
- Primary actions:
  - `Recompute fair price` – triggers fast agent run.
  - `Auto‑rebalance` – triggers backend order placement with institution wallet.
- Secondary actions:
  - `Simulate rebalance` – show what orders would be placed without actually hitting the chain (safe mode for demo).
  - `Open in Limitless`.

### Interactions

- Recompute:
  - Button → full‑page toast "Computing fair price…".
  - Optimistic UI showing a pending run at bottom of the runs list.
  - When done, chart updates, top stats update, new run appears at top.
- Auto‑rebalance:
  - In demo: show modal preview of the orders (what we’ll bid/ask).
  - Confirm → call backend; show status and any resulting position.

### API contracts (suggested)

- `GET /markets/:id`
- `GET /markets/:id/history` (live + AIMM price series)
- `GET /markets/:id/runs`
- `POST /markets/:id/rebalance` (simulate or execute based on flag)

---

## 5. Screen 3 – Judge / Sponsor View (Optional)

A lightweight "story" tab to make the sponsor narrative obvious.

- Tabs: `Overview | Signals | Infrastructure`.
- Show:
  - Which sponsors we integrate:
    - Base (Limitless markets + CDP SQL/x402).
    - Pyth (price feeds used in fair price calc).
    - Chainlink (CRE / DON for scheduled runs or verifiable reports).
  - Short textual explainer + tiny diagrams.

This is mostly static content, but makes it easy to answer "how are you using [Sponsor]?" by just clicking a tab.

---

## 6. Browser Extension Overlay (Stretch)

Minimal but real:

### Surfaces

- When user visits a supported market on Limitless/Polymarket:
  - Inject a small floating panel in the page corner showing:
    - Live price.
    - AIMM fair price.
    - Δ mispricing.
    - **Last agent action** (e.g. "Bought 500 YES @ 0.61" or "Flat").
  - Buttons:
    - `Recompute` – hits same `/markets/:id/recompute` endpoint.
    - `Open dashboard` – deep link to Market Detail page in the web app.

### Implementation sketch

- Use WXT or Plasmo + React.
- Extension should have **its own wallet connection flow** (we can reuse the same wagmi/viem setup as the web app):
  - Either a small dedicated "popup" or "options" page where the user connects their wallet once.
  - Store address/session so that content scripts can call the backend with the correct identity.
- Content script:
  - Detect current market slug/id from URL.
  - Call our backend `GET /markets/:id` with the connected wallet context (or a session token derived from it), including agent position / last orders summary.
- UI in-page remains simple (small panel + two buttons), but **wallet connection is required** at least once so the extension can show the right markets / positions for that user/institution.

---

## 7. Tech Stack

- **Framework:** Next.js (App Router) + React + TypeScript.
- **Styling:** Tailwind CSS.
- **Data fetching:** TanStack Query (React Query) for REST APIs.
- **Charts:** Recharts or similar lightweight lib.
- **State management:** Only React Query + local component state; no Redux.
- **Wallet / chain:** Wagmi + Viem for any on‑chain reads we must do from frontend (can be minimal or stubbed; most logic is backend/CRE).

---

## 8. Frontend mocks & replacement checklist

### Where mocks live (apps/web)

- `lib/mock-data.ts`  
  - **What it is**: hard-coded `mockMarkets: Market[]` powering the Markets Overview table and detail route lookup.
  - **Used by**: `app/page.tsx` (via `MarketsTable`), `app/markets/[id]/page.tsx`.
  - **Replace with**: real markets list from the AIMM indexer / backend (e.g. `GET /markets` or SDK hook).

- `lib/mock-market-detail.ts`  
  - **What it is**: seeded `MarketDetailData` (price history, runs, order book, trades) for the Market Detail screen.
  - **Used by**: `app/markets/[id]/page.tsx`, `components/market-detail/market-detail-view.tsx`.
  - **Replace with**: detail endpoint(s) from the backend (e.g. `GET /markets/:id`, `/history`, `/runs`).

- `components/auth-gate.tsx`  
  - **What it is**: localStorage-based simulation of an AIMM vault balance and onboarding.
  - **Used by**: wraps the authenticated dashboard layout.
  - **Replace with**: real on-chain read of vault balances and onboarding flow.

### Conventions

- Every mock module:
  - Has `mock` in the filename or export name (e.g. `mock-data.ts`, `mock-market-detail.ts`, `mockMarkets`).
  - Starts with a `// MOCK DATA: ...` header describing what it fakes and what should replace it.
- Every component / route that depends on mocks includes a `// MOCK: ...` comment next to the key usage:
  - Example: imports of `mockMarkets` / `getMarketDetailData` in `app/markets/[id]/page.tsx`.
  - Example: the localStorage-based vault balance logic in `components/auth-gate.tsx`.

You can reliably find all current mocks by grepping for `MOCK DATA:` and `// MOCK:` in `apps/web`.

### Replacement checklist

When wiring real data:

1. **Search for mock modules**
   - Find all usages of `mockMarkets` and `getMarketDetailData`.
   - Replace them with real SDK hooks or typed API clients that call the AIMM backend / indexer.
2. **Search for `// MOCK:` comments**
   - For each occurrence, replace the mocked behavior with a real integration (API call, on-chain read, etc.).
3. **Delete mock modules once replaced**
   - Remove `lib/mock-data.ts` and `lib/mock-market-detail.ts` after all references are gone.
4. **Tighten AuthGate**
   - Replace the localStorage simulation with an actual vault balance check and onboarding flow.

---

## 9. Nice‑to‑Have UX Bits (Time‑boxed)

- Toasts for long‑running operations with live status.
- "Demo mode" toggle that filters to curated markets.
- A tiny badge showing which signals were used in the latest AI run (e.g., Pyth, X, CDP).
