import '@supabase/functions-js/edge-runtime.d.ts'
import { Hono } from 'hono'
import { corsMiddleware } from '../_shared/cors-middleware.ts'
import { logError } from '../_shared/log-error.ts'
import {
  getDailyReminderEmail,
  getFeedbackSubmittedEmail,
  getPasswordChangedEmail,
  getSubscriptionCancelledEmail,
  getSubscriptionCreatedEmail,
  getWeeklySummaryEmail,
  getWelcomeEmail,
  type WeeklySummaryStats,
} from './templates.ts'

const app = new Hono()

// Apply CORS middleware globally
app.use('/*', corsMiddleware)

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')

interface EmailRequest {
  type:
    | 'WELCOME'
    | 'PASSWORD_CHANGED'
    | 'SUBSCRIPTION_CANCELLED'
    | 'SUBSCRIPTION_CREATED'
    | 'FEEDBACK_SUBMITTED'
    | 'DAILY_REMINDER'
    | 'WEEKLY_SUMMARY'
  email: string
  data?: any
}

app.post('/send-email', async (c) => {
  try {
    const { type, email, data } = await c.req.json<EmailRequest>()

    if (!type) {
      return c.json({ success: false, message: 'Missing required fields' }, 400)
    }

    let subject = ''
    let html = ''
    let toEmail = email // Default to the email in payload

    switch (type) {
      case 'WELCOME':
        subject = 'Welcome to Clariolane!'
        html = getWelcomeEmail(data?.name || 'there')
        break
      case 'PASSWORD_CHANGED':
        subject = 'Security Alert: Password Changed'
        html = getPasswordChangedEmail(data?.name || 'there')
        break
      case 'SUBSCRIPTION_CANCELLED':
        subject = 'Subscription Cancelled'
        html = getSubscriptionCancelledEmail(data?.name || 'there')
        break
      case 'SUBSCRIPTION_CREATED':
        subject = 'Subscription Confirmed'
        html = getSubscriptionCreatedEmail(
          data?.name || 'there',
          data?.planName,
        )
        break
      case 'FEEDBACK_SUBMITTED':
        subject = `New Feedback: ${data?.category || 'General'}`
        html = getFeedbackSubmittedEmail(
          email, // User's email (sender)
          data?.message,
          data?.category,
        )
        toEmail = 'admin@clariolane.com' // Override recipient
        break
      case 'DAILY_REMINDER':
        subject = 'Your daily reading reminder'
        html = getDailyReminderEmail(data?.name || 'there', data?.streak || 0)
        break
      case 'WEEKLY_SUMMARY':
        subject = 'Your weekly reading summary'
        html = getWeeklySummaryEmail(data?.name || 'there', {
          sessionsCompleted: data?.sessionsCompleted || 0,
          wordsRead: data?.wordsRead || 0,
          avgWpm: data?.avgWpm || 0,
          prevAvgWpm: data?.prevAvgWpm || 0,
          bestWpm: data?.bestWpm || 0,
          bestWpmDate: data?.bestWpmDate || '',
          streak: data?.streak || 0,
        } satisfies WeeklySummaryStats)
        break
      default:
        return c.json({ success: false, message: 'Invalid email type' }, 400)
    }

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'Clariolane <noreply@clariolane.com>',
        to: [toEmail],
        subject: subject,
        html: html,
      }),
    })

    if (!res.ok) {
      const errorText = await res.text()
      await logError(new Error(`Resend API error: ${errorText}`), {
        function: 'send-email',
        step: 'call_resend_api',
        emailType: type,
      })
      return c.json({ success: false, message: 'Failed to send email' }, 500)
    }

    const result = await res.json()
    return c.json({ success: true, id: result.id })
  } catch (error) {
    await logError(error, { function: 'send-email', step: 'send_email' })
    return c.json({ success: false, message: 'Internal server error' }, 500)
  }
})

Deno.serve(app.fetch)
