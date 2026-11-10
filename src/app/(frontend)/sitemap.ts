import config from '@payload-config'
import { getPayload } from 'payload'
import { buildSitemap } from 'payload-seo-autopilot/next'

import { seoConfig } from '@/seo.config'

// Pages change in the CMS, so the sitemap is built per request instead of at build time.
export const dynamic = 'force-dynamic'

export default async function sitemap() {
  return buildSitemap({ config: seoConfig, payload: await getPayload({ config }) })
}
