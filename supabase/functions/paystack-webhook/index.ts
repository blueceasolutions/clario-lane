import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { Hono } from "npm:hono";
import crypto from "node:crypto";
import { createClient } from "jsr:@supabase/supabase-js@2";
import type { Database } from "../../supabase_types.ts";
import { corsMiddleware } from "../_shared/cors-middleware.ts";

const app = new Hono();

// Apply CORS middleware globally
app.use("/*", corsMiddleware);

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabase_service_key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const secret = Deno.env.get("PAYSTACK_SECRET_KEY")!;

const supabaseAdmin = createClient<Database>(supabaseUrl, supabase_service_key);

// POST /paystack-webhook - Handle Paystack webhooks
app.post("/paystack-webhook", async (c) => {
  try {
    const payload = await c.req.json();
    const signature = c.req.header("x-paystack-signature");

    // Verify webhook signature
    const hash = crypto.createHmac("sha512", secret)
      .update(JSON.stringify(payload))
      .digest("hex");

    if (hash !== signature) {
      return c.json({ success: false, message: "Not authorized" }, 401);
    }

    // Find user by email
    const { data: customer, error: customerError } = await supabaseAdmin
      .from("users")
      .select("id")
      .eq("email", payload.data.customer.email)
      .single();

    if (customerError || !customer) {
      return c.json({ success: false, message: "User not found" }, 400);
    }

    const is_subscribed = payload.event === "charge.success";

    if (payload.event === "subscription.create") {
      // Store webhook payload
      await supabaseAdmin.from("paystack_subscription_payloads").insert([
        {
          payload,
          user_id: customer.id,
        },
      ]);
    }

    // Store webhook payload
    await supabaseAdmin.from("paystack_payloads").insert([
      {
        payload,
        user_id: customer.id,
      },
    ]);

    // Update user subscription status
    await supabaseAdmin.from("users").update({ is_subscribed }).eq(
      "id",
      customer.id,
    );

    return c.json({ success: true, message: "Webhook processed" }, 200);
  } catch (error) {
    console.error("Webhook error:", error);
    return c.json({ success: false, message: "Internal server error" }, 500);
  }
});

Deno.serve(app.fetch);
