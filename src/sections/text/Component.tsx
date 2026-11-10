import { RichText } from '@payloadcms/richtext-lexical/react'

import type { TextSection } from '@/payload-types'

import styles from './Component.module.css'

export function Text({ body, heading }: TextSection) {
  return (
    <div className={styles.text}>
      {heading && <h2>{heading}</h2>}
      {body && <RichText className={styles.body} data={body} />}
    </div>
  )
}
