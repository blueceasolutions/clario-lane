import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const paystackSecretKey = Deno.env.get("PAYSTACK_SECRET_KEY")!;

const planUrl = "https://api.paystack.co/plan";
const initateTransactionUrl = "https://api.paystack.co/transaction/initialize";

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

    const plans = data.data.map((plan: any) => ({
      id: plan.id,
      name: plan.name,
      amount: plan.amount / 100,
      interval: plan.interval,
      domain: plan.domain,
      planCode: plan.plan_code,
      description: plan.description,
      currency: plan.currency,
    }));

    return jsonResponse(plans);
  } catch (error) {
    console.log(error);
    return jsonResponse([]);
  }
}

async function handleInitializeSubscription(req: Request) {
  try {
    const { email, amount, plan } = await req.json();

    const response = await fetch(initateTransactionUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${paystackSecretKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, amount: amount * 100, plan }),
    });

    const data = await response.json();

    return jsonResponse(data);
  } catch (error) {
    console.error("Error initializing subscription:", error);
    return jsonResponse(
      { success: false, message: "Failed to initialize subscription" },
      500,
    );
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

  // 404 Not Found
  return jsonResponse({ success: false, message: "Not found" }, 404);
});
