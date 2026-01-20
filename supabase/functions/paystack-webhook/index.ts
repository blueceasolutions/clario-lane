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

async function invokeSendEmail(type: string, email: string, data: any) {
  const functionUrl = `${supabaseUrl}/functions/v1/send-email`;
  console.log(`Invoking send-email: ${functionUrl} for ${type}`);

  try {
    const response = await fetch(functionUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${supabase_service_key}`,
      },
      body: JSON.stringify({ type, email, data }),
    });

    if (!response.ok) {
      console.error(
        `Failed to send email: ${response.status} ${await response.text()}`,
      );
    } else {
      console.log("Email sent successfully");
    }
  } catch (err) {
    console.error("Error invoking send-email:", err);
  }
}

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

    if (payload.event === "charge.success") {
      // Update user subscription status
      await supabaseAdmin.from("users").update({ is_subscribed: true }).eq(
        "id",
        customer.id,
      );

      // Send subscription created email
      // Assuming 'customer' object from Supabase has 'name', if not we might need to fetch it or use email.
      // The 'users' table has a 'name' column.
      const { data: userData } = await supabaseAdmin.from("users").select(
        "name",
      ).eq("id", customer.id).single();

      await invokeSendEmail(
        "SUBSCRIPTION_CREATED",
        payload.data.customer.email,
        {
          name: userData?.name || "Customer",
          planName: payload.data.plan?.name,
        },
      );
    }

    if (
      payload.event === "subscription.not_renew" ||
      payload.event === "subscription.disable"
    ) {
      // Update user subscription status
      await supabaseAdmin.from("users").update({ is_subscribed: false }).eq(
        "id",
        customer.id,
      );

      const { data: userData } = await supabaseAdmin.from("users").select(
        "name",
      ).eq("id", customer.id).single();

      await invokeSendEmail(
        "SUBSCRIPTION_CANCELLED",
        payload.data.customer.email,
        {
          name: userData?.name || "Customer",
        },
      );
    }

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

    return c.json({ success: true, message: "Webhook processed" }, 200);
  } catch (error) {
    console.error("Webhook error:", error);
    return c.json({ success: false, message: "Internal server error" }, 500);
  }
});

Deno.serve(app.fetch);
