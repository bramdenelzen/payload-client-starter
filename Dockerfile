# Production image for hosts like Render, Fly.io or a VPS. Vercel doesn't use this file.
# Needs Postgres at runtime (DATABASE_URL=postgres://...): pending migrations run on startup.
# SQLite is for local development only.

FROM node:22-bookworm-slim AS base
ENV PNPM_HOME=/pnpm PATH=/pnpm:$PATH NEXT_TELEMETRY_DISABLED=1
RUN corepack enable

FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

FROM base AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Payload needs a secret to load its config during the build; the real one is set at runtime.
RUN PAYLOAD_SECRET=build-only NEXT_OUTPUT=standalone pnpm build

FROM node:22-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 PORT=3000 HOSTNAME=0.0.0.0
RUN groupadd --system --gid 1001 nodejs && useradd --system --uid 1001 --gid nodejs nextjs
COPY --from=build --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=build --chown=nextjs:nodejs /app/.next/static ./.next/static
# Uploads go here when BLOB_READ_WRITE_TOKEN is not set. Mount a persistent disk on /app/image,
# or set the token to use Vercel Blob (recommended: container disks are usually wiped on deploy).
RUN mkdir -p image && chown nextjs:nodejs image
USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]
