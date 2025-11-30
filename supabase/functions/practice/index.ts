import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import { z } from "jsr:@zod/zod";
import { Database } from "../../supabase_types.ts";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabase_anon_key = Deno.env.get("SUPABASE_ANON_KEY")!;

// const supabase_service_key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
// const supabaseAdmin = createClient<Database>(supabaseUrl, supabase_service_key);

const sessionSchema = z.object({
  passage_id: z.string(),
  exercise_id: z.string(),
  wpm: z.number(),
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
    // first time
    return { streak: 1, date: startOfToday };
  }

  const diffDays = (startOfToday.getTime() - startOfLast!.getTime()) /
    (1000 * 60 * 60 * 24);

  if (diffDays === 0) {
    // already logged today
    return { streak: currentStreak, date: startOfToday };
  }

  if (diffDays === 1) {
    // continued streak
    return { streak: currentStreak + 1, date: startOfToday };
  }

  // broke streak
  return { streak: 1, date: startOfToday };
}

function jsonResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

async function handleGetExercises(
  client: ReturnType<typeof createClient<Database>>,
) {
  try {
    const { data, error } = await client.from("exercises").select("*");
    if (error) throw error;
    return jsonResponse({
      success: true,
      data,
      message: "Successfully retrieved",
    });
  } catch (error) {
    return jsonResponse(
      { success: false, data: null, message: "Failed to retrieve exercises" },
      500,
    );
  }
}

async function handleGetPassage(
  client: ReturnType<typeof createClient<Database>>,
) {
  try {
    const { data: passageIds, error } = await client.from("passages").select(
      "id",
    );
    if (error) {
      throw new Error(error.message);
    }

    if (!passageIds || passageIds.length === 0) {
      throw new Error("No passages available");
    }

    const randomId = passageIds[Math.floor(Math.random() * passageIds.length)];

    const { data: passage } = await client.from("passages").select("*").eq(
      "id",
      randomId.id,
    ).single();

    if (!passage) {
      throw new Error("Passage not found");
    }

    return jsonResponse({
      success: true,
      data: passage,
      message: "Successfully retrieved passage",
    });
  } catch (error) {
    console.error("Error fetching passage:", error);
    if (error instanceof Error) {
      return jsonResponse({
        success: false,
        data: null,
        message: `Error fetching passage: ${error.message}`,
      }, 500);
    }

    return jsonResponse({
      success: false,
      data: null,
      message: "Error fetching passage",
    }, 500);
  }
}

async function handleCreateSession(
  req: Request,
  client: ReturnType<typeof createClient<Database>>,
  userId: string,
) {
  try {
    const body = await req.json();

    // Validate request body
    const validationResult = sessionSchema.safeParse(body);
    if (!validationResult.success) {
      return jsonResponse({
        success: false,
        message: "Invalid request data",
        errors: validationResult.error.issues,
      }, 400);
    }

    const vettedData: SessionData = validationResult.data;

    const { data: user, error } = await client.from("users").select(
      "id, total_sessions, streak_days, xp_earned, current_wpm, current_comprehension_score, last_active_date",
    ).eq("id", userId).single();

    if (error) throw error;
    if (!user) {
      return jsonResponse({ success: false, message: "User not found" }, 404);
    }

    // Insert practice session with the authenticated user's ID
    const res = await client.from("practice_sessions").insert({
      ...vettedData,
      user_id: userId,
    });

    if (res.error) throw res.error;

    // Update average scores
    const { error: avgError } = await client.rpc(
      "update_avg_scores",
      {
        uid: userId,
      },
    );

    if (avgError) throw avgError;

    // Update streak
    const streakTracker = updateStreak(
      user.last_active_date,
      user.streak_days!,
    );

    await client.from("users").update({
      total_sessions: (user.total_sessions! + 1) || 1,
      last_active_date: streakTracker.date.toISOString(),
      streak_days: streakTracker.streak,
    }).eq("id", userId);

    return jsonResponse({
      success: true,
      message: "Session successfully recorded",
    });
  } catch (error) {
    console.log(error);
    return jsonResponse(
      { success: false, message: "Something went wrong" },
      500,
    );
  }
}

Deno.serve(async (req) => {
  const url = new URL(req.url);
  const path = url.pathname;
  const method = req.method;
  const authHeader = req.headers.get("Authorization");

  // Handle CORS preflight
  if (method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    });
  }

  // Create request-scoped Supabase client with auth context
  const supabaseClient = createClient<Database>(
    supabaseUrl,
    supabase_anon_key,
    {
      global: {
        headers: { Authorization: authHeader! },
      },
    },
  );

  // Get authenticated user
  const {
    data: { user },
    error: authError,
  } = await supabaseClient.auth.getUser();

  if (authError || !user) {
    console.error("Auth error:", authError);
    return jsonResponse(
      { success: false, message: "Unauthorized" },
      401,
    );
  }

  // Route matching
  if (path === "/practice" && method === "GET") {
    return handleGetExercises(supabaseClient);
  }

  if (path === "/practice/passage" && method === "GET") {
    return handleGetPassage(supabaseClient);
  }

  if (path === "/practice/session" && method === "POST") {
    return handleCreateSession(req, supabaseClient, user.id);
  }

  // 404 Not Found
  return jsonResponse({ success: false, message: "Not found" }, 404);
});
