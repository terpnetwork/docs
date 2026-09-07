# lib/queries — TanStack Query Infrastructure

Shared data-fetching layer for the docs site. The `QueryProvider` is wired into `app/layout.tsx`, so any `'use client'` component can use hooks backed by this infra.

## Files

| File | Purpose |
|------|---------|
| `client.ts` | QueryClient singleton — fresh per request on server, reused in browser |
| `fetchers.ts` | Low-level fetch helpers: REST-first with optional RPC fallback |
| `provider.tsx` | `'use client'` wrapper that provides the QueryClient to the tree |

## Defaults

- `staleTime`: 60 seconds
- `retry`: 2 with exponential backoff (1s, 2s, capped at 10s)

Override per-query when needed.

## Fetchers

Fetchers talk to `api.terp.network` (REST/LCD) first. If that fails and you provide an RPC fallback, it tries `rpc.terp.network`.

```ts
import { queryWithFallback, queryREST, queryRPC } from '@/lib/queries/fetchers';

// REST only
const props = await queryREST<ProposalList>('/cosmos/gov/v1/proposals');

// REST with RPC fallback
const data = await queryWithFallback<MyType>(
  '/cosmos/gov/v1/proposals',
  () => queryRPC('/abci_query', { path: '...' }),
);
```

Hooks in `lib/hooks/` import from here — this folder stays focused on the client and transport.
