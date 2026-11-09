/**
 * Page types are categories used for section rules (which sections a page may use).
 * Every client starts with `home` and `default`. Add a type here only when a client
 * needs pages with their own set of sections (for example `landing`).
 */
export const PAGE_TYPES = [
  { label: 'Home', value: 'home' },
  { label: 'Default', value: 'default' },
] as const

export type PageType = (typeof PAGE_TYPES)[number]['value']

export const HOME_SLUG = 'home'
