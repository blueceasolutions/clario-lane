import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { Hono } from "jsr:@hono/hono";
import { createClient } from "npm:@supabase/supabase-js@2";
import { Database } from "../../supabase_types.ts";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabase_anon_key = Deno.env.get("SUPABASE_ANON_KEY")!;
// const supabase_service_key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient<Database>(supabaseUrl, supabase_anon_key);

// const supabaseAdmin = createClient<Database>(supabaseUrl, supabase_service_key);

const app = new Hono();

app.get("/practice/passage", async (c) => {
  try {
    const { data: passageIds, error } = await supabase.from("passages").select(
      "id",
    );
    if (error) {
      throw new Error(error.message);
    }

    if (!passageIds || passageIds.length === 0) {
      throw new Error("No passages available");
    }

    const randomId = passageIds[Math.floor(Math.random() * passageIds.length)];

    const { data: passage } = await supabase.from("passages").select("*").eq(
      "id",
      randomId.id,
    ).single();

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
    if (error instanceof Error) {
      return c.json({
        success: false,
        data: null,
        message: `Error fetching passage: ${error.message}`,
      }, 500);
    }

    return c.json({
      success: false,
      data: null,
      message: `Error fetching passage`,
    }, 500);
  }
});

Deno.serve(app.fetch);
