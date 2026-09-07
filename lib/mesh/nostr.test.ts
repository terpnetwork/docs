import { describe, expect, test } from 'vitest'
import {
  buildCalendarNostrFilters,
  CALENDAR_NOSTR_KINDS,
  subscribeNostr,
} from './nostr'

describe('buildCalendarNostrFilters', () => {
  test('includes NIP-52 kinds', () => {
    const filters = buildCalendarNostrFilters({ since: 100 })
    expect(filters[0].kinds).toEqual([
      CALENDAR_NOSTR_KINDS.dateBased,
      CALENDAR_NOSTR_KINDS.timeBased,
    ])
    // NIP-52: 31922 date-based, 31923 time-based
    expect(CALENDAR_NOSTR_KINDS.dateBased).toBe(31922)
    expect(CALENDAR_NOSTR_KINDS.timeBased).toBe(31923)
    expect(filters[0].since).toBe(100)
  })

  test('tags calendar when provided', () => {
    const filters = buildCalendarNostrFilters({ calendar: 'terp1cal' })
    expect(filters[0]['#t']).toContain('terp1cal')
  })

  test('optional text notes', () => {
    const filters = buildCalendarNostrFilters({ includeTextNotes: true })
    expect(filters).toHaveLength(2)
    expect(filters[1].kinds).toEqual([1])
  })
})

describe('subscribeNostr', () => {
  test('sends REQ on open and delivers EVENT', async () => {
    const events: string[] = []
    const sent: string[] = []
    let instance: {
      onopen: (() => void) | null
      onmessage: ((ev: { data: string }) => void) | null
      readyState: number
    } | null = null

    class FakeWS {
      static OPEN = 1
      readyState = 0
      onopen: (() => void) | null = null
      onmessage: ((ev: { data: string }) => void) | null = null
      onerror: (() => void) | null = null
      onclose: (() => void) | null = null
      constructor(_url: string) {
        instance = this
        queueMicrotask(() => {
          this.readyState = FakeWS.OPEN
          this.onopen?.()
        })
      }
      send(data: string) {
        sent.push(data)
      }
      close() {
        this.readyState = 3
      }
    }

    const sub = subscribeNostr({
      relays: ['wss://example.test'],
      filters: [{ kinds: [31922], since: 1 }],
      onEvent: (e) => events.push(e.id),
      WebSocketImpl: FakeWS as unknown as typeof WebSocket,
    })

    await new Promise((r) => queueMicrotask(r))
    await new Promise((r) => queueMicrotask(r))

    expect(sent.length).toBe(1)
    const req = JSON.parse(sent[0])
    expect(req[0]).toBe('REQ')
    expect(req[2].kinds).toEqual([31922])

    instance!.onmessage?.({
      data: JSON.stringify([
        'EVENT',
        req[1],
        {
          id: 'abc',
          pubkey: 'pk',
          created_at: 1,
          kind: 31922,
          tags: [],
          content: '{}',
          sig: 's',
        },
      ]),
    })
    expect(events).toEqual(['abc'])
    sub.close()
  })
})
