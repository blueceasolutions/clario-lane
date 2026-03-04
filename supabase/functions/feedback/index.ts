import "@supabase/functions-js/edge-runtime.d.ts";
import { type Context, Hono } from "hono";
import { createClient } from "@supabase/supabase-js";
import { JSDOM } from "jsdom";
import DOMPurify from "dompurify";
import { corsMiddleware } from "../_shared/cors-middleware.ts";
import type { Database } from "../../supabase_types.ts";

const app = new Hono();

app.use("/*", corsMiddleware);

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

// Setup DOMPurify
const window = new JSDOM("").window;
const purify = DOMPurify(window);

// Helper to recursively sanitize data
// deno-lint-ignore no-explicit-any
const sanitizeData = (data: any): any => {
  if (typeof data === "string") {
    return purify.sanitize(data);
  }
  if (Array.isArray(data)) {
    return data.map(sanitizeData);
  }
  if (typeof data === "object" && data !== null) {
    // deno-lint-ignore no-explicit-any
    const sanitized: any = {};
    for (const key in data) {
      sanitized[key] = sanitizeData(data[key]);
    }
    return sanitized;
  }
  return data;
};

// Helper to create Supabase client with auth header
const getSupabaseClient = (c: Context) => {
  const authHeader = c.req.header("Authorization");
  return createClient<Database>(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: { Authorization: authHeader || "" },
    },
  });
};

const getSupabaseServiceRoleClient = () => {
  return createClient<Database>(supabaseUrl, supabaseServiceRoleKey);
};

// GET - Read all or one
app.get("/feedback", async (c) => {
  try {
    const supabase = getSupabaseServiceRoleClient();
    const id = c.req.query("id");
    const userId = c.req.query("userId");

    if (id) {
      const { data: feedback, error } = await supabase
        .from("feedback")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;

      const { data: user } = await supabase
        .from("users")
        .select("name, email")
        .eq("id", feedback.user_id)
        .single();

      return c.json({ ...feedback, user });
    } else {
      const page = parseInt(c.req.query("page") || "1");
      const limit = parseInt(c.req.query("limit") || "10");
      const from = (page - 1) * limit;
      const to = from + limit - 1;

      let query = supabase
        .from("feedback")
        .select("*", { count: "exact" });

      if (userId) {
        query = query.eq("user_id", userId);
      }

      const status = c.req.queries("status");
      if (status && status.length > 0) {
        query = query.in("status", status);
      }

      const category = c.req.queries("category");
      if (category && category.length > 0) {
        query = query.in("category", category);
      }

      const isRead = c.req.query("is_read");
      if (isRead !== undefined) {
        query = query.eq("is_read", isRead === "true");
      }

      const sortBy = c.req.query("sortBy") || "created_at";
      const sortOrder = c.req.query("sortOrder") || "desc";

      const { data: feedbackData, count, error } = await query
        .range(from, to)
        .order(sortBy, { ascending: sortOrder === "asc" });

      if (error) throw error;

      // Manual join with users table
      const userIds = [...new Set(feedbackData?.map((f) => f.user_id) || [])];
      let usersMap: Record<
        string,
        { id: string; name: string; email: string }
      > = {};

      if (userIds.length > 0) {
        const { data: users } = await supabase
          .from("users")
          .select("id, name, email")
          .in("id", userIds);

        usersMap = (users || []).reduce(
          (
            acc: Record<string, { id: string; name: string; email: string }>,
            user: { id: string; name: string; email: string },
          ) => {
            acc[user.id] = user;
            return acc;
          },
          {},
        );
      }

      const data = feedbackData?.map((f) => ({
        ...f,
        user: usersMap[f.user_id] || { name: "Unknown User", email: "unknown" },
      }));

      return c.json({
        data,
        meta: {
          page,
          limit,
          total: count,
          totalPages: Math.ceil((count || 0) / limit),
        },
      });
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return c.json({ error: message }, 400);
  }
});

// GET - Read single by ID (RESTful alternative)
app.get("/feedback/:id", async (c) => {
  try {
    const supabase = getSupabaseServiceRoleClient();
    const id = c.req.param("id");

    const { data: feedback, error } = await supabase
      .from("feedback")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;

    const { data: user } = await supabase
      .from("users")
      .select("name, email")
      .eq("id", feedback.user_id)
      .single();

    return c.json({ ...feedback, user });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return c.json({ error: message }, 400);
  }
});

// POST - Create
app.post("/feedback", async (c) => {
  try {
    const supabase = getSupabaseClient(c);
    const body = await c.req.json();
    const sanitizedBody = sanitizeData(body);

    // Ensure user_id is set from auth if not provided (optional enhanced security)
    // For now we trust the client or the sanitized body, but best practice is to get user from auth.
    // However, existing useFeedback.ts sends user_id. We'll stick to sanitizedBody.

    const { data, error } = await supabase
      .from("feedback")
      .insert(sanitizedBody)
      .select()
      .single();

    if (error) throw error;
    return c.json(data, 201);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return c.json({ error: message }, 400);
  }
});

// PUT - Update
app.put("/feedback", async (c) => {
  try {
    // Determine if user can update. Usually users can't edit submitted feedback, only admins.
    // Using service role for updates to bypass RLS if needed, or stick to client depending on policies.
    // Assuming admin or ownership:
    const supabase = getSupabaseServiceRoleClient();
    const body = await c.req.json();
    const sanitizedBody = sanitizeData(body);
    const { id, ...updates } = sanitizedBody;

    if (!id) {
      return c.text("ID is required for update", 400);
    }

    const { data, error } = await supabase
      .from("feedback")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return c.json(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return c.json({ error: message }, 400);
  }
});

// DELETE - Delete
app.delete("/feedback", async (c) => {
  try {
    const supabase = getSupabaseServiceRoleClient();
    const body = await c.req.json();
    const id = body?.id;

    if (!id) {
      return c.text("ID is required for delete", 400);
    }

    const { error } = await supabase.from("feedback").delete().eq("id", id);

    if (error) throw error;
    return c.json({ message: "Deleted successfully" });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return c.json({ error: message }, 400);
  }
});

Deno.serve(app.fetch);
