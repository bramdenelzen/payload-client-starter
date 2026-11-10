import type { CtaSection } from '@/payload-types'

import styles from './Component.module.css'

export function Cta({ buttonHref, buttonLabel, heading, text }: CtaSection) {
  return (
    <div className={styles.cta}>
      <h2>{heading}</h2>
      {text && <p>{text}</p>}
      <a className="button" href={buttonHref}>
        {buttonLabel}
      </a>
    </div>
  )
}
