# Clariolane Gamification Blueprint

## 1. Core Game Mechanics
The core loop revolves around **consistent reading practice** and **measurable improvement** in speed/comprehension.

*   **Primary Action**: Completing a Reading Session (Speed Reading, Teleprompter, or Word Chunking).
*   **Scoring Unit (XP)**: Experience Points are awarded based on *effort* (words read, time spent) and *skill* (WPM achieved, comprehension accuracy).
    *   **Base XP**: 1 XP per 10 words read.
    *   **Time Bonus**: 10 XP per minute of focused reading.
    *   **Comprehension Multiplier**: 1.0x (No Quiz) -> 1.5x (100% Accuracy).
*   **The "Flow" State**: Difficulty (WPM) is dynamically adjusted. If a user consistently hits >90% comprehension, suggest increasing WPM. If <70%, suggest decreasing. This keeps them in the "Flow Channel".

## 2. Progression Systems

### Short-term (Session & Daily)
*   **Session Rank**: Grade each session (S, A, B, C) based on WPM vs. User Average.
*   **Daily Goal Ring**: A visual ring filling up as the user reads their daily target (e.g., 1000 words).
*   **Streak Flame**: A simple counter that ignites/changes color after 3, 7, and 30 days.

### Long-term (User Journey)
*   **Reader Levels**: Level 1 (Novice) to Level 100 (Grandmaster).
    *   *Formula*: `Level = sqrt(Total XP / 100)`
*   **Skill Trees (Mastery Tracks)**:
    *   **Speedster**: Progress by increasing WPM thresholds (300 -> 400 -> 500 -> 1000 WPM).
    *   **Endurance**: Progress by reading longer texts (5min -> 15min -> 30min sessions).
    *   **Scholar**: Progress by reading diverse topics or difficult texts.
*   **Unlockables**:
    *   New Fonts (Dyslexia-friendly, Serif, Monospace).
    *   Reading Themes (Dark, Sepia, Cyberpunk, Nature).
    *   Profile Avatars/Frames.

## 3. Reward Structures

### Intrinsic (Internal Satisfaction)
*   **WPM Graph**: Visual proof of getting faster over time.
*   **"Books Read" Metric**: Convert total words read into "Books Equivalent" (e.g., "You've read the equivalent of *War and Peace*!").
*   **Comprehension Confidence**: Feeling easier to read complex text.

### Extrinsic (External Rewards)
*   **Badges**: Visual trophies for milestones.
    *   *Early Bird*: Read before 8 AM.
    *   *Marathoner*: Read for 60 mins in one go.
    *   *Speed Demon*: Hit 600 WPM with >80% comprehension.
*   **Leaderboard Status**: Rising in the weekly league.
*   **Customization**: Unlocking the "Midnight Blue" theme.

## 4. Positive Feedback Loops
1.  **Action**: User completes a session.
2.  **Immediate Feedback**: "Great job! +150 XP. You read 15% faster than yesterday."
3.  **Progress Update**: "Daily Goal: 80% Complete. Just 200 words to go!"
4.  **Trigger**: "Keep your streak alive!" (Notification if inactive).

## 5. Engagement Triggers
*   **Daily**: "Your 5-day streak is at risk!" (Push/Email at 6 PM).
*   **Weekly**: "Weekly Report: You read 15,000 words this week. Top 10% of users!"
*   **Contextual**:
    *   *After a good session*: "You're on fire! Want to try a slightly faster speed?"
    *   *After a break*: "Welcome back! Let's start with an easy warm-up."

## 6. Challenge & Quest Systems

### Daily Quests (Rotational)
*   "Read 500 words."
*   "Complete 1 Speed Reading session."
*   "Score 100% on a comprehension quiz."

### Streak Challenges
*   "7-Day Consistency": Read every day for a week. Reward: 2x XP Potion (24h).

### Mastery Challenges (Boss Battles)
*   **"The 1000 WPM Barrier"**: A special challenge mode where the speed ramps up. Passing it unlocks the "Speed Master" badge.

## 7. Integration Points
*   **Dashboard**:
    *   *Top*: Daily Goal Ring & Streak Counter.
    *   *Center*: Active Quests & "Jump Back In" button.
    *   *Right*: Leaderboard & Community Goal.
*   **Reading Interface**:
    *   *During*: Minimalist progress bar (don't distract).
    *   *Post-Session*: The "Victory Screen" – XP tally, Level progress bar animating, Badge unlock popup.
*   **Profile**: Hall of Fame (Badges), Stats overview.

## 8. Behavioral Psychology Principles
*   **Endowed Progress Effect**: Give new users a "Level 1" with 50% XP filled immediately so they feel closer to the first milestone.
*   **Loss Aversion**: "Don't lose your 10-day streak!" is more powerful than "Gain a streak".
*   **Variable Rewards**: Occasionally drop a "Critical Success" (Bonus XP) to keep dopamine high.
*   **Social Proof**: "Sarah just reached 500 WPM" (Ticker or Feed).

## 9. Edge-Case & Anti-Gaming
*   **The "Scroller"**: Users who just let the text scroll without reading.
    *   *Fix*: Random "Checkpoints" or Comprehension Quizzes. If they fail the quiz, XP is drastically reduced (or 0).
*   **The "Spammer"**: Opening/closing sessions instantly.
    *   *Fix*: Minimum session time (e.g., 30 seconds) to qualify for rewards.
*   **Time Cap**: Cap daily XP (e.g., max 2 hours of rewarded reading) to prevent unhealthy obsession and botting.

## 10. System Architecture

### Database Schema (Supabase)

```sql
-- Core Stats
create table user_stats (
  user_id uuid references auth.users primary key,
  xp bigint default 0,
  level int default 1,
  current_streak int default 0,
  longest_streak int default 0,
  last_activity_date date,
  total_words_read bigint default 0,
  total_time_seconds bigint default 0
);

-- Achievements
create table achievements (
  id text primary key, -- e.g., 'speed_demon_1'
  title text not null,
  description text not null,
  icon_url text,
  category text -- 'speed', 'streak', 'volume'
);

-- User Achievements
create table user_achievements (
  user_id uuid references auth.users,
  achievement_id text references achievements,
  unlocked_at timestamptz default now(),
  primary key (user_id, achievement_id)
);

-- Quests
create table quests (
  id uuid primary key default gen_random_uuid(),
  type text, -- 'daily', 'weekly'
  description text,
  target_metric text, -- 'words', 'minutes', 'sessions'
  target_value int,
  xp_reward int,
  expires_at timestamptz
);

-- User Quest Progress
create table user_quests (
  user_id uuid references auth.users,
  quest_id uuid references quests,
  current_value int default 0,
  is_completed boolean default false,
  claimed_at timestamptz
);
```
