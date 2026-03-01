export const Copyright = () => {
  return (
    <div className='mt-12 py-6 text-center text-sm text-muted-foreground'>
      <p>
        © 2026{' '}
        <a
          href='https://bluecea.com'
          target='_blank'
          rel='noreferrer'
          className='text-blue-600 dark:text-blue-400 hover:underline'>
          Bluecea Solutions Ltd
        </a>
        . All rights reserved.
      </p>
      <a
        href='https://affiliate.bluecea.com'
        target='_blank'
        rel='noreferrer'
        className='text-blue-600 dark:text-blue-400 underline text-xs font-mono'>
        Affiliate Program
      </a>
    </div>
  )
}
