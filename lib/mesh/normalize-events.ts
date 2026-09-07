/**
 * Normalize query-plane listEvents payloads into Connect UI EventResponse.
 *
 * The headstash query plane may return:
 * - { events: EventResponseForEmpty[] } (contract-shaped)
 * - { events: FlatEvent[] } (indexer-shaped)
 * - EventResponseForEmpty[] directly
 *
 * Index lag: on-chain writes may not appear here immediately — document eventual
 * consistency in UI copy (design §7).
 */

export type NormalizedCalendarEvent = {
  id: number
  event: {
    title: string
    description: string
    start_time: string
    end_time: string
    timezone?: string
    location?: string
    group_ids: string[]
  }
  is_live: boolean
  is_triggerable_end: boolean
  is_triggerable_start: boolean
}

export type NormalizedEventList = {
  events: NormalizedCalendarEvent[]
  total_count?: number
}

function asString(v: unknown, fallback = ''): string {
  if (v == null) return fallback
  return String(v)
}

function asNumber(v: unknown, fallback = 0): number {
  if (typeof v === 'number' && Number.isFinite(v)) return v
  if (typeof v === 'string' && v.trim() !== '' && !Number.isNaN(Number(v))) {
    return Number(v)
  }
  return fallback
}

function asStringArray(v: unknown): string[] {
  if (!Array.isArray(v)) return []
  return v.filter((x): x is string => typeof x === 'string')
}

function normalizeOne(raw: unknown, index: number): NormalizedCalendarEvent | null {
  if (!raw || typeof raw !== 'object') return null
  const r = raw as Record<string, unknown>

  // Nested contract shape: { id, event: { title, start_time, ... } }
  if (r.event && typeof r.event === 'object') {
    const e = r.event as Record<string, unknown>
    const status = asString(e.status)
    const groupIds =
      asStringArray(e.managing_groups).length > 0
        ? asStringArray(e.managing_groups)
        : asStringArray(e.group_ids)
    return {
      id: asNumber(r.id, index),
      event: {
        title: asString(e.title, 'Untitled'),
        description: asString(e.description),
        start_time: asString(e.start_time),
        end_time: asString(e.end_time),
        timezone: e.timezone != null ? asString(e.timezone) : undefined,
        location: e.location != null ? asString(e.location) : undefined,
        group_ids: groupIds,
      },
      is_live: status === 'active' || r.is_live === true,
      is_triggerable_start: status === 'upcoming' || r.is_triggerable_start === true,
      is_triggerable_end: status === 'active' || r.is_triggerable_end === true,
    }
  }

  // Flat indexer shape
  const title = asString(r.title)
  if (!title && r.start_time == null && r.start == null) return null
  const status = asString(r.status)
  const start = asString(r.start_time ?? r.start ?? r.from)
  const end = asString(r.end_time ?? r.end ?? r.to)
  return {
    id: asNumber(r.id ?? r.event_id, index),
    event: {
      title: title || 'Untitled',
      description: asString(r.description),
      start_time: start,
      end_time: end,
      timezone: r.timezone != null ? asString(r.timezone) : undefined,
      location: r.location != null ? asString(r.location) : undefined,
      group_ids:
        asStringArray(r.managing_groups).length > 0
          ? asStringArray(r.managing_groups)
          : asStringArray(r.group_ids ?? r.groups),
    },
    is_live: status === 'active' || r.is_live === true,
    is_triggerable_start: status === 'upcoming',
    is_triggerable_end: status === 'active',
  }
}

export function normalizeMeshEventList(body: unknown): NormalizedEventList {
  let items: unknown[] = []
  if (Array.isArray(body)) {
    items = body
  } else if (body && typeof body === 'object') {
    const o = body as Record<string, unknown>
    if (Array.isArray(o.events)) items = o.events
    else if (Array.isArray(o.data)) items = o.data
  }

  const events = items
    .map((item, i) => normalizeOne(item, i))
    .filter((e): e is NormalizedCalendarEvent => e != null)

  const total =
    body && typeof body === 'object' && !Array.isArray(body)
      ? (body as { total_count?: number; count?: number }).total_count ??
        (body as { count?: number }).count
      : undefined

  return {
    events,
    total_count: total ?? events.length,
  }
}
