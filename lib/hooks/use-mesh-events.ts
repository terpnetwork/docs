'use client';

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  createMeshQueryClient,
  isMeshQueryError,
  type ResolvedMesh,
} from '@/lib/mesh';
import { normalizeMeshEventList } from '@/lib/mesh/normalize-events';
import type {
  EventFilter,
  EventListResponse,
  EventResponse,
} from '@/lib/hooks/use-calendar';

export type MeshEventsStatus =
  | 'idle'
  | 'loading'
  | 'success'
  | 'empty'
  | 'query_unavailable' // 5xx headstash
  | 'query_error'
  | 'no_mesh';

function filterToMeshParams(filter?: EventFilter, limit?: number) {
  const params: {
    from?: string;
    to?: string;
    group?: string;
    limit?: number;
  } = {};

  if (filter?.by_time_range) {
    if (filter.by_time_range.start_after) {
      params.from = filter.by_time_range.start_after;
    }
    if (filter.by_time_range.end_before) {
      params.to = filter.by_time_range.end_before;
    }
  }
  if (filter?.by_groups?.groups?.[0]) {
    params.group = filter.by_groups.groups[0];
  }
  if (limit != null) params.limit = limit;
  return params;
}

/**
 * List calendar events from the HTTP query plane (mesh.query).
 *
 * Does not require Nostr. On 5xx returns a product-facing status instead of
 * opaque failure so Connect can show headstash availability signal.
 *
 * Eventual consistency: writes on-chain may lag behind the index — empty is
 * not always "no events on chain".
 */
export function useMeshEvents(
  mesh: ResolvedMesh | undefined,
  filter?: EventFilter,
  limit?: number,
) {
  const params = useMemo(
    () => filterToMeshParams(filter, limit),
    // Serialize filter fields that affect the query key
    [
      filter?.by_time_range?.start_after,
      filter?.by_time_range?.end_before,
      filter?.by_groups?.groups?.join(','),
      limit,
    ],
  );

  const query = useQuery({
    queryKey: [
      'mesh-events',
      mesh?.query,
      mesh?.calendar,
      params.from,
      params.to,
      params.group,
      params.limit,
    ],
    enabled: !!mesh?.query,
    staleTime: 30_000,
    retry: (count, err) => {
      if (isMeshQueryError(err) && err.isServerError) return false;
      return count < 1;
    },
    queryFn: async (): Promise<EventListResponse> => {
      if (!mesh) throw new Error('no mesh');
      const client = createMeshQueryClient(mesh);
      const body = await client.listEvents(params);
      const normalized = normalizeMeshEventList(body);
      // Optional client-side status filter when query plane ignores it
      let events: EventResponse[] = normalized.events;
      if (filter?.by_status?.status) {
        const want = filter.by_status.status;
        events = events.filter((er) => {
          if (want === 'active') return er.is_live;
          if (want === 'upcoming') return er.is_triggerable_start;
          return true;
        });
      }
      return { events, total_count: events.length };
    },
  });

  const status: MeshEventsStatus = useMemo(() => {
    if (!mesh) return 'no_mesh';
    if (query.isLoading || query.isFetching) return 'loading';
    if (query.isError) {
      const err = query.error;
      if (isMeshQueryError(err) && err.isServerError) return 'query_unavailable';
      return 'query_error';
    }
    if (query.data && query.data.events.length === 0) return 'empty';
    if (query.data) return 'success';
    return 'idle';
  }, [mesh, query.isLoading, query.isFetching, query.isError, query.error, query.data]);

  return {
    ...query,
    status,
    /** True when headstash query plane returned 5xx */
    queryUnavailable: status === 'query_unavailable',
    productMessage: productMessageFor(status, query.error),
  };
}

function productMessageFor(
  status: MeshEventsStatus,
  error: unknown,
): string | undefined {
  switch (status) {
    case 'query_unavailable':
      return 'Calendar query service is temporarily unavailable (headstash). On-chain schedule is unchanged — try again shortly.';
    case 'query_error':
      if (isMeshQueryError(error)) {
        return `Could not load events from query plane (HTTP ${error.status}).`;
      }
      return 'Could not load events from the query plane.';
    case 'no_mesh':
      return 'No mesh descriptor resolved for this account.';
    case 'empty':
      return undefined; // empty day is normal
    default:
      return undefined;
  }
}
