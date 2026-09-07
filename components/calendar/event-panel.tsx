'use client';

import { useMemo } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  useCalendarGroups,
  nanosToTimeString,
  type EventFilter,
} from '@/lib/hooks/use-calendar';
import { useMeshEvents } from '@/lib/hooks/use-mesh-events';
import type { ResolvedMesh } from '@/lib/mesh';
import { EventPanelSkeleton } from './calendar-skeleton';

interface EventPanelProps {
  selectedDate: Date;
  selectedGroup: string;
  /** When provided, list events from HTTP query plane (preferred). */
  mesh?: ResolvedMesh;
}

export function EventPanel({
  selectedDate,
  selectedGroup,
  mesh,
}: EventPanelProps) {
  const dayStart = new Date(selectedDate);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(selectedDate);
  dayEnd.setHours(23, 59, 59, 999);

  const filter: EventFilter = useMemo(
    () => ({
      by_time_range: {
        start_after: (BigInt(dayStart.getTime()) * 1_000_000n).toString(),
        end_before: (BigInt(dayEnd.getTime()) * 1_000_000n).toString(),
      },
      ...(selectedGroup !== 'all' && {
        by_groups: { groups: [selectedGroup] },
      }),
    }),
    [selectedDate.getTime(), selectedGroup],
  );

  const {
    data,
    isLoading,
    queryUnavailable,
    productMessage,
  } = useMeshEvents(mesh, filter, 20);

  const { data: groupsData } = useCalendarGroups();

  const groupColorMap = new Map(
    groupsData?.groups.map((gr) => [gr.group.id, gr.group.color]) ?? [],
  );

  const dateStr = selectedDate.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm font-medium text-fd-muted-foreground">{dateStr}</p>
      {isLoading ? (
        <EventPanelSkeleton />
      ) : queryUnavailable ? (
        <p className="text-sm text-orange-800 dark:text-orange-200">
          {productMessage ||
            'Query plane unavailable — day events cannot be listed right now.'}
        </p>
      ) : !data?.events.length ? (
        <p className="text-sm text-fd-muted-foreground">
          No events on this day.
        </p>
      ) : (
        <ScrollArea className="max-h-[360px]">
          <div className="flex flex-col gap-2 pr-3">
            {data.events.map((er) => {
              const primaryGroup = er.event.group_ids[0];
              const color = groupColorMap.get(primaryGroup) ?? '#888';

              return (
                <div
                  key={er.id}
                  className="rounded-lg border border-fd-border bg-fd-secondary/50 p-3"
                >
                  <div className="flex items-start gap-2.5">
                    <span
                      className="mt-1 inline-block size-2.5 shrink-0 rounded-full ring-2 ring-fd-background"
                      style={{ backgroundColor: color }}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium leading-tight text-fd-foreground">
                        {er.event.title}
                        {er.is_live && (
                          <span className="ml-2 rounded-sm bg-green-500/15 px-1.5 py-0.5 text-[10px] font-semibold text-green-600 dark:text-green-400">
                            LIVE
                          </span>
                        )}
                      </p>
                      <p className="mt-0.5 text-xs text-fd-muted-foreground">
                        {safeTime(er.event.start_time)}
                        {' \u2013 '}
                        {safeTime(er.event.end_time)}
                        {er.event.timezone && (
                          <span className="ml-1 font-mono text-[10px] text-fd-muted-foreground/60">
                            {er.event.timezone}
                          </span>
                        )}
                        {er.event.location && (
                          <span className="text-fd-accent-foreground">
                            {' \u00b7 '}
                            {er.event.location}
                          </span>
                        )}
                      </p>
                      {er.event.description && (
                        <p className="mt-1.5 text-xs leading-relaxed text-fd-muted-foreground/80">
                          {er.event.description}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}

function safeTime(nanosOrIso: string): string {
  try {
    return nanosToTimeString(nanosOrIso);
  } catch {
    const d = new Date(nanosOrIso);
    if (Number.isNaN(d.getTime())) return nanosOrIso;
    return d.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  }
}
