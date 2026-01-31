import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

console.log("Passage Function up and running!");

serve(async (req) => {
  const { url, method } = req;

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization")! },
        },
      },
    );

    // GET - Read all or one
    if (method === "GET") {
      const u = new URL(url);
      const id = u.searchParams.get("id");

      if (id) {
        const { data, error } = await supabase
          .from("passages")
          .select("*")
          .eq("id", id)
          .single();

        if (error) throw error;
        return new Response(JSON.stringify(data), {
          headers: { "Content-Type": "application/json" },
        });
      } else {
        const { data, error } = await supabase.from("passages").select("*");
        if (error) throw error;
        return new Response(JSON.stringify(data), {
          headers: { "Content-Type": "application/json" },
        });
      }
    }

    // POST - Create
    if (method === "POST") {
      const body = await req.json();
      const { data, error } = await supabase
        .from("passages")
        .insert(body)
        .select()
        .single();

      if (error) throw error;
      return new Response(JSON.stringify(data), {
        status: 201,
        headers: { "Content-Type": "application/json" },
      });
    }

    // PUT - Update
    if (method === "PUT") {
      const body = await req.json();
      const { id, ...updates } = body;

      if (!id) {
        return new Response("ID is required for update", { status: 400 });
      }

      const { data, error } = await supabase
        .from("passages")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return new Response(JSON.stringify(data), {
        headers: { "Content-Type": "application/json" },
      });
    }

    // DELETE - Delete
    if (method === "DELETE") {
      const u = new URL(url);
      const id = u.searchParams.get("id");

      if (!id) {
        return new Response("ID is required for delete", { status: 400 });
      }

      const { error } = await supabase.from("passages").delete().eq("id", id);

      if (error) throw error;
      return new Response(JSON.stringify({ message: "Deleted successfully" }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response("Method not allowed", { status: 405 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
});
