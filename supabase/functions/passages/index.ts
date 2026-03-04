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
app.get("/passages", async (c) => {
  try {
    const supabase = getSupabaseClient(c);
    const id = c.req.query("id");

    if (id) {
      const { data, error } = await supabase
        .from("passages")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return c.json(data);
    } else {
      const page = parseInt(c.req.query("page") || "1");
      const limit = parseInt(c.req.query("limit") || "10");
      const from = (page - 1) * limit;
      const to = from + limit - 1;

      const { data, count, error } = await supabase
        .from("passages")
        .select("*", { count: "exact" })
        .range(from, to);

      if (error) throw error;

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

// POST - Create
app.post("/passages", async (c) => {
  try {
    const supabase = getSupabaseServiceRoleClient();
    const body = await c.req.json();
    const sanitizedBody = sanitizeData(body);
    const { data, error } = await supabase
      .from("passages")
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
app.put("/passages", async (c) => {
  try {
    const supabase = getSupabaseServiceRoleClient();
    const body = await c.req.json();
    const sanitizedBody = sanitizeData(body);
    const { id, ...updates } = sanitizedBody;

    if (!id) {
      return c.text("ID is required for update", 400);
    }

    const { data, error } = await supabase
      .from("passages")
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
app.delete("/passages", async (c) => {
  try {
    const supabase = getSupabaseServiceRoleClient();
    const body = await c.req.json();
    const id = body?.id;

    if (!id) {
      return c.text("ID is required for delete", 400);
    }

    const { error } = await supabase.from("passages").delete().eq(
      "id",
      id,
    );

    if (error) throw error;
    return c.json({ message: "Deleted successfully" });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return c.json({ error: message }, 400);
  }
});

app.get("/passages/:id", async (c) => {
  try {
    const supabase = getSupabaseClient(c);
    const id = c.req.param("id");
    const { data, error } = await supabase.from("passages").select("*").eq(
      "id",
      id,
    ).single();
    if (error) throw error;
    return c.json(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return c.json({ error: message }, 400);
  }
});

Deno.serve(app.fetch);
