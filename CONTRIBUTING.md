# Contributing

We are thankful for you helping build the Terp Network docs. This guide covers the project layout, how to add things, and what we expect from contributions.


## Requirements 

Be respectful. With our documentation, comes the relance on a stable, veriiable basis. If we are inaccurate or unorganized, we are not being respectful of our users time. 

## Expectations

- Run `pnpm dev` and check your changes render before opening a PR.
- Every MDX file needs valid frontmatter. At minimum: `title` (string). Empty files or null fields break the build.
- Interactive components must be `'use client'` and wrapped in `not-prose` when used inside MDX.
- Keep PRs focused. One feature or fix per branch.

## Page status and completeness

Frontmatter `status` tells readers (and CI) how ready a page is:

| Value | Meaning |
|-------|---------|
| `complete` | Runnable steps or full reference; links work |
| `partial` | Real prose but gaps, TODOs, or scaffold markers |
| `stub` | Heading outline only — **required** if the body is headings without substantive content |

```yaml
---
title: Example
description: One-line expectation for the reader
status: complete
---
```

**Every non-stub page should include:**

- Accurate `description` (sets expectations; no “10 minutes” if empty)
- `## Related Concepts` and/or `## Further Reading` with **real** links (siblings + cross-section when relevant)
- For on-chain operations: a short verify habit — build/compare/decide (see trustlessness guides)

**Heading-only pages** must set `status: stub`. Prefer linking the front door to complete pages instead of promising depth that does not exist.

```bash
# Detect unlabeled heading-only pages (exit 1 if any)
bash scripts/check-stubs.sh

# Frontmatter-only empties
pnpm check-empty
```

### Scaffold markers (interactive TODOs)

When a diagram/demo is planned but not built, use **exactly** this line form (machine-scanned):

```markdown
> **Scaffold:** `diagram` · id:`stable-kebab-id` · P2 · one-line purpose
```

| Field | Values |
|-------|--------|
| type | `diagram`, `flow`, `visualizer`, `demo`, `chart`, `other` |
| id | unique kebab-case (`scf-…` auto-ids are fine) |
| priority | `P1` front-door, `P2` core, `P3` polish |

| Type | When | Prefer |
|------|------|--------|
| `diagram` | Static structure | Mermaid / `DynamicMermaidDiagram` |
| `flow` | Ordered steps over time | Mermaid sequence/flowchart |
| `visualizer` | User-tweaked inputs → outputs | `components/diagrams/` |
| `demo` | Live chain/API interaction | Client component + query hooks |
| `chart` | Distribution / timeline | Chart component or static SVG |

```bash
# List / fail on unlabeled scaffolds
pnpm check-scaffolds

# Auto-label + regenerate inventory page
pnpm check-scaffolds --label --write
# → content/docs/resources/scaffolds.md
# → scripts/scaffold-inventory.json
```

Do not invent product behavior on stub pages. Fill content only from source of truth (chain params, shipped tools, existing complete guides).

## Project Layout

```
app/
  layout.tsx       — root layout (QueryProvider + RootProvider only — no wallet)
  global.css       — all CSS: Tailwind imports, fumadocs + shadcn vars, brand theme
  docs/            — Next.js route for doc pages

lib/
  queries/         — TanStack Query client, fetchers, provider (see its README)
  hooks/           — React Query hooks, one file per domain (see its README)
  openapi.ts       — OpenAPI spec config and source generation
  source.ts        — fumadocs source loader (MDX + OpenAPI combined)
  utils.ts         — cn() via clsx + twMerge (used by shadcn components)
  cn.ts            — cn() via twMerge only (older code)

components/
  ui/              — shadcn primitives, managed by CLI (don't hand-edit)
  calendar/        — community calendar feature
  ai/              — AI page actions (copy, open-in-Claude, etc.)

content/docs/      — MDX documentation pages
static/api/        — OpenAPI YAML specs
```

Each `lib/` subfolder has its own README with usage examples and conventions. Start there when working on data fetching or hooks.

## Adding Things

### New hook

Create `lib/hooks/use-<domain>.ts`. See `lib/hooks/README.md` for the pattern.

### New interactive component

1. Create a folder under `components/` for your feature.
2. Use shadcn primitives from `components/ui/` for common UI.
3. Export a composite component from `index.tsx`.
4. Register it in `mdx-components.tsx` so MDX pages can use `<YourComponent />`.
5. Wrap the outermost element in `not-prose` to prevent fumadocs prose styles from bleeding in.

**Keep the root layout light.** Do not mount wallet (`@goblinhunt/cosmes`, ~77MB), calendar, or tree demos on `app/layout.tsx`. Patterns:

- Diagrams / trees → import a **per-demo** file, e.g. `@/components/diagrams/dynamic/merkle-proof` (not the barrel `dynamic.tsx`, or one page compiles every visualizer)
- **No nested wallets / dApps in MDX** — do not mount `ConnectCalendar`, `WalletProvider`, Keplr connect buttons, or similar on docs pages. Wallet content is **written guides** under `/docs/guides/authentication/wallets` only. Users open extensions themselves.
- OpenAPI UI → lazy `import()` only on API doc routes
- Never put cosmes / wallet / calendar on `app/layout.tsx`

### New shadcn primitive

```bash
pnpm dlx shadcn@latest add <component-name>
```

Config lives in `components.json` (style: new-york, icons: lucide).

### New docs page

Add a `.mdx` file under `content/docs/<section>/`. Update the section's `meta.json` to include the new slug.

### New API spec

1. Drop the YAML file in `static/api/`.
2. Add entries to `OPENAPI_INPUT` and `OPENAPI_SPECS` in `lib/openapi.ts`.
3. Pages generate at `/docs/api/<slug>` on next build.

## Brand & Styles

### Two color systems

Both live in `app/global.css` and are branded to the same Terp palette:

| System | Prefix | Used by |
|--------|--------|---------|
| Fumadocs | `--color-fd-*` | Docs chrome: sidebar, nav, page layout |
| shadcn | `--background`, `--primary`, etc. | Interactive components: buttons, cards, selects |

If you change a color, update both sets.

### Terp palette

| Role | Light | Dark |
|------|-------|------|
| Primary (purple) | `hsl(265, 50%, 45%)` | `#bd93f9` |
| Accent (lavender) | `hsla(265, 45%, 40%, 0.2)` | `hsla(265, 50%, 55%, 0.25)` |
| Destructive (coral) | `#FA5757` | `#fe7d7d` |
| Green (neon lime) | `#cfffcf` | `#cfffcf` |
| Green (mint) | `#98e8c1` | `#98e8c1` |

### Dark mode

Fumadocs handles the toggle via `.dark` on `<html>`. Both variable systems define dark overrides in `global.css`. Always check both modes.

### Two `cn()` utilities

- `lib/utils.ts` — `clsx` + `twMerge`. Preferred for new code.
- `lib/cn.ts` — re-exports `twMerge` directly. Used by older code.

## Quick Reference

```bash
pnpm dev              # start dev server
pnpm build            # production build (catches frontmatter + type errors)
pnpm dlx shadcn@latest add <name>   # add a shadcn component
```

| Task | Where |
|------|-------|
| Add a query hook | `lib/hooks/use-<domain>.ts` |
| Add query infra | `lib/queries/` |
| Add a shadcn primitive | `pnpm dlx shadcn@latest add <name>` |
| Add an interactive feature | `components/<feature>/index.tsx` + `mdx-components.tsx` |
| Add a docs page | `content/docs/<section>/<slug>.mdx` + `meta.json` |
| Add an API spec | `static/api/<name>.yaml` + `lib/openapi.ts` |
| Change brand colors | both `--color-fd-*` and `--*` in `app/global.css` |
