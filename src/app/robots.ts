import { buildRobots } from 'payload-seo-autopilot/next'

import { seoConfig } from '@/seo.config'

// At the root of app/: inside (frontend), the [slug] route would catch /robots.txt.
export default function robots() {
  return buildRobots({ config: seoConfig })
}
