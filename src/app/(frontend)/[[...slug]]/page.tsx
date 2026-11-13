import type { Metadata } from 'next'
import { notFound, permanentRedirect } from 'next/navigation'
import { buildMetadata } from 'payload-seo-autopilot/next'

import { PageNotAvailable } from '@/components/PageNotAvailable'
import { RenderSections } from '@/components/RenderSections'
import { findRedirect, getPublishedPage } from '@/lib/getPage'
import { toSlug } from '@/lib/slug'
import { HOME_SLUG } from '@/pageTypes'
import { seoConfig } from '@/seo.config'

/**
 * Every public page, including the home page at "/".
 *
 * Pages are rendered on their first visit and then served from the cache (ISR). Nothing is
 * rendered at build time, so the build never needs the database. When an editor publishes,
 * unpublishes, deletes or renames a page, payload-section-builder revalidates its cache tags
 * and the next visitor gets the new version. See src/lib/getPage.ts.
 */
export async function generateStaticParams() {
  return []
}

type Props = { params: Promise<{ slug?: string[] }> }

/**
 * The page slug for a URL: "/" -> "home", "/contact" -> "contact".
 * `redirect` is set when the URL isn't the page's one URL: "/home" -> "/", "/Contact%20Us" -> "/contact-us".
 * `null` for nested paths like "/a/b": pages have no nested URLs.
 */
const resolveSlug = async (params: Props['params']): Promise<{ redirect?: string; slug: string } | null> => {
  const { slug: segments = [] } = await params
  if (segments.length === 0) {
    return { slug: HOME_SLUG }
  }
  if (segments.length > 1) {
    return null
  }
  const raw = decodeURIComponent(segments[0]!)
  const slug = toSlug(raw)
  if (slug === HOME_SLUG || !slug) {
    return { redirect: '/', slug: HOME_SLUG }
  }
  return slug === raw ? { slug } : { redirect: `/${slug}`, slug }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolved = await resolveSlug(params)
  const result = resolved && !resolved.redirect ? await getPublishedPage(resolved.slug) : null
  return result?.status === 'found' ? buildMetadata({ collection: 'pages', config: seoConfig, doc: result.page }) : {}
}

export default async function Page({ params }: Props) {
  const resolved = await resolveSlug(params)
  if (!resolved) {
    notFound()
  }
  if (resolved.redirect) {
    permanentRedirect(resolved.redirect)
  }

  const result = await getPublishedPage(resolved.slug)
  if (result.status !== 'found') {
    // Redirects managed in the admin (Redirects collection), e.g. after a page was renamed.
    const target = await findRedirect(resolved.slug)
    if (target) {
      permanentRedirect(target)
    }
    return <PageNotAvailable slug={resolved.slug} status={result.status} />
  }
  return (
    <main>
      <RenderSections sections={result.page.layout} />
    </main>
  )
}
