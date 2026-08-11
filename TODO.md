# Clariolane — Improvements & Optimizations

Findings from a codebase audit on 2026-08-04. Each item includes the evidence found and a concrete recommendation. Ordered roughly by priority within each section.

---

## 🔴 System Design / Data Integrity (highest priority)

- [x] **`practice/session` edge function is a non-atomic, multi-step saga.** ([supabase/functions/practice/index.ts](supabase/functions/practice/index.ts))
  A single "save session" request does ~10+ sequential network round trips: read `users` → read `user_stats` → insert `practice_sessions` → RPC `calculate_session_xp` → RPC `calculate_level` → update `users` (streak) → RPC `upsert_user_stats` → fetch **all** quests → **loop** (read + upsert per quest, awaited one at a time) → RPC `update_avg_scores` → RPC `check_and_unlock_achievements`.
  **Risk:** if any step fails after an earlier write committed, the user ends up in a partial state (e.g. session recorded but XP/streak never applied, or a retry double-awards XP — there's no idempotency key). Two sessions submitted close together can also race on the read-then-write of `user_stats`/`users` (lost updates).
  **Recommendation:** Collapse this into a single Postgres function (e.g. `record_practice_session(...)`) invoked via one RPC call, executed inside one transaction. This fixes atomicity and cuts ~10-15 round trips down to 1, which will also meaningfully reduce edge-function latency.
  **Done:** Added `record_practice_session()` ([supabase/migrations/20260811213809_record_practice_session.sql](supabase/migrations/20260811213809_record_practice_session.sql), mirrored in [supabase/schemas/zz_record_practice_session.sql](supabase/schemas/zz_record_practice_session.sql)) — one `SECURITY DEFINER` RPC, one transaction, `FOR UPDATE` locks on `users`/`user_stats` to close the lost-update race, and a `(user_id, exercise_id, start_time)` dedup key + new `practice_sessions.xp_earned` column so a retried request returns the original result instead of double-awarding XP. Uses `auth.uid()` internally rather than a client-supplied user id (the old `upsert_user_stats`-style pattern of trusting a passed-in `_user_id` would let any authenticated caller record sessions for another user directly over PostgREST — flagged separately below). The edge function ([supabase/functions/practice/index.ts](supabase/functions/practice/index.ts)) now makes exactly one RPC call. Verified functionally against a scratch local Postgres loaded with the real schema files (atomicity-on-failure, idempotent retry, streak/quest/achievement math all checked) since Docker wasn't available locally to run `supabase start`/`db diff` — please run those before deploying.

- [x] **N+1 query loop over quests.** ([supabase/functions/practice/index.ts](supabase/functions/practice/index.ts) — the `for (const quest of allQuests)` block)
  For every session save, the function does 2 sequential DB calls *per quest* (`select` then `upsert`), awaited one at a time instead of batched. This scales linearly with quest count and adds latency to every single practice session completion — the most frequent write in the app.
  **Recommendation:** Replace with a single bulk upsert (SQL `INSERT ... ON CONFLICT` from a CTE/JOIN across all quests at once), ideally folded into the same transactional RPC from the item above.
  **Done:** Folded into `record_practice_session()` above — a single `INSERT ... SELECT ... ON CONFLICT` over a `quest_progress` CTE joins all quests against `user_quests` in one statement instead of looping.

- [ ] **Errors are swallowed into a generic message with no observability.** (all `supabase/functions/*/index.ts` catch blocks, e.g. `{ success: false, message: "Something went wrong" }`)
  Only `console.error` is used — there's no error-tracking/APM integration anywhere in the repo (no Sentry, no structured logging). When something breaks in production (e.g. the saga above fails halfway), there's no way to know which step failed or for which user without manually digging through Supabase function logs.
  **Recommendation:** Add a lightweight error-tracking integration (e.g. Sentry's Deno/edge SDK) and include enough context (user id, step name) in logged errors to debug production incidents.

---

## 🟠 Performance

- [ ] **Main JS bundle is 1.69 MB (503 KB gzipped) despite route-based code-splitting.** Verified by running `npx vite build`:
  ```
  dist/assets/index-B613SGJu.js   1,690.04 kB │ gzip: 503.15 kB
  (!) Some chunks are larger than 500 kB after minification.
  ```
  `tanstackRouter({ autoCodeSplitting: true })` is already enabled, so per-route chunks exist, but shared/vendor code (likely `recharts`, `framer-motion`/`motion`, the full Radix UI set, `canvas-confetti`, `react-confetti-boom`) is all landing in one giant chunk loaded on every page, including the marketing landing page.
  **Recommendation:** Add `build.rollupOptions.output.manualChunks` to split heavy libs into their own chunks, and `React.lazy()`-load chart/confetti components so they only load on the progress/victory-screen routes that actually use them, not on first paint of the landing page.

- [ ] **Duplicate animation libraries: both `framer-motion` and `motion` are dependencies.** ([package.json](package.json) lines 44 & 46)
  These are the same underlying engine (published by the same team) — shipping both very likely duplicates runtime code in the bundle for no benefit.
  **Recommendation:** Standardize on one (`motion` is the current canonical package name) and remove the other; grep for imports of the removed package and migrate them.

- [ ] **PWA precache ballooned to 9.2 MB across 50 entries**, and `maximumFileSizeToCacheInBytes` was manually raised to 5 MB in [vite.config.ts](vite.config.ts) with the comment "to handle full-fidelity SVGs" — i.e. the cache limit was raised to work around unoptimized assets rather than optimizing them.
  **Recommendation:** Run SVGs/images through an optimizer (svgo / vite-imagetools) and revert the inflated cache limit. Precaching multiple megabytes on first load hurts install time, especially on mobile connections — exactly the audience a "read faster" app should care about.

- [ ] **Devtools are rendered unconditionally in the root route.** ([src/routes/__root.tsx:155-156](src/routes/__root.tsx#L155-L156)) `<TanStackRouterDevtools>` and `<ReactQueryDevtools>` aren't gated behind `import.meta.env.DEV`. These libraries no-op most of their cost in production builds, but it's not guaranteed and it's a one-line fix to make the intent explicit and guarantee zero prod cost.

---

## 🟡 Database & Migrations Hygiene

- [ ] **8 of 37 migrations are "fix" migrations correcting earlier ones**, several touching the *same* bug repeatedly:
  - `achievement_id` ambiguity fixed 3 separate times: `20251203062637_fix_achievement_permissions.sql`, `20251208000000_fix_ambiguous_achievement_id.sql`, `20251212065703_fix_achievement_id_ambiguity_again.sql`, `20260202180000_fix_ambiguous_achievement_id_final.sql`
  - `user_stats` RLS policy added/fixed/restored/re-fixed 4 times across `20251203230000`, `20251208000001`, `20251212065251`, `20260202170000`
  This pattern strongly suggests migrations are being written and pushed directly without a local test pass first.
  **Recommendation:** Adopt the `supabase start` local dev loop + `supabase db diff` before pushing any migration touching RLS or function signatures. The repo already has `supabase/schemas/` as a declarative source of truth — lean into the declarative-schema + diff workflow fully rather than hand-writing incremental patches. Now that the schema has stabilized, consider a one-time squash of the migration history.

---

## 🟢 Code Quality & Consistency

- [ ] **Zero automated tests.** No `*.test.*`/`*.spec.*` files exist anywhere in `src`, no test runner is configured, and there's no `test` script in [package.json](package.json). This app computes XP/leveling/streak/comprehension-multiplier logic and handles Paystack subscription webhooks — exactly the kind of logic that regresses silently without tests.
  **Recommendation:** Add Vitest and start with the highest-value, easiest-to-break logic: XP/level calculation, streak calculation (`updateStreak` in [supabase/functions/practice/index.ts](supabase/functions/practice/index.ts)), and the RSVP/word-chunking timing math in `src/store/practice` and `src/components/exercises`.

- [ ] **A few call sites bypass the integration/query layer** and call the Supabase client directly instead of going through `src/integration/queries`/`mutations`:
  - [src/components/exercises/shared/useSyncDisplaySettings.ts:17](src/components/exercises/shared/useSyncDisplaySettings.ts#L17)
  - [src/components/exercises/shared/ComprehensionQuiz.tsx:174](src/components/exercises/shared/ComprehensionQuiz.tsx#L174)
  - [src/hooks/use-claim-quest.ts:12](src/hooks/use-claim-quest.ts#L12)
  This is inconsistent with the rest of the app's data-fetching pattern (TanStack Query wrapping a dedicated queries/mutations layer) and makes it harder to apply uniform caching/error handling later.
  **Recommendation:** Route these through the existing `integration/queries`/`mutations` layer for consistency.

- [ ] **28 occurrences of `: any` / `as any` in `src/`** despite `strict: true` in [tsconfig.app.json](tsconfig.app.json). Worth an audit pass to see which are load-bearing (e.g. third-party type gaps) vs. avoidable.

- [ ] **Loosely-typed Hono handlers in edge functions.** [supabase/functions/practice/index.ts:1](supabase/functions/practice/index.ts#L1) opens with `// deno-lint-ignore-file no-explicit-any` and every route handler is typed `(c: any)`, discarding Hono's built-in request/response type safety.

---

## ⚪ Housekeeping

- [ ] **Remove `build_log.txt` from the repo.** It's a stray `pnpm build` log (62 lines) sitting at the repo root, and it's already stale/misleading — it documents a Rolldown/`react-is` resolution failure that no longer reproduces (confirmed via a fresh `npx vite build`, which now succeeds; `react-is` is already a direct dependency). Delete it and add `build_log.txt` to `.gitignore`.
- [ ] **Verify `deno.lock` at the repo root is still the file Supabase Edge Runtime actually uses.** The Deno edge functions live under `supabase/functions/`; double-check this root-level lockfile isn't orphaned/stale relative to that directory.

---

## Noted as already solid (no action needed)
- `.env` is correctly gitignored and not tracked in git history.
- `paystack-webhook` verifies the `x-paystack-signature` header via HMAC-SHA512 before trusting the payload ([supabase/functions/paystack-webhook/index.ts:52-59](supabase/functions/paystack-webhook/index.ts#L52-L59)) and correctly uses the service-role key only where a server-to-server webhook needs it, while other functions use the anon key + RLS for least-privilege, per-user access.
