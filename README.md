# Blog

A minimal static blog generator. No JavaScript in the output.

## Requirements

- Node.js 24+

## Setup

```bash
npm install
```

## Usage

```bash
# Build
npm run build

# Development (watch + serve)
npm run dev
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
src/          # Source templates and assets
posts/        # Markdown posts
docs/         # Build output (GitHub Pages)
scripts/      # Build scripts
```
