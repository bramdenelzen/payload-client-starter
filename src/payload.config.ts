import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

import { postgresAdapter } from '@payloadcms/db-postgres'
import { sqliteAdapter } from '@payloadcms/db-sqlite'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { vercelBlobStorage } from '@payloadcms/storage-vercel-blob'
import { buildConfig, type Config } from 'payload'
import { sectionBuilder } from 'payload-section-builder'
import sharp from 'sharp'

import { Media } from './collections/Media'
import { Pages } from './collections/Pages'
import { Users } from './collections/Users'
import { migrations } from './migrations'
import { ensureHomePage } from './seed'

const dirname = path.dirname(fileURLToPath(import.meta.url))

const databaseURL = process.env.DATABASE_URL || ''

/**
 * postgres://... -> Postgres (Neon in production and Vercel preview deployments).
 * Anything else  -> SQLite, by default ./data/payload.db (gitignored).
 */
function database(): Config['db'] {
  if (/^postgres(ql)?:\/\//.test(databaseURL)) {
    return postgresAdapter({
      pool: { connectionString: databaseURL },
      // Production runs pending migrations on startup (Vercel and Docker alike).
      // Create them with `pnpm migrate:create` against a Postgres database; see README.
      prodMigrations: migrations,
    })
  }
  const url = databaseURL || 'file:./data/payload.db'
  if (url.startsWith('file:')) {
    fs.mkdirSync(path.dirname(path.resolve(url.slice('file:'.length))), { recursive: true })
  }
  // Local development: the schema is pushed automatically, no migrations needed.
  return sqliteAdapter({ client: { url } })
}

export default buildConfig({
  admin: {
    importMap: { baseDir: path.resolve(dirname) },
    livePreview: {
      breakpoints: [
        { name: 'mobile', height: 812, label: 'Mobile', width: 375 },
        { name: 'tablet', height: 1024, label: 'Tablet', width: 768 },
        { name: 'desktop', height: 900, label: 'Desktop', width: 1440 },
      ],
    },
    user: Users.slug,
  },
  collections: [Pages, Media, Users],
  db: database(),
  editor: lexicalEditor(),
  onInit: async (payload) => {
    await ensureHomePage(payload)
  },
  plugins: [
    sectionBuilder({
      collections: {
        pages: { field: 'layout' },
      },
    }),
    vercelBlobStorage({
      // Without a token (local development, or Docker with a mounted volume) uploads go to ./image.
      enabled: Boolean(process.env.BLOB_READ_WRITE_TOKEN),
      collections: { media: true },
      token: process.env.BLOB_READ_WRITE_TOKEN,
      // Upload from the browser straight to Blob, past Vercel's 4.5 MB request body limit.
      clientUploads: true,
    }),
  ],
  secret: process.env.PAYLOAD_SECRET || '',
  sharp,
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
})
