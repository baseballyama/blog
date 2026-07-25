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

> **One script does reach the browser**, and it is deliberate: Cloudflare Web
> Analytics injects `static.cloudflareinsights.com/beacon.min.js` (~11 kB) at the
> edge. It is not part of the build and not affected by `csr = false`, so
> "SvelteKit ships zero JavaScript" and "the page loads no JavaScript" are not
> the same claim here. It is kept for traffic stats; turning it off is a zone
> setting, not a code change.

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
- browsers get `Cache-Control: private, max-age=60`, so a repeat view is served
  from the browser's own cache with no network round trip at all. `private` also
  keeps the locale-specific HTML out of shared caches.

The `private` is load-bearing beyond privacy: `adapter-cloudflare`'s Worker has
its own built-in Cache API layer keyed on the bare URL, which would not
distinguish locale variants or build versions. `private` trips that layer's
`/(private|no-cache|no-store)/i` check, so it skips the response and only the
versioned key above applies.

Responses carry `x-edge-cache: HIT | MISS | BYPASS` for inspection.

> **Cloudflare strips `ETag` from `text/html`.** Measured: `/rss.xml` and images
> keep their `ETag`, HTML pages do not, regardless of compression. Some
> HTML-specific zone feature is responsible — **Early Hints** correlates exactly
> (HTML is the only content type that gets a `103`), though Cloudflare does not
> document the interaction. Conditional requests on HTML are therefore
> unavailable, which is why the browser policy above is a short `max-age`
> rather than `no-cache` + `ETag`: without a working `ETag`, `no-cache` would
> re-download the whole body on every repeat view. The `ETag` is still emitted
> because it works for non-HTML responses and would come back if the zone
> feature were turned off.
>
> **Keep Rocket Loader off** (Speed → Settings → Content Optimization). It
> injects JavaScript into pages built to have none, and defers the inline theme
> script that exists precisely to run before first paint.

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

Pushes to `main` trigger `.github/workflows/build.yml`. The `build` job lints,
builds and type-checks; a separate `deploy` job then ships the build output to
Cloudflare Workers with `cloudflare/wrangler-action`.

Deployment is a separate job so it can declare `environment:`, which is what
makes runs show up under the repository's Deployments / Environments. Note that
`wrangler-action` has its own GitHub Deployment support, but it is only reachable
from a Cloudflare **Pages** deploy and never fires for Workers.

Required repository secrets:

- `CLOUDFLARE_API_TOKEN` — "Edit Cloudflare Workers" template
- `CLOUDFLARE_ACCOUNT_ID`

### Custom domain

`wrangler.jsonc` declares `blog.baseballyama.com` as a Custom Domain, so
Cloudflare creates the DNS record and certificate itself. This requires
`baseballyama.com` to be an active zone on Cloudflare, and **any pre-existing
`blog` DNS record must be deleted first** — a Custom Domain cannot be attached
to a hostname that already has a CNAME.
