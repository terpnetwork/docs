/**
 * Performance-optimized wrappers around auto-generated dao-calendar hooks.
 *
 * The generated hooks (use-dao-calendar.ts) use default TanStack Query settings:
 * staleTime: 0 (immediate refetch), gcTime: 5 min. This causes excessive chain
 * queries on every component mount. These wrappers add appropriate cache TTLs.
 *
 * Cache strategy:
 * - Events: staleTime 30s — social calendar, acceptable staleness for UX
 * - Groups: staleTime 5min — groups change rarely (only via governance)
 * - Address: staleTime 30min — contract address never changes after deploy
 * - Event count: staleTime 30s — lightweight query, ok to refetch
 * - Hooks: staleTime 1min — moderate churn, but not on critical path
 */

import {
  useEvent,
  useListEvents,
  useReverseEvents,
  useListGroups,
  useGroup,
  useGroupsManagingEvent,
  useEventGauges,
  useEventCount,
  useEventHooks,
  useDumpState,
  useDao,
  useInfo,
  useNextProposalId,
  useAgenda,
} from '@/lib/hooks/generated/use-dao-calendar';
import type { EventFilter } from '@/lib/types/DaoCalendar.types';

// ── Cache durations (milliseconds) ────────────────────────────────────

const STALE = {
  EVENT: 30_000,        // 30s — single event detail
  EVENT_LIST: 30_000,   // 30s — event list (month view, day panel)
  GROUPS: 300_000,      // 5min — group metadata
  GROUP: 300_000,       // 5min — single group detail
  EVENT_COUNT: 30_000,  // 30s — lightweight counter
  HOOKS: 60_000,        // 1min — hook list
  DUMP_STATE: 60_000,   // 1min — heavy query, infrequent
  DAO: 300_000,         // 5min — DAO address
  INFO: 300_000,        // 5min — contract metadata
  NEXT_ID: 60_000,      // 1min — proposal counter
};

// ── Wrapped hooks ─────────────────────────────────────────────────────

export function useCachedEvent(
  contractAddress: string | undefined,
  params: { eventId: number },
) {
  return useEvent(contractAddress, params, {
    staleTime: STALE.EVENT,
  });
}

export function useCachedListEvents(
  contractAddress: string | undefined,
  params: { filter?: EventFilter; limit?: number; startAfter?: number },
) {
  return useListEvents(contractAddress, params, {
    staleTime: STALE.EVENT_LIST,
  });
}

export function useCachedReverseEvents(
  contractAddress: string | undefined,
  params: { filter?: EventFilter; limit?: number; startBefore?: number },
) {
  return useReverseEvents(contractAddress, params, {
    staleTime: STALE.EVENT_LIST,
  });
}

export function useCachedListGroups(
  contractAddress: string | undefined,
) {
  return useListGroups(contractAddress, {
    staleTime: STALE.GROUPS,
  });
}

export function useCachedGroup(
  contractAddress: string | undefined,
  params: { groupId: string },
) {
  return useGroup(contractAddress, params, {
    staleTime: STALE.GROUP,
  });
}

export function useCachedGroupsManagingEvent(
  contractAddress: string | undefined,
  params: { eventId: number },
) {
  return useGroupsManagingEvent(contractAddress, params, {
    staleTime: STALE.EVENT,
  });
}

export function useCachedEventGauges(
  contractAddress: string | undefined,
  params: { eventId: number },
) {
  return useEventGauges(contractAddress, params, {
    staleTime: STALE.EVENT,
  });
}

export function useCachedEventCount(
  contractAddress: string | undefined,
) {
  return useEventCount(contractAddress, {
    staleTime: STALE.EVENT_COUNT,
  });
}

export function useCachedEventHooks(
  contractAddress: string | undefined,
) {
  return useEventHooks(contractAddress, {
    staleTime: STALE.HOOKS,
  });
}

export function useCachedDumpState(
  contractAddress: string | undefined,
) {
  return useDumpState(contractAddress, {
    staleTime: STALE.DUMP_STATE,
  });
}

export function useCachedDao(
  contractAddress: string | undefined,
) {
  return useDao(contractAddress, {
    staleTime: STALE.DAO,
  });
}

export function useCachedInfo(
  contractAddress: string | undefined,
) {
  return useInfo(contractAddress, {
    staleTime: STALE.INFO,
  });
}

export function useCachedNextProposalId(
  contractAddress: string | undefined,
) {
  return useNextProposalId(contractAddress, {
    staleTime: STALE.NEXT_ID,
  });
}

export function useCachedAgenda(
  contractAddress: string | undefined,
  params: { from?: string; limit?: number },
) {
  return useAgenda(contractAddress, params, {
    staleTime: STALE.EVENT_LIST,
  });
}