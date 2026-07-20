# blog.baseballyama.com

Portfolio + blog built with SvelteKit, compiled end-to-end by the Rust
[rsvelte](https://github.com/baseballyama/rsvelte) compiler
(`@sveltejs/vite-plugin-svelte` is redirected to `@rsvelte/vite-plugin-svelte`
via `pnpm.overrides`).

## Requirements

- Node.js 22+
- pnpm

## Usage

```bash
pnpm install

# Development
pnpm dev

# Build (static output to build/)
pnpm build

# Type-check (@rsvelte/svelte-check + tsgo)
pnpm check

# Lint / format
pnpm lint
pnpm format
```

## Writing Posts

Create markdown files in `posts/` with frontmatter:

```markdown
---
title: Post Title
date: 2026-01-20
---

Content here...
```

## Structure

```text
src/routes/    # SvelteKit routes (portfolio top, /blog, /posts/[slug], /ogp)
src/lib/       # Components and data (profile, projects, socials)
posts/         # Markdown posts
static/        # Static assets (CNAME, favicon)
build/         # Build output (gitignored)
```

## Deploy

Pushes to `main` trigger `.github/workflows/build.yml`, which builds the site
and deploys `build/` to GitHub Pages.
