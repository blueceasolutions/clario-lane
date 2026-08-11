# Clariolane — Feature Ideas

A backlog of feature suggestions, grounded in a read-through of the current codebase (2026-08-12). Grouped by theme, not priority — pick what's worth doing, not a proposed roadmap.

---

## Close the loop on what's already collected

These aren't new ideas — they're places the product already asks the user for something and then doesn't act on it.

- [ ] **Filter passage selection by preferred content type.** Onboarding collects `content_type` (fiction / non-fiction / mixed via [content-type.tsx](src/components/onboarding/preferences/content-type.tsx)), but `GET /practice/passage` ([supabase/functions/practice/index.ts](supabase/functions/practice/index.ts)) picks a random passage from the whole table regardless of it. Wire the preference into passage selection.
- [ ] **Actually send the reminders users opt into.** `users.daily_reminder` / `reminder_time` / `weekly_summary` are collected at onboarding and toggleable in [NotificationsCard](src/components/settings/NotificationsCard.tsx), but there's no scheduled job and no email template for either — `send-email`'s `EmailRequest.type` only covers `WELCOME` / `PASSWORD_CHANGED` / `SUBSCRIPTION_CREATED` / `SUBSCRIPTION_CANCELLED` / `FEEDBACK_SUBMITTED`. A `pg_cron` job (or a scheduled edge function) plus two new templates would close this loop and directly drives retention.
- [ ] **Finish or retire Peripheral Vision practice.** It's a defined `PRACTICES` enum value with its own icon and color ([exercise.ts](src/lib/constants/exercise.ts)), but its route just points at `/dashboard/practice` (the index) — there's no actual exercise implemented behind it yet.
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
