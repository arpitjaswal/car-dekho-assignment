# CarMatch — AI Car Matchmaker for the Indian Market

A full-stack MVP that takes a buyer's 4-question profile and returns the top 3 matching Indian cars, scored deterministically and explained by Gemini AI.

---

## What This Is

CarMatch asks four questions — budget, family size, primary usage, and top priority — runs every answer through a weighted scoring engine across a curated dataset of 50 Indian cars, and returns the top 3 matches with a breakdown of why each car scored the way it did. A Gemini-powered explanation then contextualises the picks in plain, conversational Indian-market prose.

Every search is persisted to a flat JSON file on the backend, accessible via a history page that lets you re-open any past result.

---

## Running Locally

### Prerequisites

- Node.js 18+
- A Gemini API key — get one free at [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)

### 1. Clone and install

```bash
# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
```

### 2. Environment variables

**Backend — create `server/.env`:**
```
GEMINI_API_KEY=your_gemini_api_key_here
PORT=3001
```

**Frontend — create `client/.env`:**
```
VITE_API_URL=http://localhost:3001
```

Both `.env.example` files are included as templates.

### 3. Run

Open two terminals:

```bash
# Terminal 1 — backend (port 3001)
cd server
npm run dev

# Terminal 2 — frontend (port 5173)
cd client
npm run dev
```

Open `http://localhost:5173`.

### Verify the backend is up

```bash
curl http://localhost:3001/api/health
```

### Test the match endpoint directly

```bash
curl -X POST http://localhost:3001/api/match \
  -H "Content-Type: application/json" \
  -d '{"budget":"5to10L","familySize":"small","usage":"cityCommute","priority":"safety"}'
```

---

## Tech Stack

| Layer | Choice | Why |
|---|---|---|
| Frontend framework | React 19 + Vite 8 | Fast HMR, ES module-native, no config overhead |
| Styling | Tailwind CSS v4 + inline styles | Tailwind for layout; inline styles for the design-system CSS variables |
| Routing | React Router v7 | File-based routing with typed state passing between pages |
| HTTP client | Axios | Cleaner than fetch for error handling; easy base URL config |
| Icons | Lucide React | Consistent, tree-shakeable SVG icons |
| Backend | Node.js + Express 5 | Minimal, familiar, fast to stand up |
| AI | Google Gemini 2.5 Flash Lite | Fast inference, available on free tier, good at structured prompts |
| Persistence | Flat JSON file (`data/history.json`) | Zero infrastructure for MVP; swappable for a DB later |
| Car data | Hand-curated JSON (50 cars) | No external API dependency; full control over scoring attributes |

---

## Architecture

```
client/
  src/
    pages/
      Questionnaire.jsx   # 4-step form → collects budget, familySize, usage, priority
      Results.jsx         # Displays top 3 cars + Gemini explanation
      History.jsx         # Lists all past searches from /api/history
    components/
      Navbar.jsx          # Shared nav with active-link highlighting

server/
  data/
    cars.json             # 50 Indian cars with price, mileage, safety, bodyType etc.
    history.json          # Auto-created; append-only search log (max 50 entries)
  routes/
    match.js              # POST /api/match — orchestrates scorer → gemini → response
    history.js            # GET /api/history — reads history.json
  services/
    scorer.js             # Deterministic scoring engine
    geminiService.js      # Gemini prompt construction + API call
    historyService.js     # Read/write history.json
```

### Request flow

```
User submits quiz
  → POST /api/match { budget, familySize, usage, priority }
      → scorer.js scores all 50 cars, returns top 3 with breakdown
      → geminiService.js sends buyer profile + top 3 to Gemini
      → historyService.js writes entry to history.json
  ← { recommendations, explanation, searchId, totalCarsScored }
      → navigate('/results', { state: data })
```

---

## Scoring Engine

Every car is scored out of **100 points** across four dimensions:

| Dimension | Max pts | Logic |
|---|---|---|
| **Budget** | 30 | Within range → 30 · Up to 10% over → 15 · Over → 0 |
| **Safety** | 30 | `(ncapStars / 5) × 30` — linear NCAP scale |
| **Mileage** | 25 | Tiered: ≥25 kmpl or ≥500 km EV range = 25, scales down |
| **Family Friendly** | 15 | Solo/couple: non-family cars score 15 · Family users: FF car = 15, non-FF = 0 |

The engine is fully deterministic — same inputs always produce the same ranking. No randomness, no LLM in the scoring loop.

### Why deterministic scoring instead of asking Gemini to rank?

LLMs are non-deterministic and can hallucinate car specs. Keeping scoring as pure arithmetic makes the results trustworthy, explainable, and debuggable. Gemini is only used *after* the ranking is decided, strictly for prose generation.

---

## AI Usage (Gemini)

Gemini 2.5 Flash Lite is called once per search, after the top 3 are already determined. It receives:

- The buyer's four answers (with human-readable labels)
- The top 3 car names, prices, mileage, safety, and match scores

It returns 3–4 sentences of conversational explanation grounded in Indian driving conditions (traffic, fuel prices, road types). The call is **non-fatal** — if Gemini fails or is slow, the recommendations still return without the explanation.

The model client is **lazily initialised** inside the service function (not at module load time) to avoid ES module hoisting issues where `process.env.GEMINI_API_KEY` would be undefined before `dotenv.config()` runs.

---

## What We Cut (and Why)

| Feature | Decision |
|---|---|
| **User accounts / auth** | No value for an MVP; history works without login via server-side JSON |
| **Database (Postgres/Mongo)** | Flat JSON file is sufficient for a demo; adds zero infra |
| **Real-time car pricing API** | Prices change; a curated static dataset is more reliable and offline-capable |
| **Image assets per car** | Adds complexity with no scoring value; design uses data-forward cards instead |
| **Fuel type as a separate question** | Consolidated into bodyType scoring to keep the quiz at 4 questions — fewer questions = better completion rate |
| **shadcn/ui component library** | Avoided extra abstraction; design system built entirely with Tailwind + CSS variables |
| **Redux / Zustand** | React Router's `navigate(path, { state })` is sufficient for passing results between two pages |

---

## Design Decisions

### Indian-market focus
All prices in INR (₹), mileage in kmpl (or km/charge for EVs), safety ratings from Global NCAP India tests, and 50 cars selected specifically from what is actually sold in India (no global-only models).

### API URL via environment variable
The frontend never hardcodes `localhost`. `VITE_API_URL` is read from `.env` so the same build works in dev, staging, and production without code changes.

### ES modules throughout
Both frontend and backend use `"type": "module"` / `import/export`. `dotenv` is loaded with an explicit `__dirname`-relative path to ensure `.env` is found regardless of which directory `npm run dev` is run from.

### `history.json` max 50 entries
Keeps the file small and the history endpoint fast without a database. Oldest entries are silently dropped when the limit is hit.

---

## Future Improvements

### Scoring & Recommendations
- **Weighted priorities** — if a user picks "safety" as their top priority, multiply the safety dimension score by 1.5× rather than treating all four dimensions as equal weight
- **Fuel type as a scored dimension** — add a 5th question and dedicate 10 pts to petrol/diesel/hybrid/electric matching
- **Seating capacity filter** — hard-exclude cars that physically can't seat the family size before scoring
- **On-road price estimation** — add ex-showroom vs on-road delta per city so budget matching is more accurate
- **Normalised mileage scoring** — currently uses fixed tiers; a continuous function would reward marginal mileage improvements more fairly

### Data
- **Auto-refresh car prices** — scrape or connect to a pricing API and update `cars.json` periodically
- **Expand dataset** — 50 cars covers the mainstream; adding commercial vehicles, luxury imports, and upcoming launches would improve coverage
- **User reviews / ownership cost data** — integrate real-world fuel cost and service cost data rather than the current Low/Medium/High buckets

### Product
- **Compare mode** — let users pick two cars from their results and see a side-by-side breakdown
- **Share results** — generate a shareable URL from the `searchId` so users can send their match to someone else
- **Saved favourites** — bookmark specific cars across searches
- **Dealer integration** — surface nearby dealers or test-drive booking links for the top match
- **Multilingual support** — Hindi and regional language explanations from Gemini

### Infrastructure
- **Persistent DB** — replace `history.json` with SQLite (zero infra, still file-based) or Postgres for multi-user deployments
- **Rate limiting** — add express-rate-limit on `/api/match` to protect Gemini API quota in production
- **Caching** — cache Gemini responses for identical answer sets (same 4 answers = same explanation)
- **Deploy** — Frontend to Vercel, backend to Railway or Render; `VITE_API_URL` switches automatically via environment

---

## Project Structure

```
car-matchmaker/
├── client/                   # React + Vite frontend
│   ├── src/
│   │   ├── components/
│   │   │   └── Navbar.jsx
│   │   ├── pages/
│   │   │   ├── Questionnaire.jsx
│   │   │   ├── Results.jsx
│   │   │   └── History.jsx
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css         # Tailwind + CSS design tokens
│   ├── .env                  # VITE_API_URL (git-ignored)
│   └── .env.example
└── server/                   # Node.js + Express backend
    ├── data/
    │   ├── cars.json          # 50 Indian cars dataset
    │   └── history.json       # Auto-created on first search
    ├── routes/
    │   ├── match.js           # POST /api/match
    │   └── history.js         # GET /api/history
    ├── services/
    │   ├── scorer.js          # Deterministic 100-pt engine
    │   ├── geminiService.js   # Gemini explanation
    │   └── historyService.js  # JSON persistence
    ├── server.js
    ├── .env                   # GEMINI_API_KEY (git-ignored)
    └── .env.example
```
