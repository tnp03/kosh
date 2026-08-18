# Kosh - AI Knowledge Base

A comprehensive knowledge base for artificial intelligence concepts, models, tools, and research.

## Tech Stack

- **Framework**: [TanStack Start](https://tanstack.com/start) (Vite)
- **Styling**: [shadcn/ui](https://ui.shadcn.com) + Tailwind CSS v4
- **Content**: MDX via [content-collections](https://content-collections.dev)
- **Search**: [MiniSearch](https://lucaong.github.io/minisearch/) (client-side)
- **Deployment**: Cloudflare Workers

## Features

- Browse articles by category (Models, Tools, Concepts, Research)
- Full-text search with fuzzy matching
- Tag-based navigation
- Related articles
- Dark mode support
- Responsive design

## Getting Started

```bash
# Install dependencies
pnpm install

# Start development server
pnpm run dev

# Build for production
pnpm run build

# Preview production build
pnpm run preview
```

## Project Structure

```
kosh/
├── content/
│   └── articles/           # MDX articles organized by category
│       ├── models/
│       ├── tools/
│       ├── concepts/
│       └── research/
├── src/
│   ├── components/
│   │   └── ui/             # shadcn UI components
│   ├── routes/             # File-based routing
│   ├── lib/                # Utilities
│   └── styles/             # Global styles
├── content-collections.ts  # Content collection config
└── vite.config.ts
```

## Adding Articles

Create a new `.mdx` file in the appropriate category folder:

```yaml
---
title: "Article Title"
description: "Brief description of the article"
category: "models"  # models | tools | concepts | research
tags: ["tag1", "tag2"]
related: ["other-article-slug"]
date: "2024-01-15"
---

# Article Content

Your markdown content here...
```

## License

MIT
