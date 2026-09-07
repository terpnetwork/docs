import { describe, expect, test } from 'vitest'
import {
  contentPath,
  contentResolveUrl,
  parseCid,
  resolveEventBodyProgressive,
  resolveOffchainBody,
} from './content'

describe('parseCid', () => {
  test('bare sha256 preferred', () => {
    const h = 'ab'.repeat(32)
    const p = parseCid(h)
    expect(p.kind).toBe('bud_sha256')
    expect(p.value).toBe(h)
    expect(contentPath(p)).toBe(`/content/${h}`)
  })

  test('bud and ipfs prefixes', () => {
    const h = 'cd'.repeat(32)
    expect(parseCid(`bud:${h}`).value).toBe(h)
    expect(parseCid('ipfs:bafybeigdyrzt').kind).toBe('ipfs')
    expect(contentPath(parseCid('ipfs:bafybeigdyrzt'))).toBe(
      '/content/by-ipfs/bafybeigdyrzt',
    )
  })

  test('reject garbage', () => {
    expect(() => parseCid('')).toThrow()
    expect(() => parseCid('not-a-cid')).toThrow()
  })
})

describe('resolveOffchainBody', () => {
  test('fetches content plane URL', async () => {
    const h = '11'.repeat(32)
    const body = '{"title":"x"}'
    const { text, url, parsed } = await resolveOffchainBody({
      cid: h,
      contentBase: 'https://hash.example',
      fetchImpl: async (input) => {
        expect(String(input)).toBe(`https://hash.example/content/${h}`)
        return new Response(body, { status: 200 })
      },
    })
    expect(text).toBe(body)
    expect(parsed.kind).toBe('bud_sha256')
    expect(url).toContain(h)
  })
})

describe('resolveEventBodyProgressive', () => {
  test('on-chain first', async () => {
    const r = await resolveEventBodyProgressive({
      on_chain: true,
      e: '{"title":"on"}',
    })
    expect(r.source).toBe('on_chain')
    expect((r.body as { title: string }).title).toBe('on')
  })

  test('off-chain via content plane', async () => {
    const h = '22'.repeat(32)
    const r = await resolveEventBodyProgressive({
      on_chain: false,
      cid: h,
      contentBase: 'https://bud.test',
      fetchImpl: async () => new Response('{"title":"off"}', { status: 200 }),
    })
    expect(r.source).toBe('content_plane')
    expect((r.body as { title: string }).title).toBe('off')
  })

  test('none when missing', async () => {
    const r = await resolveEventBodyProgressive({ on_chain: false })
    expect(r.source).toBe('none')
  })
})

describe('contentResolveUrl', () => {
  test('trims base slash', () => {
    const h = '33'.repeat(32)
    expect(contentResolveUrl('https://x/', h)).toBe(`https://x/content/${h}`)
  })
})
