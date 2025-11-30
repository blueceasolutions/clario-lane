import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import crypto from "node:crypto";
import { createClient } from "jsr:@supabase/supabase-js@2";
import type { Database } from "../../supabase_types.ts";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabase_service_key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const secret = Deno.env.get("PAYSTACK_SECRET_KEY")!;

const supabaseAdmin = createClient<Database>(supabaseUrl, supabase_service_key);

function jsonResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
  });
}

async function handlePaystackWebhook(req: Request) {
  try {
    const payload = await req.json();
    const signature = req.headers.get("x-paystack-signature");

    // Verify webhook signature
    const hash = crypto.createHmac("sha512", secret)
      .update(JSON.stringify(payload))
      .digest("hex");

    if (hash !== signature) {
      return jsonResponse({ success: false, message: "Not authorized" }, 401);
    }

    // Find user by email
    const { data: customer, error: customerError } = await supabaseAdmin
      .from("users")
      .select("id")
      .eq("email", payload.data.customer.email)
      .single();

    if (customerError || !customer) {
      return new Response("user not found", { status: 400 });
    }

    const is_subscribed = payload.event === "charge.success";

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

    return new Response("got it", { status: 200 });
  } catch (error) {
    console.error("Webhook error:", error);
    return new Response("Internal server error", { status: 500 });
  }
}

Deno.serve(async (req) => {
  const url = new URL(req.url);
  const path = url.pathname;
  const method = req.method;

  // Handle CORS preflight
  if (method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, x-paystack-signature",
      },
    });
  }

  // Route matching
  if (path === "/paystack-webhook" && method === "POST") {
    return handlePaystackWebhook(req);
  }

  // 404 Not Found
  return jsonResponse({ success: false, message: "Not found" }, 404);
});
