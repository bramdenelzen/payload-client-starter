import type { Block } from 'payload'

import type { PageType } from '@/pageTypes'

/** The Payload side of a section. The React side lives in `Component.tsx` next to it. */
export type SectionConfig = {
  block: Block
  /** Page types that may use this section. Omit to allow it everywhere. */
  allowedOn?: PageType[]
}
