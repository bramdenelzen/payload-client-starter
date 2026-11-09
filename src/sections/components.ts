/**
 * Section registry, React side: block slug -> component.
 * Keep the keys in sync with `./index.ts`; TypeScript complains if a section is missing.
 */
import type { ComponentType } from 'react'

import type { Page } from '@/payload-types'

import { Cta } from './cta/Component'
import { Hero } from './hero/Component'
import { Text } from './text/Component'

type Section = NonNullable<Page['layout']>[number]

export const sectionComponents: {
  [K in Section['blockType']]: ComponentType<Extract<Section, { blockType: K }>>
} = {
  cta: Cta,
  hero: Hero,
  text: Text,
}
