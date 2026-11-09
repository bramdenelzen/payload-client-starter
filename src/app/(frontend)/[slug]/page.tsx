import type { Metadata } from 'next'
import { redirect } from 'next/navigation'

import { PageNotAvailable } from '@/components/PageNotAvailable'
import { RenderSections } from '@/components/RenderSections'
import { getPublishedPage } from '@/lib/getPage'
import { toSlug } from '@/lib/slug'
import { HOME_SLUG } from '@/pageTypes'

export const dynamic = 'force-dynamic'

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const result = await getPublishedPage((await params).slug)
  return result.status === 'found' ? { title: result.page.title } : {}
}

export default async function Page({ params }: Props) {
  const { slug: rawSlug } = await params
  const slug = toSlug(decodeURIComponent(rawSlug))

  // One URL per page: /home lives at /, and "/Contact%20Us" goes to "/contact-us".
  if (slug === HOME_SLUG) {
    redirect('/')
  }
  if (slug !== rawSlug) {
    redirect(`/${slug}`)
  }

  const result = await getPublishedPage(slug)
  if (result.status !== 'found') {
    return <PageNotAvailable slug={slug} status={result.status} />
  }
  return (
    <main>
      <RenderSections sections={result.page.layout} />
    </main>
  )
}
