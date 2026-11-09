import Image from 'next/image'

import type { Media as MediaDoc } from '@/payload-types'

type Props = {
  className?: string
  /** An upload field value: the populated doc, or just its id at depth 0. */
  media: MediaDoc | number | string | null | undefined
  priority?: boolean
  sizes?: string
}

/** Renders an image from the media collection (local ./image folder or Vercel Blob). */
export function Media({ className, media, priority, sizes }: Props) {
  if (!media || typeof media !== 'object' || !media.url) {
    return null
  }
  return (
    <Image
      alt={media.alt ?? ''}
      className={className}
      height={media.height ?? 800}
      priority={priority}
      sizes={sizes}
      src={media.url}
      // Skips Next's image optimiser, so no remote image hosts (Vercel Blob) need configuring
      // per client. Switch on with `images.remotePatterns` in next.config.mjs if needed.
      unoptimized
      width={media.width ?? 1200}
    />
  )
}
