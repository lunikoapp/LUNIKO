# LUNIKO Architecture & Roadmap

This document describes the architecture that exists today and the staged direction for turning Luniko from a static introduction and guided demo into a trusted creative learning companion.

## 1. Product north star

Luniko should feel like a calm place to follow a good question. A learner can begin with a small spark, try a different lens, and leave a trace of the thinking. A nearby adult can encourage the process without turning it into a test.

The architecture must therefore optimize for:

- **Open-ended exploration**, rather than answer extraction
- **Adult-supported experiences**, rather than unsupervised social mechanics
- **Small, meaningful traces**, rather than exhaustive activity histories
- **Privacy and safety by default**, especially for young learners
- **Fast, accessible, low-friction interactions**

## 2. Current architecture

### Runtime model

Today Luniko is a static single-page application:

```text
Browser
  │
  ├── GitHub Pages / luniko.org
  │       └── Static Vite bundle
  │
  └── React application
          ├── Wouter client-side routes
          ├── Local component state
          ├── CSS visual system
          └── Static public assets
```

### Current stack

| Layer | Current choice | Responsibility |
| --- | --- | --- |
| UI | React + TypeScript | Page composition and interaction |
| Build | Vite | Development server and production bundle |
| Routing | Wouter | Client-side navigation for public routes |
| Styling | CSS in `src/index.css` | Responsive layout, motion, and visual tokens |
| Icons | `lucide-react` | UI iconography |
| Content | Source-controlled TypeScript and HTML | Product copy and demo prompts |
| Hosting | GitHub Pages | Static production hosting |
| Delivery | GitHub Actions | Install, build, verify, and deploy |
| Persistence | None yet | Demo and interest form are local-only |

### Public routes

| Route | Purpose | Indexing |
| --- | --- | --- |
| `/` | Product introduction | Index |
| `/demo` | Guided spark experience | Index |
| `/about` | Studio and product context | Index |
| `/how-to` | Explain the interaction model | Index |
| `/roadmap` | Share product direction | Index |
| `/login` | Interest / early-access signal | Noindex |

The Vite build produces one SPA shell. The deployment workflow places that shell in route directories so direct links work on GitHub Pages. Route-aware metadata is updated in the browser by `Seo` in `src/App.tsx`; the static shell also contains strong default metadata for crawlers and social previews.

## 3. Target architecture

The target system should keep the public marketing surface fast and static while adding a small, explicit application backend for authenticated spaces and saved traces.

```text
                         ┌─────────────────────────┐
                         │  Static public website  │
                         │  React/Vite + Pages     │
                         └────────────┬────────────┘
                                      │
                         relative API │ requests
                                      ▼
┌──────────────┐    ┌─────────────────────────┐    ┌──────────────────┐
│ Managed auth │───▶│ Application API         │───▶│ PostgreSQL        │
│ provider     │    │ Express + Zod contracts │    │ accounts/spaces   │
└──────────────┘    └────────────┬────────────┘    │ traces/consent    │
                                 │                 └──────────────────┘
                                 ▼
                        ┌──────────────────┐
                        │ Object storage   │
                        │ optional media   │
                        └──────────────────┘
```

### Proposed boundaries

#### Public web client

- Continue serving the public pages as a cacheable static bundle.
- Keep marketing content and the guided demo usable without authentication.
- Load authenticated app surfaces only when the user intentionally enters a space.
- Use route-level metadata and accessible semantic HTML for public pages.

#### Application API

- Add backend routes only when a real user workflow requires persistence.
- Define each endpoint in OpenAPI first.
- Generate typed React Query hooks and Zod schemas from the contract.
- Derive user identity, ownership, timestamps, and consent state on the server.
- Return only the minimum fields needed by the requesting surface.

#### Identity and access

- Use a managed authentication provider rather than local password storage.
- Model roles explicitly: learner, parent/guardian, educator, and product administrator.
- Keep learner spaces private by default.
- Require an adult-controlled relationship before enabling adult views of learner traces.
- Treat invitation, consent, and account deletion as first-class workflows.

#### Data and storage

The first persistent domain model should be intentionally small:

```text
User
  └── Membership
        └── Space
              ├── Spark
              ├── Trace
              └── ConsentRecord
```

- `Spark` is a reusable prompt with a versioned content record.
- `Trace` is a learner-created response such as a note, sketch reference, or new question.
- `Space` is the adult-supported boundary in which traces are kept.
- `ConsentRecord` records the purpose, actor, timestamp, and revocation state of consent.
- Binary media belongs in object storage; PostgreSQL stores metadata and object paths, not file bytes.

#### Content and recommendation model

- Start with a reviewed, versioned library of sparks.
- Store content provenance and review status.
- Prefer transparent lenses and age-appropriate tags over opaque personalization.
- Introduce recommendations only after the team can explain why a spark was shown.
- Do not use learner content to train external models without explicit, separate authorization.

## 4. Roadmap

### Phase 0 — Foundation (complete)

**Goal:** Establish a clear, trustworthy public introduction.

- Responsive Luniko website
- Guided spark demo
- Public product pages
- GitHub Pages deployment
- Custom domain and CNAME
- SEO metadata, sitemap, robots rules, JSON-LD, and social previews
- Branded favicon system

**Exit criteria:** The public site builds from a frozen lockfile, deploys from `main`, and all public routes load directly.

### Phase 1 — Daily Sparks

**Goal:** Move sparks from hard-coded demo content into a reviewed content system.

- Define a versioned `Spark` content schema
- Add a small server-backed read API
- Keep the public demo functional when the API is unavailable
- Add editorial status: draft, reviewed, published, archived
- Add age-range and context tags without profiling individual learners
- Add content review notes and ownership

**Architecture change:** Introduce the shared OpenAPI contract and a read-only content endpoint. Keep writes restricted to an internal editorial workflow.

**Exit criteria:** A reviewed spark can be published without a frontend code change, and every published spark has an owner and review state.

### Phase 2 — Shared Tables

**Goal:** Let an adult and learner share a private, gentle workspace.

- Add managed authentication
- Create spaces and explicit memberships
- Add adult-controlled invitations
- Save traces with edit and delete controls
- Add consent, export, and account deletion flows
- Add a clear offline / error state for interrupted saves

**Architecture change:** Add the identity, membership, space, trace, and consent tables. Add server-side ownership checks to every read and write.

**Exit criteria:** A user can create a space, invite an adult-supported participant, save a trace, reload it, and delete it without exposing another space’s data.

### Phase 3 — Many Lenses

**Goal:** Help users explore a question from more than one angle without turning discovery into a score.

- Add transparent lens definitions
- Suggest lenses based on the selected spark and the user’s explicit choice
- Add accessible explanation for every suggestion
- Add feedback such as “not useful” without building a hidden profile
- Add editorial analytics based on aggregate, non-identifying events

**Architecture change:** Introduce a deterministic lens service before any machine-learned recommendation. Store the reason for a suggestion in the response.

**Exit criteria:** Every suggestion is explainable, reversible, and safe to ignore.

### Phase 4 — Your Own Space

**Goal:** Give learners and adults a personal constellation of questions and traces.

- Add searchable trace history
- Add optional media attachments
- Add collections and lightweight resurfacing
- Add export in a portable format
- Add retention and deletion policies
- Add safe sharing controls that are off by default

**Architecture change:** Add object storage for media and a background job boundary for thumbnails, virus scanning, and retention work. Keep the core trace API usable without media.

**Exit criteria:** A user can understand, export, and delete what Luniko stores about their space.

### Phase 5 — Trust, resilience, and scale

**Goal:** Make the experience dependable as usage grows.

- Add structured server logs and privacy-safe monitoring
- Add rate limits and abuse prevention
- Add backups and restore drills
- Add dependency and security scanning
- Add accessibility regression checks
- Add performance budgets for mobile
- Add an incident and support process

**Exit criteria:** The team can detect, explain, and recover from a failed deployment or data workflow without guessing.

## 5. Security and privacy guardrails

These are architectural requirements, not optional polish:

- Collect the minimum data required for the current workflow.
- Never store raw passwords in Luniko.
- Enforce authorization on the server, not only through hidden UI controls.
- Keep learner spaces private by default.
- Separate product analytics from learner content.
- Do not use advertising identifiers or sell personal data.
- Make consent understandable, revocable, and auditable.
- Make export and deletion possible before adding more data collection.
- Keep secrets in the deployment environment; never commit tokens or connection strings.
- Review any AI feature for age appropriateness, data retention, prompt injection, and human oversight before launch.

## 6. Decision log

### Static-first public surface

**Decision:** Keep the public introduction and guided demo as a static Vite bundle.

**Why:** It keeps the first experience fast, cacheable, inexpensive to host, and usable without an account.

**How to apply:** Do not introduce a backend dependency for public pages unless the page has a real persistence or authorization requirement.

### Contract-first backend

**Decision:** Define future application endpoints in OpenAPI before implementing client calls.

**Why:** Typed contracts reduce drift between the user experience and the service that stores trusted data.

**How to apply:** Update the spec, run code generation, then implement server and client changes from the generated types.

### Adult-supported privacy boundary

**Decision:** Model spaces and adult-supported relationships explicitly before saving learner traces.

**Why:** Ownership and consent must be clear before the product stores personal creative work.

**How to apply:** Every trace read and write must resolve through a server-checked membership and consent boundary.