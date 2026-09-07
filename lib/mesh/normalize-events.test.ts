import { describe, expect, test } from 'vitest'
import { normalizeMeshEventList } from './normalize-events'

describe('normalizeMeshEventList', () => {
  test('contract-shaped nested events', () => {
    const out = normalizeMeshEventList({
      events: [
        {
          id: 7,
          event: {
            title: 'Standup',
            description: 'daily',
            start_time: '1000',
            end_time: '2000',
            status: 'active',
            managing_groups: ['core'],
            timezone: 'UTC',
          },
        },
      ],
    })
    expect(out.events).toHaveLength(1)
    expect(out.events[0].id).toBe(7)
    expect(out.events[0].event.title).toBe('Standup')
    expect(out.events[0].is_live).toBe(true)
    expect(out.events[0].event.group_ids).toEqual(['core'])
  })

  test('flat indexer shape', () => {
    const out = normalizeMeshEventList({
      events: [
        {
          id: '3',
          title: 'Town hall',
          start_time: '1',
          end_time: '2',
          groups: ['gov'],
        },
      ],
    })
    expect(out.events[0].id).toBe(3)
    expect(out.events[0].event.group_ids).toEqual(['gov'])
  })

  test('raw array body', () => {
    const out = normalizeMeshEventList([
      { id: 1, title: 'A', start_time: '1', end_time: '2' },
    ])
    expect(out.total_count).toBe(1)
  })
})
