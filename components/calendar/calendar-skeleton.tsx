'use client';

import { cn } from '@/lib/utils';

/**
 * Skeleton loading components for the calendar UI.
 * Provides visual feedback during chain queries instead of bare text.
 */

function SkeletonPulse({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-md bg-fd-muted-foreground/20',
        className,
      )}
    />
  );
}

export function CalendarWidgetSkeleton() {
  return (
    <div className="not-prose flex flex-col gap-5 rounded-xl border border-fd-border bg-fd-card/60 p-5 backdrop-blur-sm">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <SkeletonPulse className="h-5 w-40" />
          <SkeletonPulse className="h-3 w-56" />
        </div>
        <SkeletonPulse className="h-9 w-32 rounded-md" />
      </div>
      {/* Calendar + event list skeleton */}
      <div className="grid gap-5 lg:grid-cols-[auto_1fr]">
        <SkeletonPulse className="h-[300px] w-[280px] rounded-lg" />
        <div className="flex flex-col gap-3">
          <SkeletonPulse className="h-4 w-32" />
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="flex items-start gap-2.5 rounded-lg border border-fd-border bg-fd-secondary/50 p-3"
            >
              <SkeletonPulse className="mt-1 size-2.5 shrink-0 rounded-full" />
              <div className="flex-1 space-y-2">
                <SkeletonPulse className="h-4 w-48" />
                <SkeletonPulse className="h-3 w-36" />
                <SkeletonPulse className="h-3 w-64" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function EventPanelSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      <SkeletonPulse className="h-4 w-32" />
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="flex items-start gap-2.5 rounded-lg border border-fd-border bg-fd-secondary/50 p-3"
        >
          <SkeletonPulse className="mt-1 size-2.5 shrink-0 rounded-full" />
          <div className="flex-1 space-y-2">
            <SkeletonPulse className="h-4 w-48" />
            <SkeletonPulse className="h-3 w-36" />
            <SkeletonPulse className="h-3 w-64" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function GroupSelectSkeleton() {
  return (
    <div className="flex items-center gap-2">
      <SkeletonPulse className="h-9 w-[160px] rounded-md" />
      <SkeletonPulse className="h-9 w-28 rounded-md" />
    </div>
  );
}