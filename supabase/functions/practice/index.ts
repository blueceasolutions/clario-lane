import "@supabase/functions-js/edge-runtime.d.ts";
import { Hono } from "hono";
import { createClient, type SupabaseClient, type User } from "@supabase/supabase-js";
import { z } from "zod";
import type { Database } from "../../supabase_types.ts";
import { corsMiddleware } from "../_shared/cors-middleware.ts";
import { logError } from "../_shared/log-error.ts";

type Env = {
  Variables: {
    supabase: SupabaseClient<Database>;
    user: User;
  };
};

const app = new Hono<Env>();

// Apply CORS middleware globally
app.use("/*", corsMiddleware);

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabase_anon_key = Deno.env.get("SUPABASE_ANON_KEY")!;

const sessionSchema = z.object({
  // null for user-supplied (custom) passages, which are never persisted to
  // the passages table
  passage_id: z.string().nullable(),
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

// Middleware to create request-scoped Supabase client
app.use("/practice/*", async (c, next) => {
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
app.get("/practice", async (c) => {
  const supabaseClient = c.get("supabase");
  const user = c.get("user");

  try {
    const { data, error } = await supabaseClient.from("exercises").select("*");
    if (error) throw error;

    return c.json({
      success: true,
      data,
      message: "Successfully retrieved",
    });
  } catch (error) {
    await logError(error, {
      function: "practice",
      step: "list_exercises",
      userId: user?.id,
    });
    return c.json(
      { success: false, data: null, message: "Failed to retrieve exercises" },
      500,
    );
  }
});

// GET /practice/passage - Get a random passage, preferring the user's
// chosen content types (falling back to the full pool if they have no
// preference set, or nothing matches it)
app.get("/practice/passage", async (c) => {
  const supabaseClient = c.get("supabase");
  const user = c.get("user");

  try {
    const { data: userRow } = await supabaseClient
      .from("users")
      .select("content_type")
      .eq("id", user.id)
      .single();

    const preferredTags = (userRow?.content_type ?? []).filter(
      (tag) => tag && tag !== "mixed",
    );

    let passageIds: Array<{ id: string }> | null = null;

    if (preferredTags.length > 0) {
      const { data, error } = await supabaseClient
        .from("passages")
        .select("id")
        .overlaps("tags", preferredTags);

      if (error) throw new Error(error.message);
      passageIds = data;
    }

    // No preference, or nothing matched it: fall back to the full pool
    if (!passageIds || passageIds.length === 0) {
      const { data, error } = await supabaseClient
        .from("passages")
        .select("id");

      if (error) throw new Error(error.message);
      passageIds = data;
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
    await logError(error, {
      function: "practice",
      step: "get_random_passage",
      userId: user?.id,
    });
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
app.post("/practice/session", async (c) => {
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

    // All of session insert, XP/level/streak calculation, quest progress,
    // avg-score recompute, and achievement unlocking happen atomically in a
    // single Postgres transaction (see record_practice_session in
    // supabase/schemas/zz_record_practice_session.sql). This replaces what
    // used to be ~10+ sequential, non-atomic round trips with one RPC call.
    const { data, error } = await supabaseClient.rpc(
      "record_practice_session",
      {
        p_passage_id: vettedData.passage_id,
        p_exercise_id: vettedData.exercise_id,
        p_wpm: vettedData.wpm,
        p_next_wpm: vettedData.next_wpm,
        p_comprehension: vettedData.comprehension,
        p_duration: vettedData.duration,
        p_total_words: vettedData.total_words,
        p_correct_answers: vettedData.correct_answers,
        p_total_questions: vettedData.total_questions,
        p_start_time: vettedData.start_time,
        p_elapsed_time: vettedData.elapsed_time,
      },
    );

    if (error) {
      if (error.code === "P0002") {
        return c.json({ success: false, message: "User not found" }, 404);
      }
      throw error;
    }

    const result = data as {
      xp_gained: number;
      new_level: number;
      new_achievements: Array<
        { achievement_id: string; just_unlocked: boolean }
      >;
    };

    return c.json({
      success: true,
      message: "Session successfully recorded",
      data: {
        xp_gained: result.xp_gained,
        new_level: result.new_level,
        new_achievements: result.new_achievements,
      },
    });
  } catch (error) {
    await logError(error, {
      function: "practice",
      step: "record_session",
      userId: user?.id,
    });
    return c.json(
      { success: false, message: "Something went wrong" },
      500,
    );
  }
});

Deno.serve(app.fetch);
