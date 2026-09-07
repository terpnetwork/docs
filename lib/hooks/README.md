# lib/hooks — React Query Hooks

Domain-specific hooks that components consume. One file per domain.

## Convention

Each file exports `'use client'` hooks that call `useQuery()` (or `useMutation()`) and use fetchers from `lib/queries/fetchers.ts`.

```
lib/hooks/
  use-calendar.ts   — working groups, events, booking slots
  use-governance.ts  — (future) proposals, votes
  use-validators.ts  — (future) validator set, status
  use-tokens.ts      — (future) balances, supply
```

## Adding a new hook file

1. Create `lib/hooks/use-<domain>.ts`.
2. Define types for the domain at the top of the file.
3. Export hooks that call `useQuery()`:

```ts
'use client';

import { useQuery } from '@tanstack/react-query';
import { queryWithFallback } from '@/lib/queries/fetchers';

export interface Proposal { id: string; title: string; status: string }

export function useProposals() {
  return useQuery({
    queryKey: ['proposals'],
    queryFn: () => queryWithFallback<Proposal[]>('/cosmos/gov/v1/proposals'),
  });
}
```

## Tips

- `queryKey` arrays should reflect parameters so React Query dedupes and re-fetches correctly:
  ```ts
  queryKey: ['proposals', status]  // re-fetches when status changes
  ```
- Use `enabled` to gate queries that depend on user input:
  ```ts
  useQuery({ queryKey: ['slots', date], queryFn: ..., enabled: !!date });
  ```
- Demo data is fine for Phase 1. Leave a `// Phase 2:` comment with the real fetcher call for when a backend is ready.
