# Clariolane — Feature Ideas

A backlog of feature suggestions, grounded in a read-through of the current codebase (2026-08-12). Grouped by theme, not priority — pick what's worth doing, not a proposed roadmap.

---

## Close the loop on what's already collected

These aren't new ideas — they're places the product already asks the user for something and then doesn't act on it.

- [x] **Filter passage selection by preferred content type.** Onboarding collects `content_type` (fiction / non-fiction / mixed via [content-type.tsx](src/components/onboarding/preferences/content-type.tsx)), but `GET /practice/passage` ([supabase/functions/practice/index.ts](supabase/functions/practice/index.ts)) picks a random passage from the whole table regardless of it. Wire the preference into passage selection.
  **Done:** This needed a prerequisite fix to actually mean anything. `content_type` (and `goals`/`challenges`) are typed as arrays on the frontend (`OnboardingSchema`) but the `users` columns were plain `text`, and `userMutation.ts` inserts via a blind `as unknown as UserTable` cast with no runtime conversion — so a selection like `["fiction","technology"]` was landing in the database as the literal string `'["fiction","technology"]'`, confirmed against a real local Supabase instance. Migration [20260811234608_fix_user_preference_array_columns.sql](supabase/migrations/20260811234608_fix_user_preference_array_columns.sql) converts all three columns to `text[]` (with a defensive `USING` clause covering the three shapes existing data could be in: the default, an already-mangled JSON string, or a bare scalar), and fixes a second bug it surfaced: the `content_types` onboarding option was seeded as `'fictions'` while every fiction passage is tagged `'fiction'` — that option could never have matched anything. `GET /practice/passage` now filters by `tags && content_type` (Postgres array overlap) when the user has a preference, falling back to the full random pool when they don't or nothing matches. Verified end to end against a real local Supabase instance (migration + seed + a live edge function call over HTTP, not just the SQL) for all three cases: preference with matches, no preference, and preference with zero matches.
- [x] **Actually send the reminders users opt into.** `users.daily_reminder` / `reminder_time` / `weekly_summary` are collected at onboarding and toggleable in [NotificationsCard](src/components/settings/NotificationsCard.tsx), but there's no scheduled job and no email template for either — `send-email`'s `EmailRequest.type` only covers `WELCOME` / `PASSWORD_CHANGED` / `SUBSCRIPTION_CREATED` / `SUBSCRIPTION_CANCELLED` / `FEEDBACK_SUBMITTED`. A `pg_cron` job (or a scheduled edge function) plus two new templates would close this loop and directly drives retention.
  **Done:** Added `DAILY_REMINDER`/`WEEKLY_SUMMARY` email types + templates ([templates.ts](supabase/functions/send-email/templates.ts)), and two `pg_cron` jobs running hourly ([20260811235626_add_reminder_emails.sql](supabase/migrations/20260811235626_add_reminder_emails.sql), mirrored in [supabase/schemas/zz_email_triggers.sql](supabase/schemas/zz_email_triggers.sql)): daily reminders fire at each user's own `reminder_time` (hour granularity — there's no per-user timezone stored, so `reminder_time` is interpreted as UTC, a known limitation) and skip anyone who's already practiced that day; weekly summaries fire once a week (Monday) with the trailing 7 days of stats. Both read the destination URL and service-role key from Supabase Vault rather than hardcoding them, and no-op safely if those secrets aren't set — **this needs a one-time manual setup step post-deploy** (`select vault.create_secret(...)` twice, documented in the migration) since I can't put real production secrets in a migration file.

  **Also found and fixed, same root cause:** the *existing* `WELCOME`/`PASSWORD_CHANGED` email triggers had never actually worked. Their `net.http_post` calls used literal placeholder strings (`'YOUR_PROJECT_REF'`, `'YOUR_SERVICE_ROLE_KEY'`) that were never replaced — and separately, both triggers had been silently dropped entirely by a later, unrelated auto-generated migration (`20260202155058_alter_passages_table.sql`, a `db diff` output that concluded they were extraneous because they were never captured in `supabase/schemas/`, only ever hand-written into ad-hoc migrations). So welcome emails and password-changed security alerts have not been sent since 2026-02-02, independent of the placeholder bug. Fixed both using the same Vault mechanism, recreated the missing triggers, and this time added them to `supabase/schemas/` so a future `db diff` won't repeat this.

  Verified end to end against a real local Supabase instance: enabled `pg_cron` locally, seeded local Vault secrets, and confirmed via `net._http_response` that the full chain (cron → SQL selection logic → `net.http_post` → Kong → edge function → template rendering → Resend) works — including the daily-reminder SELECT logic against four scenarios (matches, already-active-today, reminders-off, wrong-hour) and the weekly 7-day stats window. Two test emails did go out for real through the project's actual Resend account during this validation (to a `@test.com`/`@example.com` test address) — deliberate, one-time, and I stopped once the mechanism was confirmed rather than repeating it.
- [x] **Finish or retire Peripheral Vision practice.** It's a defined `PRACTICES` enum value with its own icon and color ([exercise.ts](src/lib/constants/exercise.ts)), but its route just points at `/dashboard/practice` (the index) — there's no actual exercise implemented behind it yet.
  **Done: retired, not finished** — and the reasoning is worth recording since it wasn't a coin flip. Two things pushed this toward retiring rather than guessing at an implementation: (1) the corresponding `exercises` seed row was already commented out ([exercises.sql](supabase/seeds/exercises.sql)), meaning it was never actually shown to a real user despite being fully wired into the enum/icon/color/route constants — dead on arrival, not a regression; (2) its seed description, *"Recall key details from previously read passages to boost memory,"* doesn't describe a peripheral-vision drill at all (that's a memory/recall exercise) — a real mismatch between the name and whatever was originally intended, not just missing implementation. Building *something* under the "Peripheral Vision" name without knowing which of those two (or a third thing) it was supposed to be felt like shipping a guess dressed up as a feature. Removed the enum value, its icon/color/route map entries, the dead `additionalControls` mapping in [controlPanel.tsx](src/components/exercises/shared/controlPanel.tsx), and the commented-out seed row — verified via a full `Record<PRACTICES, ...>` exhaustiveness check (TypeScript) that nothing else referenced it, and confirmed via a real local Supabase reset that the practice list now correctly shows exactly the three real modes. If/when there's an actual design for this, it'll be cheap to build: the three existing reader hooks (RSVP/word-chunking/teleprompter) all now share their timing math via `src/lib/practiceTiming.ts`, so a fourth mode is mostly a new display component away.
- [x] **Use the `goals`/`challenges` onboarding answers for something beyond storage.** They're collected during onboarding ([goals.tsx](src/components/onboarding), [challenges.tsx](src/components/onboarding/preferences/challenges.tsx)) but don't appear to be read anywhere afterward — e.g. to weight which quests get assigned, or to personalize dashboard copy/encouragement.
  **Done:** Used `goals` to personalize the dashboard's hero banner ([src/lib/goalCopy.ts](src/lib/goalCopy.ts), wired into [src/routes/dashboard/index.tsx](src/routes/dashboard/index.tsx)) — the generic "Ready to level up?" headline/subtext is now specific to whichever of the four onboarding goals (Increase Speed / Improve Comprehension / Enhance Focus / Boost Retention) the user picked, falling back to the original generic copy for anyone with no goal set. Deliberately didn't attach a live metric to each goal in the same banner: `focus_score` (the obvious metric for "Enhance Focus") is set once at onboarding to a hardcoded `92` and never updated again anywhere in the codebase, and there's no tracked metric for "Boost Retention" at all — showing a number there would mean fabricating progress that isn't real, so the copy stays qualitative for those two. `challenges` remains collected-but-unused for now: it was fixed at the storage level (see the content-type item above, same underlying bug affected all three columns) but I didn't find a second, similarly clean touchpoint for it in the time this session had — a reasonable, explicit stopping point after four features rather than something I'd stretch to justify. Verified end to end: `getGoalBannerCopy` is unit tested (7 tests covering all four goals, multi-select priority, unrecognized entries, and the empty/null fallback), and I confirmed via a real local Supabase insert — the same code path `userMutation.ts` uses — that `goals` now round-trips as a real array rather than the mangled string it was before the Feature 1 fix.

---

## Practice & content

- [x] **User-supplied content.** Paste a URL or plain text to practice on, instead of only the built-in passage library — this is likely the single most-requested feature for a speed-reading tool (people want to read *their* stuff faster, not just canned passages).
  **Done: plain-text paste, not URL import.** Scoped down from the original idea — URL import needs a server-side fetch + Readability-style HTML extraction pipeline (most sites block client-side CORS fetches, and raw HTML isn't practice-ready text), which is a meaningfully bigger, separate piece of work. Paste-your-own-text covers the actual "practice on *my* stuff" need without it.

  Added a "Practice with your own text" entry point on `/dashboard/practice` ([custom-passage-modal.tsx](src/components/dashboard/practice/custom-passage-modal.tsx)) — paste text (30-word minimum), optional title, pick a mode, and it drops straight into the existing RSVP/Teleprompter/Word Chunking readers unchanged. Getting this to fit cleanly took three real fixes, not just a new modal:
  - `usePracticeStore.passage` is normally populated as a side effect *inside* the `fetchPassage` query function itself ([fetchPassage.ts](src/integration/queries/fetchPassage.ts) calls `usePracticeStore.setState(...)` directly from `queryFn`) — an unusual pattern to design around. Added `setCustomPassage`/`isCustomPassage` to the store, and gated the query in all three reader hooks with `enabled: !isCustomPassage` so a fetched random passage can't clobber the pasted one.
  - Custom text has no comprehension questions, but `ComprehensionQuiz.tsx` assumed `questions` was always non-empty (`passage!.questions!`). It now auto-submits the session (comprehension defaulted to 100 — no assessment happened, so no penalty) as soon as the exercise UUID resolves, instead of rendering an empty quiz.
  - `passage_id` was `z.string()` (required) end to end — frontend type, edge function schema, and the RPC arg type in `supabase_types.ts` — because every session was assumed to reference a real `passages` row. Custom passages are intentionally never persisted there (no RLS path for users to insert into `passages` either), so made it nullable at all three layers; the DB column and `record_practice_session` SQL already accepted NULL without changes.
  - Also fixed a real latent bug found while doing this: session submission read the passage id from `queryClient.getQueryData([fetchPassageKey])` (the React Query cache) rather than the Zustand store, a second, independently-stale source of truth for the same value — switched it to read from the store, which both flows populate correctly.

  Verified against a real local Supabase instance at every layer: called `record_practice_session` directly via RPC with `p_passage_id: null` (session recorded, XP awarded, achievement unlocked), confirmed the `practice_sessions` row actually has `passage_id = NULL`, and repeated the same call through the real `POST /practice/session` edge function endpoint (not just the RPC) to exercise the Zod validation layer too. `pnpm test`/typecheck/build all clean.
- [ ] **Passage library / browse mode.** A "choose your passage" screen instead of always getting a random one, filterable by topic, difficulty, and length.
- [ ] **Bionic-reading display mode** (bold the first few letters of each word) as an option alongside the existing font/theme settings — complements RSVP/teleprompter rather than competing with them.
- [ ] **Difficulty-adaptive passage selection beyond WPM.** `calculateNextWpm` already adjusts speed by comprehension ([adaptiveWpm.ts](src/lib/adaptiveWpm.ts)); extend the same signal to passage *difficulty*, not just pace.
- [ ] **Post-session vocabulary review.** Surface words tied to missed comprehension questions for spaced-repetition review later, instead of discarding that signal after the quiz.

---

## Motivation & social

- [ ] **Streak freeze / repair**, Duolingo-style — spend earned XP or a limited monthly token to protect a streak instead of losing it outright. Pairs naturally with the existing `streak_3`/`streak_7`/`streak_30` achievements.
- [ ] **Friends & leaderboards.** The achievements/quests schema is already built around per-user progress; a weekly leaderboard among friends (or opt-in global) is a natural, mostly-additive extension.
- [ ] **Head-to-head reading race.** Two users read the same passage at the same time, compare speed/comprehension live at the end.
- [ ] **Seasonal / limited-time quests**, distinct from the existing `daily`/`weekly` quest types in the `quests` table — gives recurring users something new to come back for beyond the standing quest rotation.

---

## Insights & analytics

- [ ] **Weekly email digest** (ties directly into the reminder-infrastructure item above) — WPM trend, streak status, one highlight stat for the week.
- [ ] **Comprehension breakdown by question type or passage category**, not just an overall percentage. Helps a user see *what* is capping their comprehension, not just that it's low.
- [ ] **"Best time of day" insight** — surface when a user's own session history shows the strongest WPM/comprehension combination, and nudge them to practice then.
- [ ] **Exportable progress report (PDF/CSV).** Small effort, disproportionately useful for the "I need to prove I'm reading faster for work/school" segment of users.

---

## Accessibility

- [ ] **Colour-overlay / Irlen-filter option**, alongside the existing Dyslexie font and font-size controls in display settings.
- [ ] **Adjustable line spacing / letter spacing** in the reader — currently only font family and size are configurable.
- [ ] **Full keyboard control of practice sessions** (play/pause/next/settings, no mouse required) — cheap to add, meaningfully helps power users and some accessibility needs alike.

---

## Platform & growth

- [ ] **Browser extension**: an RSVP/bionic-reading overlay for whatever page the user is already reading, not just imported/pasted text. Likely the single biggest organic-growth lever available — turns the product into something people reach for constantly rather than only when they remember to open the app.
- [ ] **Push notifications** via the PWA service worker that's already configured ([vite-plugin-pwa](vite.config.ts)) — reuses the reminder infrastructure above for streak-at-risk and daily-reminder nudges without needing a native app.
- [ ] **Team / classroom plan.** An admin view aggregating a cohort's progress — a fairly natural extension of the existing single-user subscription model, and a different (less price-sensitive) buyer.

---

## Monetization

- [ ] **Annual subscription tier with a discount.** Only one plan ID per region currently exists (`PAYSTACK_AFRICA_PLAN_ID` / `PAYSTACK_GLOBAL_PLAN_ID` in [subscription/index.ts](supabase/functions/subscription/index.ts)) — no tiering yet.
- [ ] **Referral rewards.** [ReferralModal](src/components/referral-modal.tsx) exists but doesn't appear to track or grant anything for a successful referral — even a simple "both sides get a free week" would likely pay for itself.
