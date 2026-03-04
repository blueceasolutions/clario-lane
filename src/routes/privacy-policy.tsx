import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/privacy-policy')({
  component: PrivacyPolicyPage,
})

function PrivacyPolicyPage() {
  return (
    <div className='container mx-auto max-w-4xl py-12 pt-28 px-4'>
      <h1 className='text-3xl font-bold mb-8'>Privacy Policy</h1>
      <div className='prose dark:prose-invert max-w-none'>
        <p className='text-muted-foreground mb-6'>
          Effective Date: February 11, 2026
        </p>

        <section className='mb-8'>
          <h2 className='text-2xl font-semibold mb-4'>Overview</h2>
          <p>
            At Clariolane, we respect your privacy. This policy explains what
            data we collect and how we use it to provide our speed reading and
            comprehension services.
          </p>
        </section>

        <section className='mb-8'>
          <h2 className='text-2xl font-semibold mb-4'>Data We Collect</h2>
          <ul className='list-disc pl-6 space-y-2'>
            <li>
              <strong>Account Information:</strong> Name and email address (via
              direct signup or SSO providers like Google/Apple).
            </li>
            <li>
              <strong>Usage Data:</strong> Practice test scores, Words Per
              Minute (WPM) progress, and comprehension levels.
            </li>
            <li>
              <strong>Referral Data:</strong> Clicks on your unique referral
              link and successful conversions.
            </li>
          </ul>
        </section>

        <section className='mb-8'>
          <h2 className='text-2xl font-semibold mb-4'>Payment Processing</h2>
          <p>
            We use Paystack to process all payments. Clariolane never sees or
            stores your credit/debit card details. All financial data is handled
            securely by Paystack according to their privacy standards.
          </p>
        </section>

        <section className='mb-8'>
          <h2 className='text-2xl font-semibold mb-4'>How We Use Your Data</h2>
          <ul className='list-disc pl-6 space-y-2'>
            <li>To manage your account and track your reading progress.</li>
            <li>To process your monthly subscription.</li>
            <li>To calculate and pay out referral earnings.</li>
            <li>To send essential service updates or password resets.</li>
          </ul>
        </section>

        <section className='mb-8'>
          <h2 className='text-2xl font-semibold mb-4'>Third-Party Sharing</h2>
          <p>
            We do not sell your data. We only share information with third
            parties (like Paystack for payments or your SSO provider) necessary
            to run the service.
          </p>
        </section>
      </div>
    </div>
  )
}
