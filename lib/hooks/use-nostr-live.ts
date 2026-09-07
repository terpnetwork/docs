'use client';

import { useEffect, useRef, useState } from 'react';
import type { ResolvedMesh } from '@/lib/mesh';
import {
  subscribeCalendarNostr,
  type NostrEvent,
  type NostrSubscription,
} from '@/lib/mesh/nostr';

export type NostrLiveState = {
  /** Progressive enhancement — false when WS unavailable or mesh has no relays */
  enabled: boolean;
  connected: boolean;
  eventCount: number;
  lastEvent?: NostrEvent;
  error?: string;
};

/**
 * Optional live Nostr plane. UI must work when this is disabled/failing.
 * Refetches of HTTP query plane stay authoritative for month list.
 */
export function useNostrCalendarLive(
  mesh: ResolvedMesh | undefined,
  opts: { enabled?: boolean } = {},
): NostrLiveState {
  const enabled = opts.enabled !== false && !!mesh?.relays?.length;
  const [connected, setConnected] = useState(false);
  const [eventCount, setEventCount] = useState(0);
  const [lastEvent, setLastEvent] = useState<NostrEvent | undefined>();
  const [error, setError] = useState<string | undefined>();
  const subRef = useRef<NostrSubscription | null>(null);

  useEffect(() => {
    if (!enabled || !mesh) {
      setConnected(false);
      return;
    }

    let openCount = 0;
    const sub = subscribeCalendarNostr(mesh, {
      onEvent: (ev) => {
        setEventCount((n) => n + 1);
        setLastEvent(ev);
      },
      onStatus: (status) => {
        if (status === 'open') {
          openCount += 1;
          setConnected(true);
          setError(undefined);
        } else if (status === 'closed' || status === 'error') {
          openCount = Math.max(0, openCount - 1);
          if (openCount === 0) setConnected(false);
        }
      },
      onError: (err) => {
        // Soft: do not flip whole UI into error
        setError(err.message);
      },
    });
    subRef.current = sub;

    return () => {
      sub.close();
      subRef.current = null;
      setConnected(false);
    };
  }, [enabled, mesh?.query, mesh?.calendar, mesh?.relays?.join('|')]);

  return {
    enabled,
    connected,
    eventCount,
    lastEvent,
    error,
  };
}
