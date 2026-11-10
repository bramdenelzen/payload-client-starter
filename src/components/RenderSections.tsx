import type { ComponentType } from 'react'

import { sectionAttributes } from 'payload-section-builder/react'

import type { Page } from '@/payload-types'

import { sectionComponents } from '@/sections/components'

type Section = NonNullable<Page['layout']>[number]

/**
 * Renders a page's sections. Used by the public pages and the live preview, so the preview
 * looks exactly like the site. `sectionAttributes` marks each section for the editor overlay
 * and adds no styles.
 */
export function RenderSections({ sections }: { sections: Page['layout'] }) {
  return (
    <>
      {(sections ?? []).map((section, index) => {
        const Component = sectionComponents[section.blockType] as ComponentType<Section> | undefined
        if (!Component) {
          return null
        }
        return (
          <section key={section.id ?? index} {...sectionAttributes(index, section.blockType)}>
            <Component {...section} />
          </section>
        )
      })}
    </>
  )
}
