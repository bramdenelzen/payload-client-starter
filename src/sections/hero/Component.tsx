import type { HeroSection } from '@/payload-types'

import { Media } from '@/components/Media'

import styles from './Component.module.css'

export function Hero({ buttonHref, buttonLabel, heading, image, intro }: HeroSection) {
  return (
    <div className={styles.hero}>
      <div className={styles.content}>
        <h1>{heading}</h1>
        {intro && <p className={styles.intro}>{intro}</p>}
        {buttonLabel && (
          <a className="button" href={buttonHref || '#'}>
            {buttonLabel}
          </a>
        )}
      </div>
      {image && <Media className={styles.image} media={image} priority sizes="(min-width: 960px) 50vw, 100vw" />}
    </div>
  )
}
