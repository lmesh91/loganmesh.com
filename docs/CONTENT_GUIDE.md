# Content Guide

This site uses Astro content collections for Markdown-backed terminal pages.

## Local Preview

```sh
npm install
npm run dev
```

Open the local URL printed by Astro. The homepage terminal reads from `src/content/blog` and `src/content/projects`.

## Add A Blog Post

Create a Markdown file in `src/content/blog`, for example `src/content/blog/my-post.md`:

```md
---
title: "My Post"
date: 2026-05-23
description: "Short summary for terminal previews and metadata."
tags: ["tag-one", "tag-two"]
draft: true
---

Write the post here.
```

Set `draft: false` only when the post is ready to appear in production builds.

## Add A Project Page

Create a Markdown file in `src/content/projects`, for example `src/content/projects/my-project.md`:

```md
---
title: "My Project"
status: "active"
description: "Short summary for terminal previews and metadata."
tags: ["software", "math"]
featured: false
draft: true
---

Write the project page here.
```

The filename becomes the slug. `src/content/projects/my-project.md` opens with `open my-project`.

## LaTeX

Inline math uses single dollar signs:

```md
$e^{i\pi}+1=0$
```

Display math uses double dollar signs:

```md
$$
\sum_{k=1}^n k = \frac{n(n+1)}{2}
$$
```

The site uses `remark-math`, `rehype-katex`, and `katex`.

## Terminal Colors

Use double braces to color short spans of Markdown text:

```md
{{red: failed}} {{yellow: warning}} {{green: ok}} {{cyan: link-ish}} {{blue: path}}
```

Available colors:

```text
red, yellow, blue, cyan, green, orange, magenta, violet, white, dim, faint
```

This syntax is intended for short labels, status words, and terminal-style emphasis. It is ignored inside code blocks and inline code.

## Drafts

Use `draft: true` for unfinished content. Draft routes and lists may appear during `npm run dev`; production builds exclude drafts unless you intentionally change that behavior.

## Font

The CSS has an `@font-face` hook for:

```text
public/fonts/DepartureMono-Regular.woff2
```

The site uses that file as `Departure Mono Local`.

## Before Public Launch

Replace all placeholder project/post content. Keep `SITE_PUBLIC_READY=false` until the site is ready to be indexed.

## Future Notes Collection

A notes collection is not implemented. Add one later only if the site needs it.
