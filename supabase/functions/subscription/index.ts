import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { Hono } from 'npm:hono'
import { createClient } from 'npm:@supabase/supabase-js@2'
import type { Database } from '../../supabase_types.ts'
import { corsMiddleware } from '../_shared/cors-middleware.ts'
import console from 'node:console'

const app = new Hono()

// Apply CORS middleware globally
app.use('/*', corsMiddleware)

const paystackSecretKey = Deno.env.get('PAYSTACK_SECRET_KEY')!
const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabase_anon_key = Deno.env.get('SUPABASE_ANON_KEY')!
const supabase_service_key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

// Paystack plan IDs for different continents
const paystackAfricaPlanId = Deno.env.get('PAYSTACK_AFRICA_PLAN_ID')!
const paystackGlobalPlanId = Deno.env.get('PAYSTACK_GLOBAL_PLAN_ID')!

const supabaseAdmin = createClient<Database>(supabaseUrl, supabase_service_key)

const planUrl = 'https://api.paystack.co/plan?status=active'
const initateTransactionUrl = 'https://api.paystack.co/transaction/initialize'
const subscriptionUrl = 'https://api.paystack.co/subscription/'

// GET /subscription/plans - Get all plans
app.get('/subscription/plans', async (c) => {
  const continent = c.req.query().c || undefined

  const planId =
    continent === 'AF' ? paystackAfricaPlanId : paystackGlobalPlanId

  console.log({
    africa: paystackAfricaPlanId,
    global: paystackGlobalPlanId,
    current: planId,
  })

  try {
    const response = await fetch(planUrl, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${paystackSecretKey}`,
        'Content-Type': 'application/json',
      },
    })

    const data = await response.json()
    const filterPlans = data.data.filter(
      (plan: any) => plan.plan_code === planId,
    )

    const plan = filterPlans.map((plan: unknown) => {
      // deno-lint-ignore no-explicit-any
      const p = plan as any
      return {
        id: p.id,
        name: p.name,
        amount: p.amount / 100,
        interval: p.interval,
        domain: p.domain,
        planCode: p.plan_code,
        description: p.description,
        currency: p.currency,
      }
    })

    return c.json(plan)
  } catch (error) {
    console.error(error)
    return c.json([])
  }
})

// POST /subscription/initialize - Initialize subscription
app.post('/subscription/initialize', async (c) => {
  try {
    const { email, amount, plan } = await c.req.json()

    const response = await fetch(initateTransactionUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${paystackSecretKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, amount: amount * 100, plan }),
    })

    const data = await response.json()
    return c.json(data)
  } catch (error) {
    console.error('Error initializing subscription:', error)
    return c.json(
      { success: false, message: 'Failed to initialize subscription' },
      500,
    )
  }
})

// POST /subscription/toggle - Toggle subscription
app.post('/subscription/toggle', async (c) => {
  try {
    const authHeader = c.req.header('Authorization')
    const { status } = await c.req.json() // enable or disable
    if (!authHeader) {
      return c.json({ success: false, message: 'Unauthorized' }, 401)
    }

    const supabaseClient = createClient<Database>(
      supabaseUrl,
      supabase_anon_key,
      {
        global: {
          headers: { Authorization: authHeader },
        },
      },
    )

    const {
      data: { user },
      error: authError,
    } = await supabaseClient.auth.getUser()

    if (authError || !user) {
      return c.json({ success: false, message: 'Unauthorized' }, 401)
    }

    // Get the latest subscription code from paystack_payloads
    const { data: subscriptionPayload, error: payloadError } =
      await supabaseAdmin
        .from('paystack_subscription_payloads')
        .select('payload')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)

    if (
      payloadError ||
      !subscriptionPayload ||
      subscriptionPayload.length === 0
    ) {
      return c.json({ success: false, message: 'No subscription found' }, 404)
    }

    const payload: any = subscriptionPayload[0].payload?.data

    // Extract subscription code and token from payload
    // deno-lint-ignore no-explicit-any
    const subscriptionCode = payload.subscription_code
    const email_token = payload.email_token

    if (!subscriptionCode || !email_token) {
      console.error(
        'Missing subscription code or email token in payload',
        payload,
      )
      return c.json(
        {
          success: false,
          message: 'Subscription details not found. Please contact support.',
        },
        404,
      )
    }

    const isStatusEnable = status === 'enable'

    const successMessage = isStatusEnable
      ? 'Subscription enabled'
      : 'Subscription disabled'
    const errorMessage = isStatusEnable
      ? 'Subscription could not be enabled'
      : 'Subscription could not be disabled'

    const response = await fetch(`${subscriptionUrl}${status}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${paystackSecretKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code: subscriptionCode, token: email_token }),
    })

    const data = await response.json()

    if (!data.status) {
      return c.json({ success: false, message: errorMessage }, 400)
    }

    // Update user status
    await supabaseAdmin
      .from('users')
      .update({ is_subscribed: isStatusEnable })
      .eq('id', user.id)

    return c.json({ success: true, message: successMessage })
  } catch (error) {
    console.error('Error cancelling subscription:', error)
    if (error instanceof Error) {
      return c.json({ success: false, message: error.message }, 500)
    }
    return c.json(
      { success: false, message: 'Failed to cancel subscription' },
      500,
    )
  }
})

app.get('/subscription/next-subscription-date', async (c) => {
  try {
    const authHeader = c.req.header('Authorization')
    if (!authHeader) {
      return c.json({ success: false, message: 'Unauthorized' }, 401)
    }

    const supabaseClient = createClient<Database>(
      supabaseUrl,
      supabase_anon_key,
      {
        global: {
          headers: { Authorization: authHeader },
        },
      },
    )

    const {
      data: { user },
      error: authError,
    } = await supabaseClient.auth.getUser()

    if (authError || !user) {
      return c.json({ success: false, message: 'Unauthorized' }, 401)
    }

    const { data, error } = await supabaseAdmin
      .from('paystack_subscription_payloads')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)

    if (error) throw error

    if (!data || data.length === 0) {
      return c.json({ success: true, message: 'No subscription found' }, 200)
    }

    const payload: any = data[0].payload?.data
    const nextPaymentDate = payload?.next_payment_date

    return c.json({
      success: true,
      message: 'Subscription health checked',
      data: { nextPaymentDate },
    })
  } catch (error) {
    console.error('Error checking subscription health:', error)
    return c.json(
      { success: false, message: 'Failed to check subscription health' },
      500,
    )
  }
})

Deno.serve(app.fetch)
