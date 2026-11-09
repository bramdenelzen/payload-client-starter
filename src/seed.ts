import type { Payload } from 'payload'

import { HOME_SLUG } from './pageTypes'

/**
 * Every site has a home page. Create it on startup if it doesn't exist yet, so a fresh
 * database (local SQLite or a new Neon branch) always renders "/".
 */
export async function ensureHomePage(payload: Payload) {
  try {
    const { totalDocs } = await payload.count({
      collection: 'pages',
      where: { slug: { equals: HOME_SLUG } },
    })
    if (totalDocs) {
      return
    }

    await payload.create({
      collection: 'pages',
      data: {
        _status: 'published',
        layout: [
          {
            blockType: 'hero',
            heading: 'Welcome',
            intro: 'This is your home page. Log in to the admin, open it and switch on Live Preview to edit it.',
            buttonHref: '/admin',
            buttonLabel: 'Open the admin',
          },
        ],
        pageType: 'home',
        slug: HOME_SLUG,
        title: 'Home',
      },
    })
    payload.logger.info('Created the home page')
  } catch (error) {
    // Two server instances starting at once can both try (the unique slug stops the second),
    // and CLI commands like `migrate:create` start Payload before the tables exist.
    payload.logger.warn({ err: error, msg: 'Could not check or create the home page' })
  }
}
