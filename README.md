# blog.baseballyama.com

Portfolio + blog built with SvelteKit, compiled end-to-end by the Rust
[rsvelte](https://github.com/baseballyama/rsvelte) compiler
(`@sveltejs/vite-plugin-svelte` is redirected to `@rsvelte/vite-plugin-svelte`
via `pnpm.overrides`).

Deployed as a **multi-page app** on **Cloudflare Workers**: HTML is server-rendered
at the edge and cached with the Cache API, and no framework JavaScript is shipped
to the browser.

## Requirements

- Node.js 22+
- pnpm

## Usage

```bash
pnpm install

# Development
pnpm dev

# Build (Worker + static assets into .svelte-kit/cloudflare/)
pnpm build

# Preview the production build
pnpm preview          # Node (fast)
pnpm preview:workers  # real workerd runtime via `wrangler dev`

# Type-check (@rsvelte/svelte-check + tsgo)
pnpm check

# Lint / format
pnpm lint
pnpm format
```

`pnpm dev` does not generate the OGP images or the mermaid bundle. Run
`pnpm build:assets` once if you need them locally.

## Writing Posts

Create markdown files in `posts/` with frontmatter:

```markdown
---
title: Post Title
date: 2026-01-20
---

Content here...
```

## Architecture

### No client-side framework

`csr = false` is set on the root layout, so SvelteKit ships **zero JavaScript**.
Svelte is a server-side template language here; every navigation is a document
request. Cross-document View Transitions and Speculation Rules
(`prerender`, `eagerness: moderate`) keep navigation feeling instant without a
client router.

The two places that genuinely need the browser are handled by standalone
scripts that do not depend on Svelte:

| Feature            | How                                                                                                                                                                                 |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Theme (light/dark) | `src/lib/head-inline/theme.ts`, minified and inlined into `<head>`. Sets `data-theme` before first paint and toggles via a delegated click listener; icons swap in CSS.             |
| mermaid diagrams   | `src/lib/mermaid-client.ts`, bundled separately by `scripts/build-mermaid.mjs` into `static/generated/`. Loaded with `<script type="module">` only on posts that contain a diagram. |

> **`app.html` is never minified.** Neither SvelteKit nor Vite processes it, so
> whatever you write there ships verbatim on every page — comments, indentation
> and all. That is why the inline `<head>` script lives in `src/lib/head-inline/`
> and is built by `scripts/build-head-inline.mjs` into a minified blob that
> `hooks.server.ts` substitutes for `%head.inline%`. Writing it directly in
> `app.html` cost ~1.5 kB per page, a third of the gzipped weight of `/blog`.

The "read this in 日本語" banner used to need JavaScript (`navigator.language` +
`localStorage`). On Workers the server reads `Accept-Language` directly, and
dismissing it is a plain `POST` form backed by a cookie — so it now works with
JavaScript disabled.

### Edge caching

Pages are server-rendered per request, but a given page is rendered **at most
once per deploy, per data center**. `src/hooks.server.ts` wraps every response
in a Cache API layer whose key is:

```text
https://edge.cache/<build version>/<locale variant>/<pathname><search>
```

Content is fully determined by those three things, so:

- a deploy changes `version`, which swaps the whole key space — no purge needed,
  and stale content is impossible;
- entries stored at the edge get a one-year TTL;
- browsers get `Cache-Control: no-cache` plus a strong `ETag` derived from the
  same tuple, so repeat visits are cheap `304`s and never stale.

`Cache-Control: no-cache` is also deliberate: `adapter-cloudflare`'s Worker has
its own built-in Cache API layer keyed on the bare URL, which would not
distinguish locale variants or build versions. `no-cache` makes it skip the
response so only the versioned key above applies.

Responses carry `x-edge-cache: HIT | MISS | BYPASS` for inspection.

> **Zone setting that matters.** Cloudflare strips `ETag` from `text/html`
> responses whenever an HTML-rewriting feature is enabled on the zone —
> **Email Address Obfuscation** is on by default and is enough to trigger it.
> The symptom is that `/rss.xml` keeps its `ETag` while HTML pages lose theirs,
> which costs the `304` revalidation described above (the edge cache itself is
> unaffected). Turn off Email Address Obfuscation, and **Rocket Loader** too —
> the latter would inject JavaScript into pages built to have none, and defer
> the inline theme script that exists precisely to run before first paint.

### What is prerendered

Nothing, in SvelteKit terms. Prerendered files are served straight from
Cloudflare's asset layer and never reach the Worker, so anything prerendered
would silently bypass the logic above.

OGP images are the exception and are generated **outside** SvelteKit, by
`scripts/build-ogp.mjs` into `static/ogp/`, because `@resvg/resvg-js` is a
native Node addon that cannot run on Workers. URLs are unchanged
(`/ogp/<locale>/<slug>.png`).

## Structure

```text
src/routes/       # SvelteKit routes (portfolio top, /blog, /posts/[slug], /rss.xml)
src/lib/          # Components and data (profile, projects, socials)
src/hooks.server.ts  # Edge cache + language negotiation
posts/            # Markdown posts
static/           # Static assets; ogp/ and generated/ are build output (gitignored)
scripts/          # Pre-build steps (stars, OGP images, mermaid bundle)
wrangler.jsonc    # Worker + static assets config
_headers          # Asset response headers (project root, NOT static/)
```

## Deploy

Pushes to `main` trigger `.github/workflows/build.yml`, which lints, builds,
type-checks, and then deploys to Cloudflare Workers with
`cloudflare/wrangler-action`.

Required repository secrets:

- `CLOUDFLARE_API_TOKEN` — "Edit Cloudflare Workers" template
- `CLOUDFLARE_ACCOUNT_ID`

### Custom domain

`wrangler.jsonc` declares `blog.baseballyama.com` as a Custom Domain, so
Cloudflare creates the DNS record and certificate itself. This requires
`baseballyama.com` to be an active zone on Cloudflare, and **any pre-existing
`blog` DNS record must be deleted first** — a Custom Domain cannot be attached
to a hostname that already has a CNAME.
