/**
 * Origin of the current request, e.g. `https://www.client.com`.
 *
 * The admin and the site run in the same Next.js app, so the live preview and the editor
 * overlay can use the origin the editor is on. That works on every URL without configuration:
 * localhost, Vercel preview deployments, branch URLs, custom domains and Docker hosts.
 */
export function requestOrigin(headers: Headers): string {
  const host = first(headers.get('x-forwarded-host')) || headers.get('host')
  if (!host) {
    return 'http://localhost:3000'
  }
  const proto = first(headers.get('x-forwarded-proto')) || (/^(localhost|127\.0\.0\.1)(:|$)/.test(host) ? 'http' : 'https')
  return `${proto}://${host}`
}

const first = (value: null | string) => value?.split(',')[0]?.trim()
