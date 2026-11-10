import { withPayload } from '@payloadcms/next/withPayload'

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Docker images use Next's standalone server (see Dockerfile). Vercel doesn't need it.
  output: process.env.NEXT_OUTPUT === 'standalone' ? 'standalone' : undefined,
}

export default withPayload(nextConfig, { devBundleServerPackages: false })
