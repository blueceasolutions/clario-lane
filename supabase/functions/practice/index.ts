// deno-lint-ignore-file no-explicit-any
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
// import type { Context } from "npm:hono"; // Removed due to missing package
import { Hono } from "npm:hono";
import { createClient } from "npm:@supabase/supabase-js@2";
import { z } from "jsr:@zod/zod";
import type { Database } from "../../supabase_types.ts";
import { corsMiddleware } from "../_shared/cors-middleware.ts";

const app = new Hono();

// Apply CORS middleware globally
app.use("/*", corsMiddleware);

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabase_anon_key = Deno.env.get("SUPABASE_ANON_KEY")!;

const sessionSchema = z.object({
  passage_id: z.string(),
  exercise_id: z.string(),
  wpm: z.number(),
  next_wpm: z.number(),
  comprehension: z.number(),
  duration: z.number(),
  total_words: z.number(),
  correct_answers: z.number(),
  total_questions: z.number(),
  start_time: z.number(),
  elapsed_time: z.number(),
});

type SessionData = z.infer<typeof sessionSchema>;

function updateStreak(lastDate: string | null, currentStreak: number) {
  const today = new Date();
  const last = lastDate ? new Date(lastDate) : null;

  const startOfToday = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );
  const startOfLast = last
    ? new Date(last.getFullYear(), last.getMonth(), last.getDate())
    : null;

  if (!last) {
    return { streak: 1, date: startOfToday };
  }

  const diffDays = (startOfToday.getTime() - startOfLast!.getTime()) /
    (1000 * 60 * 60 * 24);

  if (diffDays === 0) {
    return { streak: currentStreak, date: startOfToday };
  }

  if (diffDays === 1) {
    return { streak: currentStreak + 1, date: startOfToday };
  }

  return { streak: 1, date: startOfToday };
}

// Middleware to create request-scoped Supabase client
app.use("/practice/*", async (c: any, next: any) => {
  const authHeader = c.req.header("Authorization");

  if (!authHeader) {
    return c.json({ success: false, message: "Unauthorized" }, 401);
  }

  const supabaseClient = createClient<Database>(
    supabaseUrl,
    supabase_anon_key,
    {
      global: {
        headers: { Authorization: authHeader },
      },
    },
  );

  const {
    data: { user },
    error: authError,
  } = await supabaseClient.auth.getUser();

  if (authError || !user) {
    return c.json({ success: false, message: "Unauthorized" }, 401);
  }

  c.set("supabase", supabaseClient);
  c.set("user", user);
  await next();
});

// GET /practice - Get all exercises
app.get("/practice", async (c: any) => {
  const supabaseClient = c.get("supabase");

  try {
    const { data, error } = await supabaseClient.from("exercises").select("*");
    if (error) throw error;

    return c.json({
      success: true,
      data,
      message: "Successfully retrieved",
    });
  } catch (error) {
    console.error(error);
    return c.json(
      { success: false, data: null, message: "Failed to retrieve exercises" },
      500,
    );
  }
});

// GET /practice/passage - Get a random passage
app.get("/practice/passage", async (c: any) => {
  const supabaseClient = c.get("supabase");

  try {
    const { data: passageIds, error } = await supabaseClient
      .from("passages")
      .select("id");

    if (error) {
      throw new Error(error.message);
    }

    if (!passageIds || passageIds.length === 0) {
      throw new Error("No passages available");
    }

    const randomId = passageIds[Math.floor(Math.random() * passageIds.length)];

    const { data: passage } = await supabaseClient
      .from("passages")
      .select("*")
      .eq("id", randomId.id)
      .single();

    if (!passage) {
      throw new Error("Passage not found");
    }

    return c.json({
      success: true,
      data: passage,
      message: "Successfully retrieved passage",
    });
  } catch (error) {
    console.error("Error fetching passage:", error);
    const message = error instanceof Error
      ? `Error fetching passage: ${error.message}`
      : "Error fetching passage";

    return c.json(
      { success: false, data: null, message },
      500,
    );
  }
});

// POST /practice/session - Create a session
app.post("/practice/session", async (c: any) => {
  const supabaseClient = c.get("supabase");
  const user = c.get("user");

  try {
    const body = await c.req.json();

    // Validate request body
    const validationResult = sessionSchema.safeParse(body);
    if (!validationResult.success) {
      return c.json({
        success: false,
        message: "Invalid request data",
        errors: validationResult.error.issues,
      }, 400);
    }

    const vettedData: SessionData = validationResult.data;

    const { data: userData, error } = await supabaseClient
      .from("users")
      .select("id, total_sessions, streak_days, last_active_date")
      .eq("id", user.id)
      .single();

    if (error) throw error;
    if (!userData) {
      return c.json({ success: false, message: "User not found" }, 404);
    }

    // Get current user_stats
    const { data: currentStats } = await supabaseClient
      .from("user_stats")
      .select("*")
      .eq("user_id", user.id)
      .single();

    // Insert practice session
    const res = await supabaseClient.from("practice_sessions").insert({
      ...vettedData,
      user_id: user.id,
    });

    if (res.error) throw res.error;

    // Calculate XP for this session
    const { data: xpData, error: xpError } = await supabaseClient.rpc(
      "calculate_session_xp",
      {
        words_read: Math.round(vettedData.total_words),
        duration_seconds: Math.round(vettedData.duration),
        comprehension_pct: vettedData.comprehension,
      },
    );

    if (xpError) throw xpError;
    const sessionXp = xpData as number;

    // Calculate new totals
    const newTotalXp = (currentStats?.xp || 0) + sessionXp;
    const newTotalWords = Math.round(
      (currentStats?.total_words_read || 0) + vettedData.total_words,
    );
    const newTotalTime = Math.round(
      (currentStats?.total_time_seconds || 0) + vettedData.duration,
    );

    // Calculate new level
    const { data: newLevel, error: levelError } = await supabaseClient.rpc(
      "calculate_level",
      { total_xp: newTotalXp },
    );

    if (levelError) throw levelError;

    // Update streak
    const streakTracker = updateStreak(
      userData.last_active_date,
      userData.streak_days!,
    );

    // Update user last_active_date and streak
    await supabaseClient.from("users").update({
      last_active_date: streakTracker.date.toISOString(),
      streak_days: streakTracker.streak,
      next_wpm: vettedData.next_wpm,
    }).eq("id", user.id);

    const user_stats_update = {
      user_id: user.id,
      xp: newTotalXp,
      level: newLevel as number,
      current_streak: streakTracker.streak,
      longest_streak: Math.max(
        streakTracker.streak,
        currentStats?.longest_streak || 0,
      ),
      last_activity_date: streakTracker.date.toISOString().split("T")[0],
      total_words_read: newTotalWords,
      total_time_seconds: newTotalTime,
    };

    // Update user_stats
    const { error: statsError } = await supabaseClient.from("user_stats")
      .upsert(user_stats_update);

    if (statsError) throw statsError;

    // ---------------------------------------
    // Update user quest progress based on session data
    // Fetch all quests
    const { data: allQuests, error: questsError } = await supabaseClient
      .from("quests")
      .select("id, type, target_metric, target_value");
    if (questsError) throw questsError;

    // Prepare upserts for user_quests
    // Removed unused questUpserts mapping; progress will be handled in the loop below

    // Process each quest upsert sequentially
    for (const quest of allQuests) {
      // Get existing progress
      const { data: existing, error: _existingError } = await supabaseClient
        .from("user_quests")
        .select("current_value, is_completed")
        .eq("user_id", user.id)
        .eq("quest_id", quest.id)
        .maybeSingle();

      if (_existingError) throw _existingError;

      const currentValue = existing?.current_value ?? 0;
      const wasCompleted = existing?.is_completed ?? false;
      let increment = 0;
      switch (quest.target_metric) {
        case "words":
          increment = Math.round(vettedData.total_words);
          break;
        case "minutes":
          increment = Math.round(vettedData.duration / 60);
          break;
        case "sessions":
          increment = 1;
          break;
        case "wpm":
          increment = vettedData.wpm >= quest.target_value
            ? quest.target_value
            : 0;
          break;
        default:
          increment = 0;
      }
      const newValue = currentValue + increment;
      const isCompleted = newValue >= quest.target_value;
      const upsertData = {
        user_id: user.id,
        quest_id: quest.id,
        current_value: newValue,
        is_completed: isCompleted,
        updated_at: new Date().toISOString(),
        claimed_at: wasCompleted && !isCompleted ? null : undefined,
      };
      await supabaseClient.from("user_quests").upsert(upsertData, {
        onConflict: ["user_id", "quest_id"],
      });
    }
    // ---------------------------------------

    // Update average scores and total_sessions
    const { error: avgError } = await supabaseClient.rpc(
      "update_avg_scores",
      { uid: user.id },
    );

    if (avgError) throw avgError;

    // Check and unlock achievements
    const { data: newAchievements, error: achError } = await supabaseClient.rpc(
      "check_and_unlock_achievements",
      { uid: user.id },
    );

    if (achError) {
      throw achError;
    }

    return c.json({
      success: true,
      message: "Session successfully recorded",
      data: {
        xp_gained: sessionXp,
        new_level: newLevel,
        new_achievements: newAchievements || [],
      },
    });
  } catch (error) {
    console.error(error);
    return c.json(
      { success: false, message: "Something went wrong" },
      500,
    );
  }
});

Deno.serve(app.fetch);
