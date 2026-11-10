import type { SectionConfig } from '../types'

export const text: SectionConfig = {
  block: {
    slug: 'text',
    interfaceName: 'TextSection',
    labels: { plural: 'Text sections', singular: 'Text' },
    fields: [
      { name: 'heading', type: 'text' },
      { name: 'body', type: 'richText', required: true },
    ],
  },
}
