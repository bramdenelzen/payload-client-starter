import config from '@payload-config'
import { headers } from 'next/headers'
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'

import { requestOrigin } from '@/lib/origin'

import { PreviewPage } from './PreviewPage'

export const dynamic = 'force-dynamic'

/**
 * Live preview loads pages by document id, not slug: the slug can be empty or
 * changed-but-unsaved while editing.
 */
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const payload = await getPayload({ config })

  // Drafts are private: only show them to someone logged in to the admin. The admin and the
  // site share an origin, so the Payload auth cookie comes along.
  const requestHeaders = await headers()
  const { user } = await payload.auth({ headers: requestHeaders })
  if (!user) {
    notFound()
  }

  const page = await payload
    .findByID({ id, collection: 'pages', depth: 1, disableErrors: true, draft: true })
    .catch(() => null)
  if (!page) {
    notFound()
  }

  // The admin is on the same origin as this page.
  return <PreviewPage initialData={page} serverURL={requestOrigin(requestHeaders)} />
}
