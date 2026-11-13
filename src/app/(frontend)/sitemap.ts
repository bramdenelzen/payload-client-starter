import config from '@payload-config'
import { unstable_cache } from 'next/cache'
import { connection } from 'next/server'
import { getPayload } from 'payload'
import { cacheTags } from 'payload-section-builder'
import { buildSitemap } from 'payload-seo-autopilot/next'

import { seoConfig } from '@/seo.config'

/** Cached until a page is published, unpublished, renamed or deleted. */
const getSitemap = unstable_cache(
  async () => buildSitemap({ config: seoConfig, payload: await getPayload({ config }) }),
  ['sitemap'],
  { tags: Object.keys(seoConfig.collections).map((collection) => cacheTags.collection(collection)) },
)

export default async function sitemap() {
  // Rendered per request (cheap: the data comes from the cache above) instead of at build
  // time, so `next build` never needs the database, which Docker builds don't have.
  await connection()
  return getSitemap()
}
