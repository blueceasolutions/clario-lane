import { Helmet } from 'react-helmet-async'

interface SeoHeadProps {
  title: string
  description?: string
  image?: string
  url?: string
  type?: 'website' | 'article' | 'profile'
}

export const SeoHead = ({
  title,
  description = 'Speed reading and comprehension training application. Improve your reading skills with Clariolane.',
  image = '/dashboard-light.png',
  url = typeof window !== 'undefined' ? window.location.href : '',
  type = 'website',
}: SeoHeadProps) => {
  const siteName = 'Clariolane'
  const fullTitle = `${title} | ${siteName}`

  return (
    <Helmet>
      {/* Standard Metadata */}
      <title>{fullTitle}</title>
      <meta name='description' content={description} />
      <meta name='viewport' content='width=device-width, initial-scale=1' />

      {/* Open Graph / Facebook */}
      <meta property='og:type' content={type} />
      <meta property='og:url' content={url} />
      <meta property='og:title' content={fullTitle} />
      <meta property='og:description' content={description} />
      <meta property='og:image' content={image} />
      <meta property='og:site_name' content={siteName} />

      {/* Twitter */}
      <meta name='twitter:card' content='summary_large_image' />
      <meta name='twitter:url' content={url} />
      <meta name='twitter:title' content={fullTitle} />
      <meta name='twitter:description' content={description} />
      <meta name='twitter:image' content={image} />
    </Helmet>
  )
}
