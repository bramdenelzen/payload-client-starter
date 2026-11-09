/**
 * Section registry, Payload side. Import only configs here (no React or CSS), because the
 * Payload CLI loads this file. The React components are registered in `./components.ts`.
 *
 * To add a section: create `src/sections/<name>/config.ts` and `Component.tsx`, then add it
 * here and in `./components.ts`, and run `pnpm generate:types`.
 */
import type { PageType } from '@/pageTypes'

import { cta } from './cta/config'
import { hero } from './hero/config'
import { text } from './text/config'

export const sections = [hero, text, cta]

export const sectionBlocks = sections.map((section) => section.block)

/** Block slugs a page of this type may use. */
export const allowedSectionSlugs = (pageType: PageType): string[] =>
  sections
    .filter((section) => !section.allowedOn || section.allowedOn.includes(pageType))
    .map((section) => section.block.slug)
