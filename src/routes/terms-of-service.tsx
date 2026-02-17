import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/terms-of-service')({
  component: TermsOfServicePage,
})

function TermsOfServicePage() {
  return (
    <div className='container mx-auto max-w-4xl py-12 pt-28 px-4'>
      <h1 className='text-3xl font-bold mb-8'>Terms of Service</h1>
      <div className='prose dark:prose-invert max-w-none'>
        <p className='text-muted-foreground mb-6'>
          Effective Date: February 11, 2026
        </p>

        <section className='mb-8'>
          <h2 className='text-2xl font-semibold mb-4'>
            1. Subscription & Billing
          </h2>
          <ul className='list-disc pl-6 space-y-2'>
            <li>
              <strong>Pricing:</strong> Access to Clariolane is $5 USD per
              month.
            </li>
            <li>
              <strong>Recurring Billing:</strong> Subscriptions automatically
              renew every 30 days. Your card or means of payment will be debited
              via PayStack unless you cancel.
            </li>
            <li>
              <strong>Cancellation:</strong> You may cancel at any time via your
              dashboard. To avoid being charged for the next period, you must
              cancel before your billing date.
            </li>
            <li>
              <strong>Fees:</strong> Clariolane covers all transaction fees
              associated with your subscription.
            </li>
          </ul>
        </section>

        <section className='mb-8'>
          <h2 className='text-2xl font-semibold mb-4'>2. Referral Program</h2>
          <ul className='list-disc pl-6 space-y-2'>
            <li>
              <strong>Earnings:</strong> You earn $1.50 for every unique user
              who signs up via your link and completes a paid subscription.
            </li>
            <li>
              <strong>One-Time Payment:</strong> Referral commissions are
              one-time only. You do not receive recurring commissions if the
              referred user renews their subscription.
            </li>
            <li>
              <strong>Minimum Withdrawal:</strong> You can request a payout once
              your "Referral Dashboard" balance reaches $10 USD.
            </li>
            <li>
              <strong>N/B:</strong> You are responsible for the transaction
              fees.
            </li>
            <li>
              <strong>Tracking:</strong> Referrals are tracked via your unique
              link. If a user signs up without using your link, we cannot
              manually credit you for that referral.
            </li>
          </ul>
        </section>

        <section className='mb-8'>
          <h2 className='text-2xl font-semibold mb-4'>3. User Conduct</h2>
          <p>
            Users are prohibited from attempting to "game" the referral system
            through fake accounts or automated bots. Clariolane reserves the
            right to terminate accounts found engaging in fraudulent activity.
          </p>
        </section>

        <section className='mb-8'>
          <h2 className='text-2xl font-semibold mb-4'>
            4. Limitation of Liability
          </h2>
          <p>
            Clariolane provides practice tools to improve reading. We do not
            guarantee specific academic or professional results. The service is
            provided "as is."
          </p>
        </section>

        <hr className='my-8 border-gray-200 dark:border-gray-800' />

        <h1 className='text-3xl font-bold mb-8'>Refund Policy</h1>
        <p className='text-muted-foreground mb-6'>
          Last Updated: February 11, 2026
        </p>

        <section className='mb-8'>
          <p className='mb-4'>
            At Clariolane, we strive to provide the best tools for speed reading
            and comprehension. Because our service is a digital product provided
            instantly upon payment, our refund policy is as follows:
          </p>
          <ul className='list-disc pl-6 space-y-2'>
            <li>
              <strong>Subscription Renewals:</strong> You may cancel your
              monthly subscription at any time. To avoid being charged for the
              next billing cycle, you must cancel at least 24 hours before your
              renewal date.
            </li>
            <li>
              <strong>Partial Months:</strong> We do not offer prorated refunds
              for mid-month cancellations. If you cancel early, you will
              continue to have full access to Clariolane features until the end
              of your current 30-day billing period.
            </li>
            <li>
              <strong>Refund Requests:</strong> Refunds are generally not
              granted once a billing cycle has been processed. However, if you
              believe there has been a technical error or an unauthorized
              charge, please contact us at support@clariolane.com within 7 days
              of the transaction, and we will investigate.
            </li>
            <li>
              <strong>Referral Earnings:</strong> Refunded subscriptions do not
              count toward referral earnings. If a referred user’s payment is
              refunded or charged back, the $1.50 commission will be deducted
              from the referrer's dashboard.
            </li>
          </ul>
        </section>

        <hr className='my-8 border-gray-200 dark:border-gray-800' />

        <h1 className='text-3xl font-bold mb-8'>Referral Program FAQ</h1>

        <section className='mb-6'>
          <h3 className='text-xl font-semibold mb-2'>
            How do I make money with Clariolane?
          </h3>
          <p>
            Every user gets a unique referral link in their dashboard. Share
            this link with friends, students, or colleagues. When someone signs
            up and subscribes for $5, you earn $1.50.
          </p>
        </section>

        <section className='mb-6'>
          <h3 className='text-xl font-semibold mb-2'>
            How do I track my earnings?
          </h3>
          <p>Your Referral Dashboard shows real-time stats, including:</p>
          <ul className='list-disc pl-6 space-y-1 mt-2'>
            <li>Total clicks on your link.</li>
            <li>Number of successful (paid) subscribers.</li>
            <li>Your current withdrawable balance.</li>
          </ul>
        </section>

        <section className='mb-6'>
          <h3 className='text-xl font-semibold mb-2'>
            When can I withdraw my money?
          </h3>
          <p>
            Once your balance hits the $10 minimum, a "Withdraw" button will be
            activated in your dashboard.
          </p>
        </section>

        <section className='mb-6'>
          <h3 className='text-xl font-semibold mb-2'>How are payments sent?</h3>
          <p>
            Payouts are processed via [e.g., Bank Transfer / Paystack Payout].
            Please ensure your payment details are correctly filled out when the
            "Withdraw" button gets activated in your dashboard. (Note: Payouts
            are usually processed within 3–5 business days after confirmation).
          </p>
        </section>

        <section className='mb-6'>
          <h3 className='text-xl font-semibold mb-2'>
            Is the commission recurring?
          </h3>
          <p>
            No. The $1.50 is a one-time reward for the initial signup. You do
            not receive additional payments when the user renews their
            subscription for the second month.
          </p>
        </section>

        <section className='mb-6'>
          <h3 className='text-xl font-semibold mb-2'>
            What if my friend forgot to use my link?
          </h3>
          <p>
            Our system uses cookies to track your referrals. If a user does not
            use your specific link to sign up, the system cannot attribute the
            sale to you. We cannot manually add referrals to your account after
            a signup is complete.
          </p>
        </section>

        <section className='mb-6'>
          <h3 className='text-xl font-semibold mb-2'>
            Active Account Requirement
          </h3>
          <p>
            To be eligible to receive referral payouts, you must maintain an
            active, paid subscription. Any referrals generated or completed
            during a period when your account is deactivated, expired, or
            cancelled will not be credited to your dashboard or count toward
            your earnings.
          </p>
          <p>
            You can only use the email you used to signup for clariolane to
            signup for the referral program(ClarioLane), if not all referral
            bonuses will be forfeited because the system will see the account as
            Inactive
          </p>
        </section>
      </div>
    </div>
  )
}
