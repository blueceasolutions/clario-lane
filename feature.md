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
- [ ] **Use the `goals`/`challenges` onboarding answers for something beyond storage.** They're collected during onboarding ([goals.tsx](src/components/onboarding), [challenges.tsx](src/components/onboarding/preferences/challenges.tsx)) but don't appear to be read anywhere afterward — e.g. to weight which quests get assigned, or to personalize dashboard copy/encouragement.

---

## Practice & content

- [ ] **User-supplied content.** Paste a URL or plain text to practice on, instead of only the built-in passage library — this is likely the single most-requested feature for a speed-reading tool (people want to read *their* stuff faster, not just canned passages).
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
