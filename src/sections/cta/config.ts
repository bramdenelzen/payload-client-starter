import type { SectionConfig } from '../types'

export const cta: SectionConfig = {
  block: {
    slug: 'cta',
    interfaceName: 'CtaSection',
    labels: { plural: 'Calls to action', singular: 'Call to action' },
    fields: [
      { name: 'heading', type: 'text', required: true },
      { name: 'text', type: 'textarea' },
      {
        type: 'row',
        fields: [
          { name: 'buttonLabel', type: 'text', required: true },
          { name: 'buttonHref', type: 'text', required: true },
        ],
      },
    ],
  },
}
