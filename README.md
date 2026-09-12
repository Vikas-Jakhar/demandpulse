# DemandPulse

Enterprise demand forecasting SaaS platform: upload sales history, get a
statistically-fitted forecast with confidence bands, safety-stock/reorder-point
recommendations, and an AI copilot that explains what the chart is doing —
grounded in the numbers actually on screen.

## The Champion Model paradigm

The main dashboard shows exactly **one** forecast line — never a lineup of
competing models. Behind the scenes, four candidate algorithms are backtested
on a held-out validation window and ranked by lowest WAPE; the winner (the
"champion") is refit on the full history and is the only thing the primary
screen ever renders. A small, dismissible badge on the chart header names the
champion and its backtested accuracy, with a link into a secondary **Model
Diagnostics & Benchmarks** drawer — the one place in the app a user can see
the losing candidates, a multi-model overlay chart, and a residual
distribution. See `lib/forecasting/selector.ts` for where that split is
enforced at the data layer, not just in the UI.

## Stack

Next.js 14 (App Router, Route Handlers), TypeScript, Tailwind CSS, Zustand,
Recharts, Lucide React, PapaParse + SheetJS, Prisma, `jose` for JWT sessions,
Anthropic SDK for the copilot.

## Getting started

```bash
npm install
cp .env.example .env.local     # fill in SESSION_SECRET, DATABASE_URL, ANTHROPIC_API_KEY
openssl rand -base64 32        # → paste into SESSION_SECRET

# Point DATABASE_URL at a real Postgres instance, then:
npm run db:generate            # generate the Prisma client
npm run db:migrate             # create the schema (prompts for a migration name the first time)
npm run db:seed                # creates the demo account referenced below

npm run dev
```

Visit `/login` and sign in with the seeded demo account
(`admin@demandpulse.io` / `demopass123`), create a real account at
`/signup`, or click **Continue as guest** on the login page — guest mode
issues a signed session with no database row, so it works even before
you've run the migration/seed steps above. The dashboard loads a generated
sample dataset automatically so there's something to look at either way.

`npm run db:studio` opens Prisma Studio if you want to browse the `User`
table directly.

## Project structure

```
app/
  page.tsx                    Landing page (redirects to /dashboard if signed in)
  login/, signup/, forgot-password/   Auth pages (Module A)
  dashboard/
    page.tsx                  Server component: session check
    DashboardClient.tsx        Client shell — reads ONLY `champion` from the store for
                                anything on the primary screen; `diagnostics` is threaded
                                to the drawer and nowhere else
  api/
    auth/{login,guest,logout}/route.ts
    forecast/route.ts          Runs the Champion Model pipeline (Module C) — returns
                                separate `champion` and `diagnostics` keys
    copilot/route.ts            Grounded LLM chat endpoint (Module E), champion-only by default
    export/route.ts             CSV/XLSX export (Module D)

components/
  ui/                         Button, Card (shadcn-style primitives)
  ingestion/FileUpload.tsx     Drag-and-drop + column mapping + cleaning options (Module B)
  dashboard/
    KPICards.tsx               Business-facing KPIs ("Forecast Reliability", not raw MAPE)
    ForecastChart.tsx          Single-line hero chart with CI bands + the champion badge
    ChampionModelBadge.tsx     The one place the model name appears on the main dashboard
    ModelDiagnostics.tsx        Secondary audit drawer: benchmark table, overlay chart, residuals
    ScenarioSlider.tsx, FilterBar.tsx
  copilot/CopilotPanel.tsx     Slide-out chat panel (Module E)

lib/
  auth/session.ts              JWT session issuance/verification
  ai/context.ts                 Builds champion-only copilot grounding; benchmarks held in
                                 reserve for "why was this model chosen?" questions only
  forecasting/
    holt-winters.ts            Triple Exponential Smoothing engine (the core math)
    candidates.ts               All four candidate model runners (HW additive/multiplicative,
                                 seasonal weighted moving average, linear trend baseline)
    backtest.ts                 Holdout split + per-candidate scoring against real actuals
    selector.ts                  THE Champion Model pipeline: backtest → rank by WAPE →
                                  refit winner on full data → package champion + diagnostics
    metrics.ts                  MAPE / RMSE / MAE / WAPE / Bias / Tracking Signal
    safety-stock.ts             Safety stock + reorder point
    external-model.ts           Contract for plugging in Prophet/XGBoost/LightGBM as a candidate
  ingestion/
    parser.ts                  CSV/XLSX parsing + validation
    column-detector.ts          Auto column-mapping heuristics
    cleaning.ts                 Imputation, outlier handling, frequency resampling
  store/useAppStore.ts          Zustand global state — `champion` vs `diagnostics` kept
                                 as separate fields on purpose
  mock-data.ts                 Seeded sample dataset generator

middleware.ts                  Gatekeeps /dashboard/* and protected API routes
prisma/schema.prisma            User, Organization, Dataset, DatasetPoint, ForecastRun
types/index.ts                  Shared domain types, incl. ChampionPayload / DiagnosticsPayload
```

## How Champion Model selection works

`lib/forecasting/selector.ts` is the single entry point for `/api/forecast`
and runs four steps:

1. **Backtest** (`backtest.ts`): splits the series into a train slice and a
   held-out validation window (~20% of history, at least a couple of
   seasonal cycles), then runs every candidate on the train slice only.
2. **Candidates** (`candidates.ts`): Holt-Winters Additive, Holt-Winters
   Multiplicative, a Seasonal Weighted Moving Average (recent cycles
   weighted more heavily), and a Linear Trend baseline — the last of which
   is deliberately the slot where an external Prophet/Auto-ARIMA/XGBoost
   microservice call (`external-model.ts`) would plug in without changing
   the selector's ranking logic.
3. **Rank**: each candidate's holdout predictions are scored against the
   real holdout actuals via `metrics.ts` (MAPE/RMSE/MAE/WAPE/Bias/Tracking
   Signal); `Winner = argmin(WAPE)` by default, configurable via
   `SelectionCriteria.primaryMetric`.
4. **Refit & package**: the winning model is refit on the *full* series
   (train + holdout combined) to produce the production forecast, with
   confidence bands widening by `sqrt(h)` per step ahead. The result is
   split into two objects that never merge:
   - `ChampionPayload` — the only thing `DashboardClient.tsx` renders from.
   - `DiagnosticsPayload` — benchmark rows for every candidate (including
     the loser's holdout predictions), consumed exclusively by
     `ModelDiagnostics.tsx`.

The underlying Holt-Winters engine (`holt-winters.ts`) itself is unchanged
from a single-model implementation standpoint — it's still a from-scratch,
grid-search-fitted Triple Exponential Smoothing — it's just now one of four
candidates the selector chooses between rather than always winning by
default.

## AI Copilot grounding

`lib/ai/context.ts` builds the copilot's system prompt from the **champion's**
figures only by default — forecast reliability, predicted volume, safety
stock, recent anomalies — the same numbers on the dashboard, nothing more.
The full benchmark list is attached to the context object but the prompt
explicitly instructs the model not to volunteer it; it's only referenced if
the user asks "why was this model chosen?" or asks to compare models. This
mirrors the dashboard's own split: one clean channel by default, an audit
channel that only opens on request.

## Phase 3: Dataset ingestion → Postgres

Uploads now persist for real accounts. The flow:

1. `FileUpload.tsx` parses + auto-maps + cleans a file client-side exactly
   as before (`lib/ingestion/{parser,column-detector,cleaning}.ts` are
   unchanged) — that part was always fine to do in the browser.
2. The cleaned series is POSTed to `/api/datasets`, which validates it (zod,
   mirroring every field in `types/index.ts`) and calls `persistDataset()`
   (`lib/ingestion/persist.ts`): one `Dataset` row, then its `DatasetRow`
   children inserted in batches of 5,000 (Postgres's bound-parameter
   ceiling makes one giant `createMany` unsafe past a few tens of thousands
   of rows). If the row insert fails partway, the `Dataset` header is
   rolled back rather than left orphaned.
3. `GET /api/datasets` / `GET /api/datasets/[id]` / `DELETE
   /api/datasets/[id]` round out basic dataset access, each behind
   `requireDatasetOwnership()` from Phase 2. `SavedDatasetsList.tsx` is a
   deliberately minimal list/load/delete UI — just enough to prove the
   round-trip works, not the full history view Phase 8/9 will build.
4. **Guests never persist.** `isGuest` sessions get a 403 from `POST
   /api/datasets` (their session isn't backed by a real `User` row — see
   `guest/route.ts`), and `FileUpload` knows to skip the network call
   entirely for a guest and keep the upload local-only, with a small note
   explaining why.

One thing this phase intentionally does NOT store: per-row
`isImputed`/`isOutlier` flags. `DatasetRow`'s schema (Phase 1) only has
`(date, sku, demand)`, matching the spec given for it — the aggregate
counts still land in `Dataset.detectedColumns.cleaningReport`, just not
per-row provenance. Noted in `persist.ts` as an additive schema change if
that granularity is wanted later.

## Phase 4/5: Model lineup + auto-selection

The candidate lineup is now exactly five models, string-identical between
`CandidateModelId` (`types/index.ts`) and Prisma's `ForecastModel` enum so a
persisted `Forecast.selectedModel` never needs a translation table:

- `NAIVE` — seasonal naive (repeats the value from one cycle back). No
  fitting, no parameters. Exists because "nothing clever beats a fancier
  model on this series" is a real, useful thing for a backtest to tell you.
- `MOVING_AVERAGE` — seasonal weighted moving average.
- `HOLT_WINTERS_ADDITIVE` / `HOLT_WINTERS_MULTIPLICATIVE` — the from-scratch
  Triple Exponential Smoothing engine.
- `LINEAR_TREND_BASELINE` — OLS trend line; also the slot where an external
  Prophet/Auto-ARIMA microservice call would plug in (`external-model.ts`).

`Winner = argmin(WAPE)` by default (configurable via `primaryMetric`), same
pipeline as documented above — Phase 4/5 was mostly reconciling naming with
Phase 1's schema rather than new modeling work, since the champion-selection
pipeline already existed.

## Phase 6/7: Forecast persistence + inventory intelligence

`/api/forecast` now best-effort persists every run as a `Forecast` +
`ForecastPoint` history entry (`lib/forecasting/persist.ts`), scoped to the
user and the dataset it came from. "Best-effort" is load-bearing: a forecast
is still useful to see even when it can't be saved (guest session, or a
`datasetId` that isn't a real owned row — e.g. the auto-loaded demo
dataset), so persistence failing never fails the request; the response just
reports `persisted: false` and the UI shows a small "preview only" note.

One schema-driven limitation worth knowing: `ForecastPoint` is
`(date, predictedDemand, lowerBound, upperBound)` — one confidence band, no
historical actual/fitted overlay. A *live* run's chart has all of that; a
run reloaded from history later only has the projection. That's a Phase 1
schema decision, not a bug introduced here.

Lead time is now a real, adjustable input (`FilterBar.tsx`) instead of a
hardcoded `7`, feeding `calculateSafetyStock()` (unchanged from earlier —
z-score off the requested service level, combined with demand variability)
on every recompute.

## Phase 8/9: History views

- `GET /api/datasets` / `GET /api/datasets/[id]` / `DELETE
  /api/datasets/[id]` (Phase 3) paired with `SavedDatasetsList.tsx`
- `GET /api/forecasts` / `GET /api/forecasts/[id]` / `DELETE
  /api/forecasts/[id]` (new) paired with `ForecastHistoryDrawer.tsx`

Both UI components are deliberately minimal — list, load/view, delete — to
prove the persistence round-trips actually work end-to-end through the UI.
Neither is the full dataset/forecast management product a mature SaaS would
eventually want (search, filters, bulk actions, sharing); they're the
smallest surface that makes Phase 3/6's writes reachable and verifiable.

## Phase 10: Export reports

`/api/export` handles all three formats behind one `format` field:
`csv` and `xlsx` are unchanged from earlier (SheetJS), and `pdf` (new) uses
`pdfkit` to build a report — header, KPI summary, and a paginated forecast
table (capped at 120 rows per PDF; CSV/XLSX remain the right tool for a
full 365-day horizon's worth of rows). `FilterBar.tsx` exposes all three via
one export-format selector rather than three separate buttons.

**Known deployment gotcha, handled, not just noted:** pdfkit reads its
built-in font metrics from disk at runtime. Next.js's default serverless
bundling can break that relative path — `next.config.js` sets
`serverExternalPackages: ["pdfkit"]` specifically to route around it. If
PDF export 500s in a fresh deployment, that config line is the first thing
to check.

## Phase 11: AI Copilot

No changes beyond what already existed — the champion-only grounding
(`lib/ai/context.ts`) and the benchmark-on-request behavior were built
during the Champion Model UX pass and didn't need anything Phase 4–10
changed. `/api/copilot` now sits behind the same rate limiter as
`/api/forecast` (see Phase 12), since every call there is a paid Anthropic
API request.

## Phase 12: Production deployment prep

- **Rate limiting** (`lib/rate-limit.ts`) — an in-memory sliding window on
  `/api/copilot` (20/min/user) and `/api/forecast` (30/min/user). Documented
  in the file itself: this only works correctly on a **single server
  instance** — a multi-instance deploy gives each instance its own
  independent quota. Swapping in `@upstash/ratelimit` (Redis-backed) for
  real multi-instance production is a same-shaped drop-in, noted inline.
- **Health check** (`GET /api/health`) — unauthenticated, not in
  middleware's protected list, actually queries Postgres (`SELECT 1`)
  rather than returning a blind 200. Point your load balancer/orchestrator
  at this, not `/`.
- **Security headers** (`next.config.js`) — `X-Frame-Options`,
  `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, and
  HSTS, applied to every route.
- **Dockerfile** — multi-stage (deps → build → runtime), non-root user,
  relies on `output: "standalone"` (now set in `next.config.js`) for a
  minimal final image. `docker-compose.yml` pairs it with a real Postgres
  container for local testing — not the recommended production topology
  (point `DATABASE_URL` at a managed Postgres instance for that), just a
  faster local loop than installing Postgres on the host.

### Deploying

```bash
# Environment (see .env.example)
SESSION_SECRET=...            # openssl rand -base64 32
DATABASE_URL=...               # managed Postgres, not the compose container
ANTHROPIC_API_KEY=...

# Migrations: use `migrate deploy` in production, NOT `migrate dev` or
# `db push` — `deploy` applies existing migration files without prompting
# or attempting to reconcile schema drift, which is what you want in CI/CD.
npx prisma migrate deploy
npx prisma generate

npm run build
npm start
# or: docker compose up --build
```

`npm run db:seed` is a dev/demo convenience (creates the
`admin@demandpulse.io` account) — most teams will skip it in a real
production database.


## Notes on scope

This is a complete, coherent implementation of every phase, built to
compile and run as a real Next.js app. What's left as a clearly-marked,
deliberate stub rather than silently pretended-away:

- **Forgot-password is real** — token issuance (`lib/auth/reset-token.ts`),
  verification, and the password update itself (`/api/auth/reset-password`)
  all work end-to-end. Only the actual email *delivery*
  (`lib/email/send-password-reset.ts`) is a stub, and deliberately so: it
  requires picking a transactional-email provider and provisioning
  credentials, which isn't a decision this codebase should make for you. In
  development, the reset link just logs to the server console, so the full
  flow is testable right now without any provider configured.
- **Sessions are stateless JWTs, not database-backed.** No `Session` table,
  no per-request DB lookup, but also no way to revoke a token before its
  8-hour expiry. Add a `Session` model keyed by token ID if you need
  force-logout-everywhere or admin-initiated revocation later.
- **Guest mode's `userId` isn't a real `User` row.** Fine for browsing with
  mock data; it's why `/api/datasets` and forecast persistence both reject
  guest sessions outright rather than trying and hitting a foreign-key
  violation.
- **Rate limiting is single-instance only** (`lib/rate-limit.ts`) — a
  documented tradeoff, not an oversight; see the file for the Redis-backed
  swap-in path for real multi-instance production traffic.
- **External ML model**: contract-only (`external-model.ts`) — the in-app
  candidates are the default and always-available path; wiring a real
  Prophet/Auto-ARIMA service in as a fifth candidate is a matter of calling
  `callExternalForecastModel` from `candidates.ts` and letting the selector
  backtest it like any other.
- **Trend/seasonal decomposition** (`DecompositionChart.tsx`) is still in
  the repo but intentionally not rendered on the main dashboard under the
  Champion Model rule. A natural candidate to add to `ModelDiagnostics.tsx`
  if you want it back.

## Testing

```bash
npm run test        # runs the full suite once
npm run test:watch  # re-runs on file change
```

Coverage focuses on `lib/forecasting/` and `lib/ingestion/cleaning.ts` —
where this app's actual value (and actual risk of a silently wrong number)
lives — rather than chasing coverage percentage on UI components. Property
-based assertions (band widths grow with horizon, safety stock grows with
service level, a perfect linear trend extrapolates exactly) are used
wherever a test can check a real invariant instead of a brittle exact-value
snapshot.

**Writing this test suite caught a real bug**, which is exactly the point
of writing one: `runSeasonalMovingAverageCandidate`'s recency-weighting had
an indexing error that gave *older* seasonal cycles more weight than
*newer* ones — the opposite of its own documented intent, and the opposite
of what its already-correct sibling function
(`fitSeasonalMovingAverageInSample`) did. It's fixed now (`candidates.ts`),
and the fix is what the corresponding test asserts against. Flagging this
here rather than quietly folding it in, since "found and fixed a bug while
adding tests" is a meaningfully different claim than "added tests to
already-correct code."

I wasn't able to actually execute this suite in the sandbox this was built
in — no network access to `npm install` the test runner — so treat `npm run
test` as the first thing to run after installing dependencies, not a
formality. Every assertion was hand-traced against the actual implementation
logic before being written, but hand-tracing isn't a substitute for a green
test run.
