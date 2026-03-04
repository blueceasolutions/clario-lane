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
              <strong>Pricing:</strong> Access to Clariolane is $5.00 USD per
              month for international users. For users within the African
              continent, a localized rate of ₦2,900 NGN applies.
            </li>
            <li>
              <strong>Recurring Billing:</strong> Subscriptions automatically
              renew every 30 days via PayStack unless cancelled.
            </li>
            <li>
              <strong>Cancellation:</strong> You may cancel at any time via your
              dashboard. To avoid being charged for the next period, you must
              cancel at least 24 hours before your billing date.
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
              <strong>Affiliate Program Link:</strong>{' '}
              <a
                href='https://affiliate.bluecea.com/'
                target='_blank'
                rel='noreferrer'
                className='text-blue-600 dark:text-blue-400 hover:underline'>
                https://affiliate.bluecea.com/
              </a>
            </li>
            <li>
              <strong>Commission Structure:</strong> Affiliates earn a 30%
              commission on the "Net Plan Fee" (Base Plan Fee minus 4%
              Maintenance Fee).
              <ul className='list-[circle] pl-6 mt-2 space-y-1'>
                <li>
                  International ($): $5.00 - 4% ($0.20) = $4.80 Net. Commission:
                  $1.44 USD.
                </li>
                <li>
                  African (₦): ₦2,900 - 4% (₦116) = ₦2,784 Net. Commission:
                  ₦835.20.
                </li>
              </ul>
            </li>
            <li>
              <strong>Currency Conversion:</strong> All earnings from Naira (₦)
              transactions are converted to USD ($) at the current market rate
              at the time of the transaction and added to your Available
              Balance.
            </li>
            <li>
              <strong>One-Time Payment:</strong> Commissions are one-time only
              for the initial signup. No recurring commissions are paid on
              renewals.
            </li>
            <li>
              <strong>Minimum Withdrawal:</strong> The minimum withdrawal limit
              is $10.00 USD. You can request a payout once your{' '}
              <a
                href='https://affiliate.bluecea.com/affiliate/wallet'
                target='_blank'
                rel='noreferrer'
                className='text-blue-600 dark:text-blue-400 hover:underline'>
                "Wallet"
              </a>{' '}
              balance reaches $10 USD.
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
              refunded or charged back, the associated commission will be
              deducted from the referrer's dashboard balance.
            </li>
          </ul>
        </section>

        <hr className='my-8 border-gray-200 dark:border-gray-800' />

        <h1 className='text-3xl font-bold mb-8'>Referral Program FAQ</h1>

        <section className='mb-6'>
          <h3 className='text-xl font-semibold mb-2'>
            How do I make money with Clariolane?
          </h3>
          <p className='mb-2'>
            Every user can join the{' '}
            <a
              href='https://affiliate.bluecea.com/'
              target='_blank'
              rel='noreferrer'
              className='text-blue-600 dark:text-blue-400 hover:underline'>
              Blucea Affiliate Program
            </a>
            . Once you select Clariolane as your promoted product, you will
            receive a unique referral link. Share this link with friends,
            students, and colleagues. When a new user signs up and completes a
            subscription via your link, you earn a one-time bonus. Earnings are
            calculated as 30% of the plan price after a 4% maintenance fee is
            deducted.
          </p>
          <ul className='list-disc pl-6 space-y-1'>
            <li>If your referral pays $5, you earn $1.44.</li>
            <li>
              If your referral pays ₦2,900, you earn ₦835.20 (converted to USD
              in your dashboard).
            </li>
          </ul>
        </section>

        <section className='mb-6'>
          <h3 className='text-xl font-semibold mb-2'>
            How do I track my earnings?
          </h3>
          <p className='mb-2'>
            Your{' '}
            <a
              href='https://affiliate.bluecea.com/dashboard#'
              target='_blank'
              rel='noreferrer'
              className='text-blue-600 dark:text-blue-400 hover:underline'>
              Bluecea Affiliate Dashboard
            </a>{' '}
            shows real-time stats, including:
          </p>
          <ul className='list-disc pl-6 space-y-1'>
            <li>Total clicks on your link.</li>
            <li>Number of successful (paid) subscribers.</li>
            <li>Your current withdrawable balance.</li>
          </ul>
        </section>

        <section className='mb-6'>
          <h3 className='text-xl font-semibold mb-2'>
            Why am I not getting conversions (Referral Bonuses)?
          </h3>
          <p className='mb-2'>
            Our "Active Member" policy requires a live subscription to benefit
            from the affiliate program. By cancelling your subscription, you are
            signaling the end of your partnership with the program. Therefore,
            any referrals made during a "Cancelled" or "Expired" state—including
            the remaining days of your final month—are forfeited.
          </p>
          <p className='mb-2 font-medium'>
            To earn and accumulate bonuses, you must maintain an Active Paid
            Subscription to Clariolane.
          </p>
          <ul className='list-disc pl-6 space-y-2'>
            <li>
              <strong>The "Active" Rule:</strong> If your subscription is
              inactive, expired, or has been cancelled, you are no longer
              eligible to earn referral bonuses.
            </li>
            <li>
              <strong>Immediate Forfeiture:</strong> Please note that once you
              click "Cancel Subscription," you immediately forfeit your right to
              earn new referral bonuses. Any conversions attempted by your
              referrals during a cancelled or "grace period" state will not be
              credited and are permanently forfeited.
            </li>
            <li>
              <strong>System Tracking:</strong> Our system uses cookies to track
              referrals. If a user does not use your specific link or has
              cookies disabled, the system cannot attribute the sale. We cannot
              manually credit referrals after a signup is complete.
            </li>
          </ul>
        </section>

        <section className='mb-6'>
          <h3 className='text-xl font-semibold mb-2'>
            When can I withdraw my money?
          </h3>
          <p className='mb-2'>
            Once your balance hits the $10 minimum, a "Request Withdrawal"
            button will be activated in your{' '}
            <a
              href='https://affiliate.bluecea.com/affiliate/wallet'
              target='_blank'
              rel='noreferrer'
              className='text-blue-600 dark:text-blue-400 hover:underline'>
              wallet
            </a>
            .
          </p>
          <ul className='list-disc pl-6 space-y-2'>
            <li>
              <strong>Pending Status:</strong> When you request a withdrawal,
              the amount is held for processing.
            </li>
            <li>
              <strong>Rejected Withdrawals:</strong> If a withdrawal is rejected
              (e.g., due to incorrect bank details), the funds are immediately
              returned to your "Available Balance."
            </li>
            <li>
              <strong>Approved Withdrawals:</strong> Once approved, the funds
              are deducted from your "Available Balance," and the payout process
              begins.
            </li>
          </ul>
        </section>

        <section className='mb-6'>
          <h3 className='text-xl font-semibold mb-2'>
            When will I receive my money?
          </h3>
          <p>
            We process all approved withdrawal requests once a month, between
            the 25th and the 30th. If your request is made after the 25th, it
            may be rolled over to the following month's payout window.
          </p>
        </section>

        <section className='mb-6'>
          <h3 className='text-xl font-semibold mb-2'>How are payments sent?</h3>
          <p className='mb-2'>
            Payouts are processed via Bank Transfer or PayStack Payout. Please
            ensure your payment details are correctly filled out in your profile
            settings.
          </p>
          <ul className='list-disc pl-6 space-y-2'>
            <li>
              <strong>Processing Time:</strong> Payouts are typically finalized
              within 3–5 business days.
            </li>
            <li>
              <strong>Note on Transaction Costs:</strong> Blucea Solutions
              Limited facilitates the referral program as a value-add for active
              Clariolane subscribers. To maintain the commission rate, all
              third-party processing fees, bank charges, or "gas fees" incurred
              during the payout process are the sole responsibility of the
              Affiliate(Non Africans ONLY). By requesting a withdrawal, you
              agree to receive the net amount after these mandatory deductions.
            </li>
          </ul>
        </section>

        <section className='mb-6'>
          <h3 className='text-xl font-semibold mb-2'>
            Why was my received amount lower than my withdrawal request?
            (International Users)
          </h3>
          <p>
            For international payouts, the user is responsible for the
            gas/transaction fees. Your automated email receipt will contain an
            attachment showing exactly how much the third-party processors
            charged for the transfer. For users receiving funds in Naira
            (African continent), these specific fees are currently covered by
            Bluecea Solutions Limited.
          </p>
        </section>

        <section className='mb-6'>
          <h3 className='text-xl font-semibold mb-2'>
            Is the commission recurring?
          </h3>
          <p>
            No. The commission is a one-time reward for the initial signup. You
            do not receive additional payments for subsequent monthly renewals
            by the same user.
          </p>
        </section>

        <section className='mb-6'>
          <h3 className='text-xl font-semibold mb-2'>
            What if my friend forgot to use my link?
          </h3>
          <p>
            Our system uses cookies to track your referrals. If a user does not
            use your specific link to sign up, the system cannot attribute the
            sale to you. We cannot manually add or retroactively credit
            referrals to your account after a signup is complete.
          </p>
        </section>

        <section className='mb-6'>
          <h3 className='text-xl font-semibold mb-2'>
            Active Account Requirement
          </h3>
          <p className='mb-2'>
            To be eligible to receive referral payouts, you must maintain an
            active, paid subscription. Any referrals generated or completed
            during a period when your account is deactivated, expired, or
            cancelled will not be credited to your dashboard or count toward
            your earnings.
          </p>
          <p className='mb-2'>
            You can only use the email you used to signup for Clariolane to
            signup for the referral program(ClarioLane), if not all referral
            bonuses will be forfeited because the system will see the account as
            Inactive.
          </p>
        </section>

        <section className='mb-6'>
          <h3 className='text-xl font-semibold mb-2'>
            Important Note on "Active Status"
          </h3>
          <p>
            <strong>Strict Policy:</strong> To protect the integrity of the
            Blucea Solutions ecosystem, referral earnings are reserved for
            active members of the Clariolane community. Any referrals generated
            while your account is in a "Cancelled" or "Expired" state will not
            be recovered or credited back once you resubscribe.
          </p>
        </section>
      </div>
    </div>
  )
}
