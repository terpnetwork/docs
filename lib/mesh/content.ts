/**
 * Content-plane resolve for off-chain calendar bodies (Phase B).
 *
 * HTTP-first progressive path:
 * 1. Query plane / LCD returns MetadataExt (on_chain, cid, kind, …)
 * 2. If off-chain, resolve body via dual-index content plane (BUD sha256 primary)
 * 3. Nostr subscribe remains optional live enhancement (see nostr.ts)
 *
 * cid encoding (frozen with hash-market content::cid):
 * | Prefer | Form            | Resolve                         |
 * |--------|-----------------|---------------------------------|
 * | Yes    | bare 64-hex     | GET {base}/content/{sha256}     |
 * | Opt    | bud: / sha256:  | strip → same                    |
 * | Sec.   | ipfs: / ipfs:// | GET {base}/content/by-ipfs/{cid}|
 */

export type CidKind = 'bud_sha256' | 'ipfs'

export type ParsedCid = {
  kind: CidKind
  value: string
}

export type ContentPlaneUrls = {
  /** Public bud / hash-market base, e.g. https://hash.terp.network */
  contentBase: string
  /** Optional IPFS gateway prefix if dual-index miss */
  ipfsGateway?: string
}

const SHA256_HEX = /^[0-9a-fA-F]{64}$/

export function parseCid(raw: string): ParsedCid {
  const s = raw.trim()
  if (!s) throw new Error('empty cid')

  const lower = s.toLowerCase()
  if (lower.startsWith('bud:') || lower.startsWith('sha256:')) {
    const rest = s.slice(s.indexOf(':') + 1).replace(/^0x/i, '')
    if (!SHA256_HEX.test(rest)) {
      throw new Error(`invalid sha256 hex: ${rest}`)
    }
    return { kind: 'bud_sha256', value: rest.toLowerCase() }
  }
  if (lower.startsWith('ipfs://') || lower.startsWith('ipfs:')) {
    const rest = s
      .replace(/^ipfs:\/\//i, '')
      .replace(/^ipfs:/i, '')
      .replace(/^\//, '')
    if (!rest) throw new Error('empty ipfs cid')
    return { kind: 'ipfs', value: rest }
  }
  if (SHA256_HEX.test(s)) {
    return { kind: 'bud_sha256', value: s.toLowerCase() }
  }
  if (s.startsWith('Qm') || s.startsWith('bafy') || s.startsWith('bafk') || s.startsWith('bafz')) {
    return { kind: 'ipfs', value: s }
  }
  throw new Error(`unrecognized cid: ${s}`)
}

/** Relative path on content plane. */
export function contentPath(parsed: ParsedCid): string {
  if (parsed.kind === 'bud_sha256') return `/content/${parsed.value}`
  return `/content/by-ipfs/${parsed.value}`
}

/** Absolute resolve URL for fetch. */
export function contentResolveUrl(base: string, cid: string): string {
  const parsed = parseCid(cid)
  const b = base.replace(/\/$/, '')
  return `${b}${contentPath(parsed)}`
}

export type ResolveOffchainOptions = ContentPlaneUrls & {
  cid: string
  /** fetch impl (tests / SSR) */
  fetchImpl?: typeof fetch
  signal?: AbortSignal
}

/**
 * Fetch off-chain calendar body bytes/text from the dual-index content plane.
 * Throws on HTTP error; callers should fall back to query-plane summary only.
 */
export async function resolveOffchainBody(
  opts: ResolveOffchainOptions,
): Promise<{ bytes: ArrayBuffer; text: string; url: string; parsed: ParsedCid }> {
  const fetchImpl = opts.fetchImpl ?? globalThis.fetch
  if (!fetchImpl) {
    throw new Error('fetch not available')
  }
  const parsed = parseCid(opts.cid)
  const url = contentResolveUrl(opts.contentBase, opts.cid)
  const res = await fetchImpl(url, { signal: opts.signal })
  if (!res.ok) {
    // Optional IPFS gateway fallback when dual-index miss
    if (parsed.kind === 'ipfs' && opts.ipfsGateway) {
      const gw = opts.ipfsGateway.replace(/\/$/, '')
      const alt = `${gw}/${parsed.value}`
      const res2 = await fetchImpl(alt, { signal: opts.signal })
      if (!res2.ok) {
        throw new Error(`content plane ${res.status}; ipfs gateway ${res2.status}`)
      }
      const bytes = await res2.arrayBuffer()
      return { bytes, text: new TextDecoder().decode(bytes), url: alt, parsed }
    }
    throw new Error(`content plane HTTP ${res.status} for ${url}`)
  }
  const bytes = await res.arrayBuffer()
  return { bytes, text: new TextDecoder().decode(bytes), url, parsed }
}

/**
 * Progressive event body: prefer on-chain fields; if `on_chain === false` and cid set,
 * resolve via content plane. Never blocks UI on Nostr.
 */
export async function resolveEventBodyProgressive(opts: {
  on_chain: boolean
  /** On-chain encoded payload (JSON string or already-parsed) */
  e?: string | Record<string, unknown> | null
  cid?: string | null
  contentBase?: string
  ipfsGateway?: string
  fetchImpl?: typeof fetch
  signal?: AbortSignal
}): Promise<{ source: 'on_chain' | 'content_plane' | 'none'; body: unknown }> {
  if (opts.on_chain && opts.e != null) {
    if (typeof opts.e === 'string') {
      try {
        return { source: 'on_chain', body: JSON.parse(opts.e) }
      } catch {
        return { source: 'on_chain', body: opts.e }
      }
    }
    return { source: 'on_chain', body: opts.e }
  }
  if (!opts.on_chain && opts.cid && opts.contentBase) {
    const { text } = await resolveOffchainBody({
      cid: opts.cid,
      contentBase: opts.contentBase,
      ipfsGateway: opts.ipfsGateway,
      fetchImpl: opts.fetchImpl,
      signal: opts.signal,
    })
    try {
      return { source: 'content_plane', body: JSON.parse(text) }
    } catch {
      return { source: 'content_plane', body: text }
    }
  }
  return { source: 'none', body: null }
}
