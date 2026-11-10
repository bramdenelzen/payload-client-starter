import type { Metadata } from 'next'
import { buildMetadata } from 'payload-seo-autopilot/next'

import { PageNotAvailable } from '@/components/PageNotAvailable'
import { RenderSections } from '@/components/RenderSections'
import { getPublishedPage } from '@/lib/getPage'
import { HOME_SLUG } from '@/pageTypes'
import { seoConfig } from '@/seo.config'

export const dynamic = 'force-dynamic'

export async function generateMetadata(): Promise<Metadata> {
  const result = await getPublishedPage(HOME_SLUG)
  return result.status === 'found' ? buildMetadata({ collection: 'pages', config: seoConfig, doc: result.page }) : {}
}

export default async function HomePage() {
  const result = await getPublishedPage(HOME_SLUG)
  if (result.status !== 'found') {
    return <PageNotAvailable slug={HOME_SLUG} status={result.status} />
  }
  return (
    <main>
      <RenderSections sections={result.page.layout} />
    </main>
  )
}
