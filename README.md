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
npm run db:generate && npm run db:push   # once DATABASE_URL points at a real Postgres instance
npm run dev
```

Visit `/login` and either sign in with the seeded demo admin
(`admin@demandpulse.io` / `demopass123`) or click **Continue as guest** —
no database or credentials required for the guest path. The dashboard loads
a generated sample dataset automatically so there's something to look at
before you upload your own file.

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

## Notes on scope

This is a complete, coherent implementation of every module in the brief,
built to compile and run as a real Next.js app rather than a diagram of one.
A few things intentionally stay as clearly-marked stubs so you can wire them
to your own infrastructure instead of a second guess of it:

- **Database**: Prisma schema is complete; the demo auth routes use an
  in-memory user array so the app runs without a Postgres instance. Swap the
  `DEMO_USERS` lookup in `app/api/auth/login/route.ts` for
  `prisma.user.findUnique(...)` once `DATABASE_URL` is live.
- **Signup / forgot-password**: UI and expected request shape are complete;
  the submit handlers currently fall back to guest-session issuance rather
  than sending real emails, since that requires a transactional-email
  provider choice that's yours to make.
- **External ML model**: contract-only, per the "API contract and
  microservice wrapper" requirement — the in-app candidates are the default
  and always-available path; wiring a real external model in as a fifth
  candidate is a matter of calling `callExternalForecastModel` from
  `candidates.ts` and letting the selector backtest it like any other.
- **Trend/seasonal decomposition**: the component (`DecompositionChart.tsx`)
  is still in the repo but intentionally not rendered on the main dashboard
  under the Champion Model rule — decomposing the champion's internals is
  arguably audit-adjacent detail, not a business KPI. It's a natural
  candidate to add to `ModelDiagnostics.tsx` if you want it back.
