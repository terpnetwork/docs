'use client';

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';

// ── Import generated hooks and address resolver ─────────────────────────
import {
  useCachedEvent,
  useCachedListEvents,
  useCachedReverseEvents,
  useCachedListGroups,
  useCachedGroup,
  useCachedGroupsManagingEvent,
  useCachedEventCount,
  useCachedAgenda,
} from '@/lib/hooks/use-calendar-wrapper';
import { useCalendarAddress } from '@/lib/hooks/use-calendar-address';
import type {
  EventResponseForEmpty,
  EventListResponseForEmpty,
  EventSupplierType,
} from '@/lib/types/DaoCalendar.types';

// ── Types (preserved from original for component compatibility) ─────────

export interface CalendarConfig {
  owner: string;
  description?: string;
}

export type EventStatus = 'upcoming' | 'active' | 'completed' | 'cancelled';

export interface CalendarEvent {
  title: string;
  description: string;
  start_time: string;
  end_time: string;
  timezone?: string;
  location?: string;
  group_ids: string[];
}

export interface EventResponse {
  id: number;
  event: CalendarEvent;
  is_live: boolean;
  is_triggerable_end: boolean;
  is_triggerable_start: boolean;
}

export interface EventListResponse {
  events: EventResponse[];
  total_count?: number;
}

export interface EventFilter {
  by_groups?: { groups: string[] };
  by_time_range?: { start_after?: string; end_before?: string };
  by_status?: { status: EventStatus };
  this_week?: Record<string, never>;
  this_month?: Record<string, never>;
  upcoming?: Record<string, never>;
}

export interface Group {
  id: string;
  name: string;
  color: string;
  dao_addr?: string;
  members?: string[];
}

export interface GroupResponse {
  group: Group;
  event_count: number;
}

export interface GroupListResponse {
  groups: GroupResponse[];
}

export interface GroupsManagingEventResponse {
  group_ids: string[];
  groups: Group[];
}

// ── Helpers ─────────────────────────────────────────────────────────────

const GROUP_COLORS = [
  '#cfffcf', '#bd93f9', '#fe7d7d', '#98e8c1',
  '#f7c948', '#7fcfff', '#ff9ff3', '#54a0ff',
];

/** Deterministic color from a group ID string. */
function groupColor(groupId: string): string {
  let hash = 0;
  for (let i = 0; i < groupId.length; i++) {
    hash = groupId.charCodeAt(i) + ((hash << 5) - hash);
  }
  return GROUP_COLORS[Math.abs(hash) % GROUP_COLORS.length];
}

/** Convert group ID to display name: 'core-dev' → 'Core Dev' */
function groupName(groupId: string): string {
  return groupId
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/** Convert Cosmos nanos timestamp to JS Date. */
export function nanosToDate(nanos: string): Date {
  return new Date(Number(BigInt(nanos) / 1_000_000n));
}

/** Format a nanos timestamp as "10:00 AM" style. */
export function nanosToTimeString(nanos: string): string {
  return nanosToDate(nanos).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

// ── Type Mappers ────────────────────────────────────────────────────────

function mapContractEvent(event: EventResponseForEmpty): EventResponse {
  const status = event.event.status;
  return {
    id: event.id,
    event: {
      title: event.event.title,
      description: event.event.description || '',
      start_time: event.event.start_time,
      end_time: event.event.end_time,
      timezone: event.event.timezone ?? undefined,
      location: undefined,
      group_ids: event.event.managing_groups,
    },
    is_live: status === 'active',
    is_triggerable_start: status === 'upcoming',
    is_triggerable_end: status === 'active',
  };
}

function mapContractGroup(rawGroup: import('@/lib/types/DaoCalendar.types').Group): Group {
  return {
    id: rawGroup.id,
    name: rawGroup.name || groupName(rawGroup.id),
    color: rawGroup.color ?? groupColor(rawGroup.id),
    dao_addr: rawGroup.dao,
    members: rawGroup.members ?? undefined,
  };
}

function mapContractGroupResponse(
  raw: import('@/lib/types/DaoCalendar.types').Group,
): GroupResponse {
  return {
    group: mapContractGroup(raw),
    event_count: 0, // Not available from contract — future enhancement
  };
}

// ── Convert demo-style EventFilter to contract EventFilter ──────────────

function buildContractFilter(
  filter?: EventFilter,
): import('@/lib/types/DaoCalendar.types').EventFilter | undefined {
  if (!filter) return undefined;

  if (filter.by_groups) {
    return { by_groups: { groups: filter.by_groups.groups } };
  }
  if (filter.by_time_range) {
    return {
      by_time_range: {
        start_after: filter.by_time_range.start_after ?? null,
        end_before: filter.by_time_range.end_before ?? null,
      },
    };
  }
  if (filter.by_status) {
    return { by_status: { status: filter.by_status.status as import('@/lib/types/DaoCalendar.types').EventStatus } };
  }
  return undefined;
}

// ── Hooks (bridge between component interface and generated hooks) ──────

export function useCalendarAddressHook() {
  return useCalendarAddress();
}

export function useCalendarConfig() {
  return useQuery({
    queryKey: ['calendar-config'],
    queryFn: async (): Promise<CalendarConfig> => {
      return { owner: 'terp1...', description: 'Terp Network Community Calendar' };
    },
    staleTime: 30 * 60 * 1000,
  });
}

export function useCalendarGroups() {
  const { data: contractAddress } = useCalendarAddress();

  // Call cached wrapper hook with the resolved address
  const rawResult = useCachedListGroups(contractAddress);

  return useMemo(() => {
    if (!rawResult.data) {
      return { ...rawResult, data: undefined as GroupListResponse | undefined };
    }
    const groups: GroupResponse[] = rawResult.data.groups.map(mapContractGroupResponse);
    return {
      ...rawResult,
      data: { groups },
    };
  }, [rawResult, contractAddress]);
}

export function useGroup(groupId?: string) {
  const { data: contractAddress } = useCalendarAddress();
  const rawResult = useCachedGroup(contractAddress, { groupId: groupId! });

  return useMemo(() => {
    if (!rawResult.data || !groupId) {
      return { ...rawResult, data: undefined as GroupResponse | undefined };
    }
    return {
      ...rawResult,
      data: mapContractGroupResponse(rawResult.data.group),
    };
  }, [rawResult, groupId, contractAddress]);
}

export function useCalendarEvents(
  filter?: EventFilter,
  startAfter?: number,
  limit?: number,
) {
  const { data: contractAddress } = useCalendarAddress();

  const contractFilter = buildContractFilter(filter);
  const params: { filter?: import('@/lib/types/DaoCalendar.types').EventFilter; limit?: number; startAfter?: number } = {};

  if (contractFilter) params.filter = contractFilter;
  if (limit !== undefined) params.limit = limit;
  if (startAfter !== undefined) params.startAfter = startAfter;

  const rawResult = useCachedListEvents(contractAddress, params);

  return useMemo(() => {
    if (!rawResult.data) {
      return { ...rawResult, data: undefined as EventListResponse | undefined };
    }
    const events: EventResponse[] = rawResult.data.events.map(mapContractEvent);
    return {
      ...rawResult,
      data: { events, total_count: events.length },
    };
  }, [rawResult, contractAddress, filter, startAfter, limit]);
}

export function useReverseEvents(
  filter?: EventFilter,
  startBefore?: number,
  limit?: number,
) {
  const { data: contractAddress } = useCalendarAddress();

  const contractFilter = buildContractFilter(filter);
  const params: { filter?: import('@/lib/types/DaoCalendar.types').EventFilter; limit?: number; startBefore?: number } = {};

  if (contractFilter) params.filter = contractFilter;
  if (limit !== undefined) params.limit = limit;
  if (startBefore !== undefined) params.startBefore = startBefore;

  const rawResult = useCachedReverseEvents(contractAddress, params);

  return useMemo(() => {
    if (!rawResult.data) {
      return { ...rawResult, data: undefined as EventListResponse | undefined };
    }
    const events: EventResponse[] = rawResult.data.events.map(mapContractEvent);
    return {
      ...rawResult,
      data: { events, total_count: events.length },
    };
  }, [rawResult, contractAddress, filter, startBefore, limit]);
}

export function useUpcomingEvents(limit?: number) {
  // Upcoming = events with status "upcoming"
  return useCalendarEvents(
    { by_status: { status: 'upcoming' as EventStatus } },
    undefined,
    limit,
  );
}

export function useActiveEvents() {
  // Active = events with status "active"
  return useCalendarEvents({ by_status: { status: 'active' as EventStatus } });
}

export function useEvent(eventId?: number) {
  const { data: contractAddress } = useCalendarAddress();

  const rawResult = useCachedEvent(contractAddress, { eventId: eventId! });

  return useMemo(() => {
    if (!rawResult.data) {
      return { ...rawResult, data: undefined as EventResponse | undefined };
    }
    return {
      ...rawResult,
      data: mapContractEvent(rawResult.data),
    };
  }, [rawResult, contractAddress, eventId]);
}

export function useGroupsManagingEvent(eventId?: number) {
  const { data: contractAddress } = useCalendarAddress();

  const rawResult = useCachedGroupsManagingEvent(contractAddress, { eventId: eventId! });

  return useMemo(() => {
    if (!rawResult.data || !eventId) {
      return { ...rawResult, data: undefined as GroupsManagingEventResponse | undefined };
    }
    const groups: Group[] = rawResult.data.groups.map(mapContractGroup);
    return {
      ...rawResult,
      data: {
        group_ids: groups.map((g) => g.id),
        groups,
      },
    };
  }, [rawResult, contractAddress, eventId]);
}

export function useEventCount() {
  const { data: contractAddress } = useCalendarAddress();
  return useCachedEventCount(contractAddress);
}

export function useAgenda(from?: string, limit?: number) {
  const { data: contractAddress } = useCalendarAddress();
  return useCachedAgenda(contractAddress, { from, limit });
}