import { defineSeoConfig } from 'payload-seo-autopilot'

/**
 * SEO for the whole site, shared by payload.config.ts and the Next.js routes (metadata,
 * sitemap, robots). Set the client's name here.
 *
 * AI suggestions behind the "Auto-generate" and "Generate alt text" buttons are on when
 * ANTHROPIC_API_KEY is set, and off (rule-based text, no button) without it.
 */
export const seoConfig = defineSeoConfig({
  ai: { provider: 'anthropic' },
  collections: {
    pages: { contentFields: ['layout'], homeSlug: 'home' },
  },
  siteName: 'Client site',
})
