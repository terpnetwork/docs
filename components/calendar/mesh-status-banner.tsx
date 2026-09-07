'use client';

import type { ResolvedMesh } from '@/lib/mesh';
import type { MeshEventsStatus } from '@/lib/hooks/use-mesh-events';

type Props = {
  mesh?: ResolvedMesh;
  meshLoading?: boolean;
  meshError?: boolean;
  eventsStatus?: MeshEventsStatus;
  productMessage?: string;
  /** Optional Nostr live indicator (progressive enhancement) */
  live?: { connected: boolean; eventCount: number; enabled: boolean };
};

/**
 * Product friction signals for Connect calendar (design §7).
 * Never an opaque stack trace — always a human/product reason.
 */
export function MeshStatusBanner({
  mesh,
  meshLoading,
  meshError,
  eventsStatus,
  productMessage,
  live,
}: Props) {
  if (meshLoading) {
    return (
      <div className="rounded-md border border-fd-border bg-fd-secondary/40 px-3 py-2 text-xs text-fd-muted-foreground">
        Resolving mesh (mesh.v1 + chain headstash defaults)…
      </div>
    );
  }

  if (meshError) {
    return (
      <div className="rounded-md border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-xs text-amber-800 dark:text-amber-200">
        Could not resolve mesh for this account. Calendar reads need a mesh
        descriptor or chain headstash default.
      </div>
    );
  }

  const warnings = mesh?.warnings ?? [];
  const showQueryOutage = eventsStatus === 'query_unavailable';
  const showQueryError = eventsStatus === 'query_error';

  if (!warnings.length && !showQueryOutage && !showQueryError && !productMessage && !live?.enabled) {
    return null;
  }

  return (
    <div className="flex flex-col gap-2">
      {showQueryOutage && (
        <div className="rounded-md border border-orange-500/40 bg-orange-500/10 px-3 py-2 text-xs text-orange-900 dark:text-orange-100">
          {productMessage ||
            'Query plane (headstash) returned a server error. Schedule data may be temporarily incomplete — this is not an on-chain failure.'}
        </div>
      )}
      {showQueryError && !showQueryOutage && productMessage && (
        <div className="rounded-md border border-fd-border bg-fd-secondary/50 px-3 py-2 text-xs text-fd-muted-foreground">
          {productMessage}
        </div>
      )}
      {warnings.map((w) => (
        <div
          key={w}
          className="rounded-md border border-fd-border bg-fd-secondary/40 px-3 py-2 text-xs text-fd-muted-foreground"
        >
          {w.includes('calendar')
            ? 'Mesh has no calendar address — enable dao-calendar on the DAO (half-configured).'
            : w}
        </div>
      ))}
      {mesh && (
        <div className="flex flex-wrap items-center gap-2 text-[10px] text-fd-muted-foreground/80">
          <span className="rounded bg-fd-secondary px-1.5 py-0.5 font-mono">
            mesh:{mesh.source}
          </span>
          <span className="font-mono truncate max-w-[200px]" title={mesh.query}>
            query:{mesh.query.replace(/^https?:\/\//, '')}
          </span>
          {mesh.calendar && (
            <span className="font-mono truncate max-w-[160px]" title={mesh.calendar}>
              cal:{mesh.calendar.slice(0, 10)}…
            </span>
          )}
          {live?.enabled && (
            <span
              className={
                live.connected
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-fd-muted-foreground'
              }
            >
              {live.connected
                ? `live nostr · ${live.eventCount} events`
                : 'live nostr · connecting…'}
            </span>
          )}
        </div>
      )}
      <p className="text-[10px] text-fd-muted-foreground/70">
        Index lag: on-chain creates may take a short time to appear on the query
        plane.
      </p>
    </div>
  );
}
