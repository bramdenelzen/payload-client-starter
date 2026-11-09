import type { CollectionConfig, Where } from 'payload'

import { requestOrigin } from '@/lib/origin'
import { toSlug } from '@/lib/slug'
import { HOME_SLUG, PAGE_TYPES, type PageType } from '@/pageTypes'
import { allowedSectionSlugs, sectionBlocks } from '@/sections'

const isHome = (slug: unknown) => slug === HOME_SLUG

export const Pages: CollectionConfig = {
  slug: 'pages',
  access: {
    // The public only sees published pages; logged-in editors also see drafts.
    read: ({ req: { user } }) => (user ? true : { _status: { equals: 'published' } }),
    // The home page always exists.
    delete: ({ req: { user } }): boolean | Where => (user ? { slug: { not_equals: HOME_SLUG } } : false),
  },
  admin: {
    defaultColumns: ['title', 'slug', 'pageType', '_status', 'updatedAt'],
    // Load the preview by id: the slug can be empty or unsaved while editing. Same origin as
    // the admin, so the auth cookie reaches the preview route on any deployment URL.
    livePreview: { url: ({ data, req }) => `${requestOrigin(req.headers)}/preview/${data?.id ?? ''}` },
    useAsTitle: 'title',
  },
  fields: [
    { name: 'title', type: 'text', required: true },
    {
      name: 'slug',
      type: 'text',
      admin: {
        description: 'The page URL. Leave empty to generate it from the title. The home page is always "home".',
        position: 'sidebar',
      },
      hooks: {
        beforeValidate: [
          ({ data, originalDoc, value }) => {
            // The home page keeps its slug, so "/" never breaks.
            if (isHome(originalDoc?.slug)) {
              return HOME_SLUG
            }
            // Clients type "Contact Us" or "/about/"; store "contact-us" and "about".
            if (typeof value === 'string' && value) {
              return toSlug(value)
            }
            // A partial update that doesn't touch the slug keeps it.
            if (value === undefined && originalDoc?.slug) {
              return originalDoc.slug
            }
            return toSlug(data?.title ?? originalDoc?.title ?? '')
          },
        ],
      },
      index: true,
      // Not marked required: the hook always fills it, and a required flag would block saving
      // an empty slug in the browser before the hook runs.
      unique: true,
    },
    {
      name: 'pageType',
      type: 'select',
      admin: {
        description: 'Decides which sections this page can use.',
        position: 'sidebar',
      },
      defaultValue: 'default',
      // "home" is reserved for the home page.
      filterOptions: ({ data, options }) =>
        isHome(data?.slug) ? options : options.filter((o) => (typeof o === 'string' ? o : o.value) !== 'home'),
      hooks: {
        beforeValidate: [
          // Runs before the slug hook has normalised data.slug, so check the stored slug too.
          ({ data, originalDoc, value }) => (isHome(originalDoc?.slug) || isHome(data?.slug) ? 'home' : value),
        ],
      },
      options: PAGE_TYPES.map((t) => ({ ...t })),
      required: true,
      validate: (value: unknown, { data }: { data: Partial<{ slug: string }> }) =>
        value === 'home' && !isHome(data?.slug) ? 'Only the home page can use the "Home" page type.' : true,
    },
    {
      name: 'layout',
      type: 'blocks',
      blocks: sectionBlocks,
      // Payload hides disallowed sections in the admin and rejects them on save.
      filterOptions: ({ siblingData }) =>
        allowedSectionSlugs(((siblingData as { pageType?: PageType })?.pageType ?? 'default') as PageType),
      label: 'Sections',
      labels: { plural: 'Sections', singular: 'Section' },
    },
  ],
  versions: { drafts: true },
}
