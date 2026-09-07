/**
 * Minimal Nostr live plane over mesh.relays[] (C6 progressive enhancement).
 *
 * Design: Live plane is optional. Connect month view must work via HTTP query
 * plane alone. This client only speaks REQ/EVENT/CLOSE over WSS — no NIP-07,
 * no signing, no full client library.
 *
 * Kind convention (calendar announcements on mesh relays) — NIP-52:
 * | Kind  | Meaning                                      |
 * |-------|----------------------------------------------|
 * | 31922 | NIP-52 date-based calendar event             |
 * | 31923 | NIP-52 time-based calendar event             |
 * | 30402 | Classified listing / community notice (opt)  |
 * | 1     | Text note tagged with calendar/dao (opt)     |
 *
 * Progressive plane: HTTP query first (see content.ts for off-chain cid
 * resolve). This client only listens on mesh.relays — no production publisher.
 *
 * Filters always include kind 31922 + 31923. Optional `#a` / `#d` / `#t`
 * tags may narrow by calendar contract or group when known.
 */

export const CALENDAR_NOSTR_KINDS = {
  /** NIP-52 date-based calendar event */
  dateBased: 31922,
  /** NIP-52 time-based calendar event */
  timeBased: 31923,
  /** Optional social mirror of announcements */
  textNote: 1,
} as const

/**
 * NIP-15 Nostr Marketplace kinds (draft/optional).
 * Keep in sync with @dao-dao/utils/marketplaceNostr.
 * Chain settle remains authoritative — these are progressive only.
 */
export const MARKETPLACE_NOSTR_KINDS = {
  stall: 30017,
  product: 30018,
  auctionProduct: 30020,
  bid: 1021,
  bidConfirmation: 1022,
  textNote: 1,
} as const

export type NostrFilter = {
  ids?: string[]
  authors?: string[]
  kinds?: number[]
  since?: number
  until?: number
  limit?: number
  /** Tag filters e.g. '#t': ['calendar'], '#a': [`${kind}:${pubkey}:${d}`] */
  [tag: `#${string}`]: string[] | undefined
}

export type NostrEvent = {
  id: string
  pubkey: string
  created_at: number
  kind: number
  tags: string[][]
  content: string
  sig: string
}

export type SubscribeOptions = {
  /** Relay WSS URLs (usually mesh.relays). */
  relays: string[]
  /** REQ filters (OR'd by the relay). */
  filters: NostrFilter[]
  onEvent: (event: NostrEvent, relay: string) => void
  onEose?: (relay: string) => void
  onError?: (err: Error, relay: string) => void
  onStatus?: (status: 'connecting' | 'open' | 'closed' | 'error', relay: string) => void
  /** Max relays to open (default 3). */
  maxRelays?: number
  /** WebSocket factory (tests / non-browser). */
  WebSocketImpl?: typeof WebSocket
}

export type NostrSubscription = {
  /** Close all sockets and stop receiving. */
  close: () => void
  /** Active relay URLs that still have an open socket. */
  relays: () => string[]
}

let subCounter = 0

function nextSubId(): string {
  subCounter += 1
  return `mesh-cal-${subCounter}-${Date.now().toString(36)}`
}

/**
 * Build default calendar filters for a mesh.
 * @param opts.calendar — optional calendar contract (tag filter when relay supports it)
 * @param opts.since — unix seconds; default now-7d
 * @param opts.includeTextNotes — also subscribe kind 1 with #t calendar
 */
export function buildCalendarNostrFilters(opts: {
  calendar?: string
  since?: number
  until?: number
  limit?: number
  includeTextNotes?: boolean
} = {}): NostrFilter[] {
  const since = opts.since ?? Math.floor(Date.now() / 1000) - 7 * 24 * 60 * 60
  const base: NostrFilter = {
    kinds: [CALENDAR_NOSTR_KINDS.dateBased, CALENDAR_NOSTR_KINDS.timeBased],
    since,
    limit: opts.limit ?? 50,
  }
  if (opts.until != null) base.until = opts.until
  if (opts.calendar) {
    // NIP-52 often uses `d` identifier; relays may also index #t calendar addr.
    base['#t'] = ['dao-calendar', opts.calendar]
  }

  const filters: NostrFilter[] = [base]

  if (opts.includeTextNotes) {
    const note: NostrFilter = {
      kinds: [CALENDAR_NOSTR_KINDS.textNote],
      since,
      limit: opts.limit ?? 30,
      '#t': opts.calendar
        ? ['calendar', 'dao-calendar', opts.calendar]
        : ['calendar', 'dao-calendar'],
    }
    if (opts.until != null) note.until = opts.until
    filters.push(note)
  }

  return filters
}

/**
 * Subscribe to calendar-related kinds on mesh relays.
 * Returns an unsubscribe handle. Failures on individual relays never throw —
 * they call onError and leave other relays running.
 */
export function subscribeNostr(opts: SubscribeOptions): NostrSubscription {
  const WebSocketImpl = opts.WebSocketImpl ?? globalThis.WebSocket
  if (!WebSocketImpl) {
    opts.onError?.(
      new Error('WebSocket not available in this environment'),
      opts.relays[0] || '',
    )
    return { close: () => {}, relays: () => [] }
  }

  const max = opts.maxRelays ?? 3
  const relays = [...new Set(opts.relays.filter(Boolean))].slice(0, max)
  const sockets = new Map<string, WebSocket>()
  let closed = false
  const subId = nextSubId()

  for (const relay of relays) {
    try {
      opts.onStatus?.('connecting', relay)
      const ws = new WebSocketImpl(relay)
      sockets.set(relay, ws)

      ws.onopen = () => {
        if (closed) {
          ws.close()
          return
        }
        opts.onStatus?.('open', relay)
        // REQ frame: ["REQ", <sub_id>, <filter1>, <filter2>, ...]
        const frame = ['REQ', subId, ...opts.filters]
        ws.send(JSON.stringify(frame))
      }

      ws.onmessage = (ev) => {
        if (closed) return
        let msg: unknown
        try {
          msg = JSON.parse(String(ev.data))
        } catch {
          return
        }
        if (!Array.isArray(msg) || msg.length < 2) return
        const type = msg[0]
        if (type === 'EVENT' && msg.length >= 3) {
          const event = msg[2] as NostrEvent
          if (event && typeof event === 'object' && event.id) {
            opts.onEvent(event, relay)
          }
        } else if (type === 'EOSE') {
          opts.onEose?.(relay)
        } else if (type === 'NOTICE' && typeof msg[1] === 'string') {
          // Soft signal; do not treat as hard failure
          opts.onError?.(new Error(`relay notice: ${msg[1]}`), relay)
        }
      }

      ws.onerror = () => {
        opts.onStatus?.('error', relay)
        opts.onError?.(new Error(`WebSocket error on ${relay}`), relay)
      }

      ws.onclose = () => {
        sockets.delete(relay)
        opts.onStatus?.('closed', relay)
      }
    } catch (err) {
      opts.onError?.(
        err instanceof Error ? err : new Error(String(err)),
        relay,
      )
    }
  }

  return {
    close: () => {
      closed = true
      for (const [relay, ws] of sockets) {
        try {
          if (ws.readyState === WebSocketImpl.OPEN) {
            ws.send(JSON.stringify(['CLOSE', subId]))
          }
          ws.close()
        } catch {
          // ignore
        }
        sockets.delete(relay)
      }
    },
    relays: () => [...sockets.keys()],
  }
}

/**
 * Convenience: subscribe calendar kinds for a resolved mesh.
 */
export function subscribeCalendarNostr(
  mesh: { relays: string[]; calendar?: string },
  handlers: Pick<SubscribeOptions, 'onEvent' | 'onEose' | 'onError' | 'onStatus'> & {
    includeTextNotes?: boolean
    since?: number
    WebSocketImpl?: typeof WebSocket
  },
): NostrSubscription {
  if (!mesh.relays?.length) {
    handlers.onError?.(new Error('mesh has no relays'), '')
    return { close: () => {}, relays: () => [] }
  }
  return subscribeNostr({
    relays: mesh.relays,
    filters: buildCalendarNostrFilters({
      calendar: mesh.calendar,
      includeTextNotes: handlers.includeTextNotes,
      since: handlers.since,
    }),
    onEvent: handlers.onEvent,
    onEose: handlers.onEose,
    onError: handlers.onError,
    onStatus: handlers.onStatus,
    WebSocketImpl: handlers.WebSocketImpl,
  })
}
