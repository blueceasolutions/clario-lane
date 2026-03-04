const BASE_STYLES = `
  body { font-family: 'Inter', sans-serif; background-color: #f9fafb; margin: 0; padding: 0; color: #1f2937; }
  .container { max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06); }
  .header { background-color: #ffffff; padding: 24px; text-align: center; border-bottom: 1px solid #e5e7eb; }
  .logo { height: 32px; }
  .content { padding: 32px 24px; }
  .h1 { font-size: 24px; font-weight: 700; color: #111827; margin-bottom: 16px; margin-top: 0; }
  .p { font-size: 16px; line-height: 24px; margin-bottom: 16px; color: #4b5563; }
  .button { display: inline-block; border: 2px solid #8e51ff; color: #8e51ff !important; font-weight: 600; padding: 12px 24px; border-radius: 6px; text-decoration: none; margin-top: 16px; }
  .footer { background-color: #f9fafb; padding: 24px; text-align: center; font-size: 14px; color: #6b7280; border-top: 1px solid #e5e7eb; }
  .link { color: #2563eb; text-decoration: none; }
`;

// TODO: Replace with actual hosted URL of the logo
const LOGO_URL =
  "https://res.cloudinary.com/dgdlf0668/image/upload/v1770759102/brand_ztp3ex.png";

const baseLayout = (content: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Clariolane</title>
  <style>${BASE_STYLES}</style>
</head>
<body>
  <div class="container">
    <div class="header">
      <img src="${LOGO_URL}" alt="Clariolane" class="logo">
    </div>
    <div class="content">
      ${content}
    </div>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} Clariolane. All rights reserved.</p>
      <p>123 Innovation Dr, Tech City, TC 90210</p>
      <p><a href="#" class="link">Unsubscribe</a></p>
    </div>
  </div>
</body>
</html>
`;

export const getFeedbackSubmittedEmail = (
  email: string,
  message: string,
  category: string,
) =>
  baseLayout(`
  <h1 class="h1">New Feedback Received</h1>
  <p class="p"><strong>From:</strong> ${email}</p>
  <p class="p"><strong>Category:</strong> ${category}</p>
  <p class="p"><strong>Message:</strong></p>
  <blockquote style="border-left: 4px solid #e5e7eb; padding-left: 16px; margin-left: 0; color: #374151;">
    ${message.replace(/\n/g, "<br/>")}
  </blockquote>
`);

export const getWelcomeEmail = (name: string) =>
  baseLayout(`
  <h1 class="h1">Welcome to Clariolane, ${name}!</h1>
  <p class="p">We're thrilled to have you on board. Clariolane is here to help you achieve your reading and comprehension goals.</p>
  <p class="p">Get started by exploring your dashboard and setting up your first practice session.</p>
  <a href="https://clariolane.com/dashboard" class="button">Go to Dashboard</a>
`);

export const getPasswordChangedEmail = (name: string) =>
  baseLayout(`
  <h1 class="h1">Password Changed</h1>
  <p class="p">Hello ${name},</p>
  <p class="p">The password for your Clariolane account was recently changed. If you made this change, you can safely ignore this email.</p>
  <p class="p">If you did not make this change, please contact our support team immediately.</p>
  <a href="mailto:support@clariolane.com" class="button">Contact Support</a>
`);

export const getSubscriptionCancelledEmail = (name: string) =>
  baseLayout(`
  <h1 class="h1">Subscription Cancelled</h1>
  <p class="p">Hi ${name},</p>
  <p class="p">We're sorry to see you go. Your subscription has been successfully cancelled.</p>
  <p class="p">You will continue to have access to your plan benefits until the end of your current billing period.</p>
  <p class="p">We hope to see you back soon!</p>
  <a href="https://clariolane.com/pricing" class="button">Renew Subscription</a>
`);

export const getSubscriptionCreatedEmail = (name: string, planName?: string) =>
  baseLayout(`
  <h1 class="h1">Subscription Confirmed!</h1>
  <p class="p">Hi ${name},</p>
  <p class="p">Thank you for subscribing to Clariolane${
    planName ? ` ${planName}` : ""
  }. We're excited to support your journey.</p>
  <p class="p">You now have full access to all premium features.</p>
  <a href="https://clariolane.com/dashboard" class="button">Start Learning</a>
`);
