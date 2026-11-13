import config from '@payload-config'
import { unstable_cache } from 'next/cache'
import { getPayload } from 'payload'
import { cacheTags } from 'payload-section-builder'

import type { Page, Redirect } from '@/payload-types'

import { HOME_SLUG } from '@/pageTypes'

import { toSlug } from './slug'

/**
 * Cached reads for the public site.
 *
 * Each read is tagged with the content it depends on. payload-section-builder revalidates
 * those tags when an editor publishes, unpublishes, deletes or renames something (see the
 * `cache` option in payload.config.ts), so a cached page is never older than the last publish
 * and the database is only queried after a change.
 *
 * Add the tags of every collection or global a page shows: pages are fetched with `depth: 1`,
 * so images (media) are part of the page.
 */

export type PageLookup = { page: Page; status: 'found' } | { status: 'missing' } | { status: 'unpublished' }

const pageTags = (slug: string) => [cacheTags.slug('pages', slug), cacheTags.collection('media')]

/**
 * Published pages only. Draft-only pages (saved with "Save Draft" but never published)
 * show up in the live preview but not on the public site.
 */
export const getPublishedPage = (slug: string): Promise<PageLookup> =>
  unstable_cache(
    async (): Promise<PageLookup> => {
      const payload = await getPayload({ config })
      const { docs } = await payload.find({
        collection: 'pages',
        depth: 1,
        draft: false,
        limit: 1,
        overrideAccess: false,
        where: { and: [{ slug: { equals: slug } }, { _status: { equals: 'published' } }] },
      })
      if (docs[0]) {
        return { page: docs[0], status: 'found' }
      }
      // Only development explains "not published yet"; production shows a 404 either way.
      if (process.env.NODE_ENV === 'production') {
        return { status: 'missing' }
      }
      const { totalDocs } = await payload.count({ collection: 'pages', where: { slug: { equals: slug } } })
      return { status: totalDocs ? 'unpublished' : 'missing' }
    },
    ['page', slug],
    { tags: pageTags(slug) },
  )()

/** "/Old Page/", "https://site.nl/old-page?x=1" -> "old-page" */
const slugFromPath = (from: string) => {
  const path = from.replace(/^[a-z]+:\/\/[^/]+/i, '').replace(/[?#].*$/, '')
  try {
    return toSlug(decodeURIComponent(path))
  } catch {
    return toSlug(path)
  }
}

const targetOf = (redirect: Redirect): null | string => {
  if (redirect.to?.type === 'custom') {
    return redirect.to.url || null
  }
  const page = redirect.to?.reference?.value
  if (page && typeof page === 'object' && page.slug) {
    return page.slug === HOME_SLUG ? '/' : `/${page.slug}`
  }
  return null
}

/** All redirects as { slug: target }. Sites have a handful, so one cached map is enough. */
const getRedirects = unstable_cache(
  async (): Promise<Record<string, string>> => {
    const payload = await getPayload({ config })
    const { docs } = await payload.find({ collection: 'redirects', depth: 1, limit: 1000, pagination: false })
    const map: Record<string, string> = {}
    for (const redirect of docs) {
      const from = slugFromPath(redirect.from)
      const target = targetOf(redirect)
      if (from && target) {
        map[from] = target
      }
    }
    return map
  },
  ['redirects'],
  // A redirect to a page follows that page when its slug changes.
  { tags: [cacheTags.collection('redirects'), cacheTags.collection('pages')] },
)

/** Where a URL that has no page should go, if a redirect for it exists. */
export async function findRedirect(slug: string): Promise<null | string> {
  const target = (await getRedirects())[slug]
  return target && target !== `/${slug}` ? target : null
}
