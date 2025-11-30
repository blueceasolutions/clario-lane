import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import type { Database } from "../../supabase_types.ts";

const paystackSecretKey = Deno.env.get("PAYSTACK_SECRET_KEY")!;
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabase_anon_key = Deno.env.get("SUPABASE_ANON_KEY")!;
const supabase_service_key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabaseAdmin = createClient<Database>(supabaseUrl, supabase_service_key);

const planUrl = "https://api.paystack.co/plan";
const initateTransactionUrl = "https://api.paystack.co/transaction/initialize";
const initateSubscriptionUrl = "https://api.paystack.co/subscription";
const disableSubscriptionUrl = "https://api.paystack.co/subscription/disable";

function jsonResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

async function handleGetPlans() {
  try {
    const response = await fetch(planUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${paystackSecretKey}`,
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    const plans = data.data.map((plan: unknown) => {
      // deno-lint-ignore no-explicit-any
      const p = plan as any;
      return {
        id: p.id,
        name: p.name,
        amount: p.amount / 100,
        interval: p.interval,
        domain: p.domain,
        planCode: p.plan_code,
        description: p.description,
        currency: p.currency,
      };
    });

    return jsonResponse(plans);
  } catch (error) {
    console.log(error);
    return jsonResponse([]);
  }
}

async function createCustomer(email: string, name: string) {
  const url = `https://api.paystack.co/customer`;
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${paystackSecretKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, name }),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.log(error);
    return jsonResponse([]);
  }
}

async function handleInitializeSubscription(req: Request) {
  try {
    const { email, amount, plan } = await req.json();

    // const customer = await createCustomer(email, name);

    const response = await fetch(initateTransactionUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${paystackSecretKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, amount: amount * 100, plan }),
    });

    const data = await response.json();
    console.log(data);
    return jsonResponse(data);
  } catch (error) {
    console.error("Error initializing subscription:", error);
    return jsonResponse(
      { success: false, message: "Failed to initialize subscription" },
      500,
    );
  }
}

async function handleCancelSubscription(req: Request) {
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return jsonResponse({ success: false, message: "Unauthorized" }, 401);
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
      return jsonResponse({ success: false, message: "Unauthorized" }, 401);
    }

    // Get the latest subscription code from paystack_payloads
    const { data: payloads, error: payloadError } = await supabaseAdmin
      .from("paystack_payloads")
      .select("payload")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1);

    if (payloadError || !payloads || payloads.length === 0) {
      return jsonResponse(
        { success: false, message: "No subscription found" },
        404,
      );
    }

    // Extract subscription code and token from payload
    // The payload structure depends on the Paystack event, but usually 'data.subscription_code' or similar
    // We'll try to find it in the payload
    // deno-lint-ignore no-explicit-any
    const payloadData = payloads[0].payload as any;
    const subscriptionCode = payloadData.data?.authorization
      ?.authorization_code;
    const email_token = payloadData.data?.customer?.email; // Required for disable endpoint

    console.log({
      subscriptionCode,
      email_token,
      payloadData,
    });

    if (!subscriptionCode || !email_token) {
      console.error(
        "Missing subscription code or email token in payload",
        payloadData,
      );
      return jsonResponse({
        success: false,
        message: "Subscription details not found. Please contact support.",
      }, 404);
    }

    const response = await fetch(disableSubscriptionUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${paystackSecretKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ code: subscriptionCode, token: email_token }),
    });

    const data = await response.json();

    if (!data.status) {
      return jsonResponse({ success: false, message: data.message }, 400);
    }

    // Update user status
    await supabaseAdmin
      .from("users")
      .update({ is_subscribed: false })
      .eq("id", user.id);

    return jsonResponse({ success: true, message: "Subscription cancelled" });
  } catch (error) {
    console.error("Error cancelling subscription:", error);
    return jsonResponse(
      { success: false, message: "Failed to cancel subscription" },
      500,
    );
  }
}

Deno.serve((req) => {
  const url = new URL(req.url);
  const path = url.pathname;
  const method = req.method;

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

  // Route matching
  if (path === "/subscription/plans" && method === "GET") {
    return handleGetPlans();
  }

  if (path === "/subscription/initialize" && method === "POST") {
    return handleInitializeSubscription(req);
  }

  if (path === "/subscription/cancel" && method === "POST") {
    return handleCancelSubscription(req);
  }

  // 404 Not Found
  return jsonResponse({ success: false, message: "Not found" }, 404);
});
