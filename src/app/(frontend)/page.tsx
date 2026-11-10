import { PageNotAvailable } from '@/components/PageNotAvailable'
import { RenderSections } from '@/components/RenderSections'
import { getPublishedPage } from '@/lib/getPage'
import { HOME_SLUG } from '@/pageTypes'

export const dynamic = 'force-dynamic'

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
