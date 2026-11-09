import path from 'path'
import type { CollectionConfig } from 'payload'

export const Media: CollectionConfig = {
  slug: 'media',
  access: { read: () => true },
  fields: [
    {
      name: 'alt',
      type: 'text',
      admin: { description: 'Describe the image for screen readers and search engines.' },
      required: true,
    },
  ],
  upload: {
    mimeTypes: ['image/*'],
    // Local development stores files in ./image (gitignored). When BLOB_READ_WRITE_TOKEN is set,
    // the Vercel Blob adapter in payload.config.ts takes over and nothing is written here.
    staticDir: path.resolve(process.cwd(), 'image'),
  },
}
