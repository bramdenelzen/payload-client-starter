# Payload client starter

Template for a client website: **Payload CMS 3 + Next.js 16** in one app, with the
[payload-section-builder](https://github.com/bramdenelzen/payload-section-builder) plugin so
editors can click a section in the live preview, edit it in the sidebar and move it up or down.

One copy of this repo per client. Sections and styling live here; the plugin only handles
the preview and editing.

| | Local development | Production and Vercel previews |
| --- | --- | --- |
| Database | SQLite in `./data` (gitignored) | Neon Postgres (`DATABASE_URL`) |
| Images | `./image` folder (gitignored) | Vercel Blob (`BLOB_READ_WRITE_TOKEN`) |
| Schema changes | Pushed automatically | Migrations in `src/migrations`, run on startup |

## Getting started

Requires Node 22.23+ and pnpm 10 (`corepack enable` picks the right version).

```bash
pnpm install
cp .env.example .env    # then set PAYLOAD_SECRET
pnpm dev
```

Open http://localhost:3000/admin and create the first user. The **Home** page is created
automatically on first start. Open it, click **Live Preview**, then click a section in the
preview to edit it.

## How it's organised

```
src/
  sections/                 one folder per section
    hero/
      config.ts             Payload block + which page types may use it
      Component.tsx         how it looks
      Component.module.css  its styles
    index.ts                registry for Payload (configs only)
    components.ts           registry for React (slug -> component)
  collections/
    Pages.ts                pages: title, slug, page type, sections
    Media.ts                images
    Users.ts                admin users
  components/
    RenderSections.tsx      renders a page's sections, with the editor markers
  app/(frontend)/
    page.tsx                home page at /
    [slug]/page.tsx         every other page
    preview/[id]/           live preview (drafts, logged-in editors only)
  app/(payload)/            Payload admin and API (generated, don't edit)
  pageTypes.ts              page types: home, default
  payload.config.ts
```

### Pages

- Editors create and remove pages freely. The URL comes from the slug, which is generated from the
  title if left empty ("Contact Us" becomes `/contact-us`).
- The **Home** page (slug `home`) always exists: it's created on startup if missing, can't be
  deleted, and its slug can't be changed. It's served at `/`.
- Only published pages are public. Drafts show in the live preview only. In development a draft
  page shows a "not published yet" notice instead of a 404.

### Adding a section

1. Create `src/sections/<name>/config.ts` (the Payload block) and `Component.tsx` (plus styles).
   Copy `cta/` as a starting point and give the block an `interfaceName`.
2. Add the config to `src/sections/index.ts` and the component to `src/sections/components.ts`.
3. Run `pnpm generate:types`. TypeScript then tells you if the component and block don't match.
4. Before deploying, create a migration (see below).

The plugin draws its own outline and toolbar in the preview; it never styles your sections.
Recolour that chrome with the `--psb-*` variables in `src/app/(frontend)/globals.css`.

### Page types and section rules

A page type is a category that decides which sections a page can use. Every client starts with
`home` and `default` (`src/pageTypes.ts`). To restrict a section, set `allowedOn` in its config:

```ts
export const hero: SectionConfig = {
  allowedOn: ['home'], // only on the home page
  block: { ... },
}
```

Payload hides sections that aren't allowed and rejects them on save. Add a new page type only when
a client needs it, by adding it to `PAGE_TYPES`.

## Database migrations

Locally, SQLite gets schema changes automatically. Postgres in production uses migrations, which run
on startup (`prodMigrations`), on Vercel and in Docker alike.

After changing collections or sections, generate a migration against a Postgres database, for
example a Neon dev branch or the Docker one:

```bash
docker compose up -d db
DATABASE_URL=postgres://payload:payload@localhost:5432/payload pnpm migrate:create add-gallery-section
```

Commit the new files in `src/migrations`. Run migrations against an empty database first
(`pnpm migrate`), so the generator compares with the current schema.

## Deploying

### Vercel

1. Import the repo in Vercel.
2. Add the **Neon** integration (sets `DATABASE_URL`; enable a branch per preview deployment if
   you want previews to have their own data) and a **Blob** store (sets `BLOB_READ_WRITE_TOKEN`).
3. Set `PAYLOAD_SECRET` for all environments.

That's all. Live preview works on every deployment URL because it uses the origin the editor is on.

### Docker (Render, Fly.io, a VPS)

```bash
docker build -t client-site .
docker run -p 3000:3000 \
  -e DATABASE_URL=postgres://... \
  -e PAYLOAD_SECRET=... \
  -e BLOB_READ_WRITE_TOKEN=... \
  client-site
```

Or try it locally with Postgres: `docker compose up --build`.

The image needs Postgres; SQLite is for development only. Without `BLOB_READ_WRITE_TOKEN`, uploads
are written to `/app/image`, so mount a persistent disk there (container disks are usually wiped
on every deploy).

## Environment variables

| Variable | Required | Description |
| --- | --- | --- |
| `PAYLOAD_SECRET` | Yes | Long random string (`openssl rand -hex 32`) |
| `DATABASE_URL` | Production | `postgres://...` for Postgres. Empty or `file:...` for SQLite |
| `BLOB_READ_WRITE_TOKEN` | Production | Vercel Blob token. Empty: images go to `./image` |
| `NEXT_PUBLIC_SERVER_URL` | Docker/Render | Public URL, e.g. `https://www.client.nl`, for canonical URLs and the sitemap. Vercel uses its production domain |
| `ANTHROPIC_API_KEY` | No | Turns on AI suggestions for SEO texts and image alt text. Without it: rule-based text, no alt button |

## SEO

[payload-seo-autopilot](https://github.com/bramdenelzen/payload-seo-autopilot) adds:
- an SEO tab to pages, with Auto-generate for the title and description;
- redirects;
- a "Generate alt text" button on images.

The site name is set in `src/seo.config.ts`. That same config is used for:
- the page metadata, in `generateMetadata` in both page routes;
- `sitemap.xml`;
- `robots.txt`, in `src/app/robots.ts`. It has to live at the root of `app/`, because inside `(frontend)` the `[slug]` route would catch it.

Preview deployments on Vercel get `noindex`. Set `SEO_NOINDEX=true` to block indexing anywhere else.

## The plugin dependencies

`payload-section-builder` (`^0.1.2`) and `payload-seo-autopilot` (`^0.1.3`) come from npm. Keep `seoAutopilot()` listed before `sectionBuilder()` in `payload.config.ts`. Update them with
`pnpm update payload-section-builder payload-seo-autopilot`, then run `pnpm generate:importmap` in case it added admin
components. Avoid `0.0.0`: that release can't be imported.

## Scripts

| Script | Does |
| --- | --- |
| `pnpm dev` | Development server |
| `pnpm build` / `pnpm start` | Production build and server |
| `pnpm generate:types` | Regenerate `src/payload-types.ts` after schema changes |
| `pnpm generate:importmap` | Regenerate the admin import map after adding plugins or admin components |
| `pnpm migrate:create <name>` | New Postgres migration |
| `pnpm migrate` | Run pending migrations |
| `pnpm typecheck` | TypeScript check |
