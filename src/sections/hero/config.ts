import type { SectionConfig } from '../types'

export const hero: SectionConfig = {
  // Example rule: the hero is only available on the home page.
  allowedOn: ['home'],
  block: {
    slug: 'hero',
    interfaceName: 'HeroSection',
    labels: { plural: 'Heroes', singular: 'Hero' },
    fields: [
      { name: 'heading', type: 'text', required: true },
      { name: 'intro', type: 'textarea' },
      { name: 'image', type: 'upload', relationTo: 'media' },
      {
        type: 'row',
        fields: [
          { name: 'buttonLabel', type: 'text' },
          { name: 'buttonHref', type: 'text', admin: { description: 'For example /contact' } },
        ],
      },
    ],
  },
}
