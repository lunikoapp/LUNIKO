# LUNIKO

[![Deploy LUNIKO to GitHub Pages](https://github.com/lunikoapp/LUNIKO/actions/workflows/deploy-pages.yml/badge.svg)](https://github.com/lunikoapp/LUNIKO/actions/workflows/deploy-pages.yml)

**Luniko is a creative learning companion for growing minds.** It gives young learners, parents, and educators more room to follow a question, explore an angle, and leave a trace of their thinking.

Live site: **[luniko.org](https://luniko.org/)**

## What is here today

The current release is a polished, responsive web experience with:

- A public landing page for the Luniko product
- An interactive guided spark demo at `/demo`
- Product and studio context at `/about`
- A plain-language explanation at `/how-to`
- A public product direction at `/roadmap`
- A lightweight “keep in touch” form at `/login`
- Search and sharing foundations: canonical URLs, Open Graph metadata, Twitter cards, JSON-LD, `robots.txt`, and `sitemap.xml`
- Branded SVG and PNG favicon assets

The current site is intentionally static. The form and demo do not yet write to a database or require an account.

## Product principles

Luniko is designed around a few simple beliefs:

1. **Curiosity is worth protecting.** A question does not need to become an answer immediately.
2. **Structure should open doors, not close them.** Prompts and lenses should support exploration without prescribing a single outcome.
3. **Adults stay close without taking over.** Parents and educators should be able to support thinking without replacing it.
4. **A trace is enough.** A sentence, sketch, sound, or new question can be a meaningful result.
5. **Trust is part of the product.** Future features must use data minimization, clear consent, and age-appropriate privacy by design.

## Local development

### Requirements

- Node.js 24
- pnpm 10

### Install

```bash
pnpm install
```

### Start the Luniko web app

```bash
pnpm --filter @workspace/luniko run dev
```

The Vite development server uses the `PORT` and `BASE_PATH` values supplied by the Replit workflow. For a direct local build, use:

```bash
PORT=4173 BASE_PATH=/ pnpm --filter @workspace/luniko run build
```

### Quality checks

```bash
pnpm --filter @workspace/luniko run typecheck
pnpm run typecheck
```

## Repository map

```text
artifacts/luniko/
├── index.html                 # Static SEO shell, social metadata, and JSON-LD
├── public/
│   ├── favicon.svg            # Primary Luniko favicon
│   ├── favicon-16.png        # Small browser favicon
│   ├── favicon-32.png        # Standard browser favicon
│   ├── apple-touch-icon.png   # iOS home-screen icon
│   ├── og-image.png           # Social sharing image
│   ├── robots.txt             # Crawl rules and sitemap location
│   ├── sitemap.xml            # Public route index
│   └── site.webmanifest       # Installable web app metadata
└── src/
    ├── App.tsx                # Routes, page composition, and route-aware SEO
    ├── index.css              # Product visual system and responsive styles
    └── components/            # Reusable UI primitives

.github/workflows/
└── deploy-pages.yml           # Build and deploy pipeline for GitHub Pages

docs/
└── ARCHITECTURE-ROADMAP.md    # Current architecture and staged technical roadmap
```

## Deployment

Every push to `main` runs [`.github/workflows/deploy-pages.yml`](.github/workflows/deploy-pages.yml). The workflow:

1. Installs the workspace from the frozen pnpm lockfile
2. Builds `@workspace/luniko`
3. Copies the SPA shell into route directories for direct GitHub Pages access
4. Verifies the generated bundle
5. Deploys the static output to GitHub Pages

The custom domain is configured through [`artifacts/luniko/public/CNAME`](artifacts/luniko/public/CNAME).

For the planned evolution beyond the static site, see [`docs/ARCHITECTURE-ROADMAP.md`](docs/ARCHITECTURE-ROADMAP.md).

## Contributing

Keep changes focused on the product’s core promise: helping people make room for better questions. Before opening a pull request:

1. Run the Luniko typecheck.
2. Run a production build with `PORT` and `BASE_PATH` set.
3. Check the affected route at desktop and mobile widths.
4. Verify that public metadata, links, and accessibility labels still make sense.
5. Avoid adding tracking, accounts, or learner data collection without documenting the privacy and consent model.

## License

The project is currently maintained as a private product codebase. Licensing terms will be added before external contributions are opened.