/**
 * DAO mesh.v1 resolve client (Connect / public docs path).
 *
 * Mirrors @dao-dao/utils/mesh so Connect and dao-dao share one contract.
 * Design: websites/dao-dao-ui/docs/superpowers/specs/2026-07-20-dao-mesh-calendar-nostr-design.md
 */

import { MeshQueryError } from './errors'

export { MeshQueryError, isMeshQueryError } from './errors'
export {
  buildCalendarNostrFilters,
  CALENDAR_NOSTR_KINDS,
  subscribeCalendarNostr,
  subscribeNostr,
} from './nostr'
export type {
  NostrEvent,
  NostrFilter,
  NostrSubscription,
  SubscribeOptions,
} from './nostr'
export { normalizeMeshEventList } from './normalize-events'
export type {
  NormalizedCalendarEvent,
  NormalizedEventList,
} from './normalize-events'
export {
  contentPath,
  contentResolveUrl,
  parseCid,
  resolveEventBodyProgressive,
  resolveOffchainBody,
} from './content'
export type {
  CidKind,
  ContentPlaneUrls,
  ParsedCid,
  ResolveOffchainOptions,
} from './content'

export const MESH_STORAGE_KEY = 'mesh.v1'
export const MESH_TEXT_RECORD_KEY = 'mesh.v1'
export const MESH_DESCRIPTOR_VERSION = 1 as const

/** Production Terp defaults (C0). Keep in sync with dao-dao-ui chains.ts services. */
export const TERP_CHAIN_MESH_SERVICES = {
  headstashServer: 'https://headstash.terp.network',
  headstashWss: 'wss://headstash.terp.network',
  merkleServer: 'https://hash.terp.network',
} as const

export type MeshAuthHint = {
  planes: string[]
  default?: string
}

/** Listing modes a DAO marketplace surface supports (M0 dual with dao-dao-ui). */
export type MeshMarketplaceMode = 'fixed' | 'auction' | 'buy_now'

/**
 * mesh.v1.marketplace — fixed-price + auction discovery.
 * Keep in sync with @dao-dao/utils MeshMarketplaceV1.
 */
export type MeshMarketplaceV1 = {
  fixedPrice?: string
  auction?: string
  contentBase?: string
  acceptedDenom?: string
  minBufferBlocks?: number
  modes?: MeshMarketplaceMode[]
}

export type MeshDescriptorV1 = {
  v: typeof MESH_DESCRIPTOR_VERSION
  relays: string[]
  query: string
  calendar?: string
  marketplace?: MeshMarketplaceV1
  auth?: MeshAuthHint
  strictRelays?: boolean
  notes?: string
}

export type MeshResolveSource =
  | 'override'
  | 'dao_storage'
  | 'module'
  | 'text_record'
  | 'chain_default'

export type ResolvedMesh = MeshDescriptorV1 & {
  source: MeshResolveSource
  warnings: string[]
  chainId: string
}

export type ChainMeshServices = {
  headstashServer?: string
  headstashWss?: string
  merkleServer?: string
  hashContentBase?: string
}

export type MeshResolveLoaders = {
  getDaoStorageItem?: (key: string) => Promise<string | null | undefined>
  getModuleValues?: () => Promise<
    | {
        calendarContract?: string
        meshJson?: string
        marketplaceFixedPrice?: string
        marketplaceAuction?: string
        marketplaceContentBase?: string
        marketplaceAcceptedDenom?: string
        marketplaceMinBufferBlocks?: number
      }
    | null
    | undefined
  >
  getTextRecord?: (key: string) => Promise<string | null | undefined>
}

export class MeshResolveError extends Error {
  constructor(
    message: string,
    public readonly code:
      | 'NO_MESH'
      | 'INVALID_JSON'
      | 'INVALID_DESCRIPTOR'
      | 'CHAIN_DEFAULT_MISSING',
  ) {
    super(message)
    this.name = 'MeshResolveError'
  }
}

export function httpsToWss(httpsUrl: string): string {
  try {
    const u = new URL(httpsUrl)
    u.protocol = u.protocol === 'https:' ? 'wss:' : 'ws:'
    return u.toString().replace(/\/$/, '')
  } catch {
    return httpsUrl.replace(/^https:/i, 'wss:').replace(/^http:/i, 'ws:')
  }
}

const MARKETPLACE_MODES: MeshMarketplaceMode[] = [
  'fixed',
  'auction',
  'buy_now',
]

export function parseMeshMarketplace(
  raw: unknown,
): MeshMarketplaceV1 | undefined {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return undefined
  }
  const m = raw as Record<string, unknown>
  const modes = Array.isArray(m.modes)
    ? m.modes.filter((x): x is MeshMarketplaceMode =>
        MARKETPLACE_MODES.includes(x as MeshMarketplaceMode),
      )
    : undefined
  const out: MeshMarketplaceV1 = {
    fixedPrice:
      typeof m.fixedPrice === 'string' && m.fixedPrice
        ? m.fixedPrice
        : undefined,
    auction:
      typeof m.auction === 'string' && m.auction ? m.auction : undefined,
    contentBase:
      typeof m.contentBase === 'string' && m.contentBase
        ? m.contentBase.replace(/\/$/, '')
        : undefined,
    acceptedDenom:
      typeof m.acceptedDenom === 'string' && m.acceptedDenom
        ? m.acceptedDenom
        : undefined,
    minBufferBlocks:
      typeof m.minBufferBlocks === 'number' && Number.isFinite(m.minBufferBlocks)
        ? m.minBufferBlocks
        : undefined,
    modes: modes?.length ? modes : undefined,
  }
  if (
    !out.fixedPrice &&
    !out.auction &&
    !out.contentBase &&
    !out.acceptedDenom &&
    out.minBufferBlocks === undefined &&
    !out.modes
  ) {
    return undefined
  }
  return out
}

export function mergeMeshMarketplace(
  base?: MeshMarketplaceV1,
  layer?: MeshMarketplaceV1 | null,
): MeshMarketplaceV1 | undefined {
  if (!base && !layer) return undefined
  if (!layer) return base
  if (!base) return layer
  return {
    fixedPrice: layer.fixedPrice ?? base.fixedPrice,
    auction: layer.auction ?? base.auction,
    contentBase: layer.contentBase ?? base.contentBase,
    acceptedDenom: layer.acceptedDenom ?? base.acceptedDenom,
    minBufferBlocks: layer.minBufferBlocks ?? base.minBufferBlocks,
    modes: layer.modes ?? base.modes,
  }
}

export function buildDefaultMeshDescriptor(
  services: ChainMeshServices,
  extras?: Partial<
    Pick<MeshDescriptorV1, 'calendar' | 'marketplace' | 'auth' | 'notes'>
  >,
): MeshDescriptorV1 {
  const query = (services.headstashServer || '').replace(/\/$/, '')
  if (!query) {
    throw new MeshResolveError(
      'Chain default headstashServer is empty',
      'CHAIN_DEFAULT_MISSING',
    )
  }
  const wss =
    (services.headstashWss || '').replace(/\/$/, '') || httpsToWss(query)
  const contentBase = (
    services.hashContentBase ||
    services.merkleServer ||
    ''
  ).replace(/\/$/, '')
  const defaultMarketplace: MeshMarketplaceV1 | undefined = contentBase
    ? {
        contentBase,
        minBufferBlocks: 7,
        modes: ['fixed', 'auction', 'buy_now'],
      }
    : undefined
  const marketplace = mergeMeshMarketplace(
    defaultMarketplace,
    extras?.marketplace,
  )
  return {
    v: MESH_DESCRIPTOR_VERSION,
    relays: [wss],
    query,
    calendar: extras?.calendar,
    marketplace,
    auth: extras?.auth ?? {
      planes: ['pfpk', 'smartaccount', 'nostr'],
      default: 'pfpk',
    },
    notes: extras?.notes,
  }
}

export function parseMeshDescriptor(
  raw: string | MeshDescriptorV1 | Record<string, unknown>,
): MeshDescriptorV1 {
  let obj: unknown
  if (typeof raw === 'string') {
    try {
      obj = JSON.parse(raw)
    } catch {
      throw new MeshResolveError('mesh.v1 is not valid JSON', 'INVALID_JSON')
    }
  } else {
    obj = raw
  }
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) {
    throw new MeshResolveError('mesh.v1 must be an object', 'INVALID_DESCRIPTOR')
  }
  const m = obj as Record<string, unknown>
  if (m.v !== 1 && m.v !== '1') {
    throw new MeshResolveError(
      `Unsupported mesh version: ${String(m.v)}`,
      'INVALID_DESCRIPTOR',
    )
  }
  const query = typeof m.query === 'string' ? m.query.replace(/\/$/, '') : ''
  if (!query) {
    throw new MeshResolveError('mesh.v1.query required', 'INVALID_DESCRIPTOR')
  }
  const relays = Array.isArray(m.relays)
    ? m.relays.filter((r): r is string => typeof r === 'string' && !!r)
    : []
  const auth =
    m.auth && typeof m.auth === 'object' && !Array.isArray(m.auth)
      ? {
          planes: Array.isArray((m.auth as { planes?: unknown }).planes)
            ? (
                (m.auth as { planes: unknown[] }).planes.filter(
                  (p) => typeof p === 'string',
                ) as string[]
              )
            : [],
          default:
            typeof (m.auth as { default?: unknown }).default === 'string'
              ? (m.auth as { default: string }).default
              : undefined,
        }
      : undefined

  return {
    v: MESH_DESCRIPTOR_VERSION,
    relays,
    query,
    calendar:
      typeof m.calendar === 'string' && m.calendar ? m.calendar : undefined,
    marketplace: parseMeshMarketplace(m.marketplace),
    auth: auth?.planes.length ? auth : undefined,
    strictRelays: m.strictRelays === true,
    notes: typeof m.notes === 'string' ? m.notes : undefined,
  }
}

function uniqueStrings(xs: string[]): string[] {
  const seen = new Set<string>()
  const out: string[] = []
  for (const x of xs) {
    if (!seen.has(x)) {
      seen.add(x)
      out.push(x)
    }
  }
  return out
}

export function mergeMeshLayers(
  base: MeshDescriptorV1,
  ...layers: Array<Partial<MeshDescriptorV1> | null | undefined>
): MeshDescriptorV1 {
  let out: MeshDescriptorV1 = { ...base, relays: [...base.relays] }
  for (const layer of layers) {
    if (!layer) continue
    const nextRelays = layer.relays?.length
      ? layer.strictRelays
        ? [...layer.relays]
        : uniqueStrings([...out.relays, ...layer.relays])
      : out.relays
    out = {
      v: MESH_DESCRIPTOR_VERSION,
      relays: nextRelays,
      query: layer.query?.replace(/\/$/, '') || out.query,
      calendar: layer.calendar ?? out.calendar,
      marketplace: mergeMeshMarketplace(out.marketplace, layer.marketplace),
      auth: layer.auth ?? out.auth,
      strictRelays: layer.strictRelays ?? out.strictRelays,
      notes: layer.notes ?? out.notes,
    }
  }
  return out
}

function tryParse(raw: string | null | undefined): MeshDescriptorV1 | undefined {
  if (raw == null || raw === '') return undefined
  try {
    return parseMeshDescriptor(raw)
  } catch {
    return undefined
  }
}

export async function resolveMesh(opts: {
  chainId: string
  overrides?: Partial<MeshDescriptorV1>
  chainServices?: ChainMeshServices
  loaders?: MeshResolveLoaders
}): Promise<ResolvedMesh> {
  const services =
    opts.chainServices ??
    (opts.chainId === 'morocco-1' ? { ...TERP_CHAIN_MESH_SERVICES } : {})
  const warnings: string[] = []
  const loaders = opts.loaders

  let chainDefault: MeshDescriptorV1 | undefined
  try {
    if (services.headstashServer) {
      chainDefault = buildDefaultMeshDescriptor(services)
    }
  } catch {
    chainDefault = undefined
  }

  let fromText: MeshDescriptorV1 | undefined
  if (loaders?.getTextRecord) {
    fromText = tryParse(await loaders.getTextRecord(MESH_TEXT_RECORD_KEY))
  }

  let fromModule: MeshDescriptorV1 | undefined
  if (loaders?.getModuleValues) {
    const mod = await loaders.getModuleValues()
    const modMarketplace = parseMeshMarketplace({
      fixedPrice: mod?.marketplaceFixedPrice,
      auction: mod?.marketplaceAuction,
      contentBase: mod?.marketplaceContentBase,
      acceptedDenom: mod?.marketplaceAcceptedDenom,
      minBufferBlocks: mod?.marketplaceMinBufferBlocks,
      modes:
        mod?.marketplaceFixedPrice || mod?.marketplaceAuction
          ? (['fixed', 'auction', 'buy_now'] as MeshMarketplaceMode[])
          : undefined,
    })
    if (mod?.meshJson) fromModule = tryParse(mod.meshJson)
    if (!fromModule && (mod?.calendarContract || modMarketplace) && chainDefault) {
      fromModule = {
        ...chainDefault,
        calendar: mod?.calendarContract ?? chainDefault.calendar,
        marketplace: mergeMeshMarketplace(
          chainDefault.marketplace,
          modMarketplace,
        ),
      }
    } else if (fromModule) {
      if (mod?.calendarContract && !fromModule.calendar) {
        fromModule = { ...fromModule, calendar: mod.calendarContract }
      }
      if (modMarketplace) {
        fromModule = {
          ...fromModule,
          marketplace: mergeMeshMarketplace(
            fromModule.marketplace,
            modMarketplace,
          ),
        }
      }
    }
  }

  let fromDao: MeshDescriptorV1 | undefined
  if (loaders?.getDaoStorageItem) {
    fromDao = tryParse(await loaders.getDaoStorageItem(MESH_STORAGE_KEY))
  }

  type Layer = { mesh: MeshDescriptorV1; source: MeshResolveSource }
  const layers: Layer[] = []
  if (chainDefault) layers.push({ mesh: chainDefault, source: 'chain_default' })
  if (fromText) layers.push({ mesh: fromText, source: 'text_record' })
  if (fromModule) layers.push({ mesh: fromModule, source: 'module' })
  if (fromDao) layers.push({ mesh: fromDao, source: 'dao_storage' })

  if (!layers.length && !opts.overrides?.query) {
    throw new MeshResolveError(
      'No mesh descriptor and chain headstash default missing',
      'NO_MESH',
    )
  }

  let merged = layers.length
    ? layers.slice(1).reduce(
        (acc, L) => mergeMeshLayers(acc, L.mesh),
        layers[0].mesh,
      )
    : buildDefaultMeshDescriptor({
        headstashServer: opts.overrides!.query,
        headstashWss: opts.overrides!.relays?.[0],
      })

  if (chainDefault && !merged.strictRelays) {
    merged = mergeMeshLayers(chainDefault, merged)
  }

  let source: MeshResolveSource = layers.length
    ? layers[layers.length - 1].source
    : 'chain_default'

  if (opts.overrides && Object.keys(opts.overrides).length) {
    merged = mergeMeshLayers(merged, opts.overrides)
    source = 'override'
  }

  if (!merged.relays.length && merged.query) {
    merged = { ...merged, relays: [httpsToWss(merged.query)] }
    warnings.push('relays empty — derived WSS from query')
  }
  if (!merged.calendar) {
    warnings.push('mesh has no calendar address')
  }
  if (
    merged.marketplace &&
    !merged.marketplace.fixedPrice &&
    !merged.marketplace.auction
  ) {
    warnings.push(
      'mesh.marketplace has no fixedPrice or auction contract',
    )
  }

  return { ...merged, source, warnings, chainId: opts.chainId }
}

/** Serialize mesh for DAO storage / text records (includes marketplace). */
export function serializeMeshDescriptor(mesh: MeshDescriptorV1): string {
  return JSON.stringify({
    v: MESH_DESCRIPTOR_VERSION,
    relays: mesh.relays,
    query: mesh.query,
    ...(mesh.calendar ? { calendar: mesh.calendar } : {}),
    ...(mesh.marketplace ? { marketplace: mesh.marketplace } : {}),
    ...(mesh.auth ? { auth: mesh.auth } : {}),
    ...(mesh.strictRelays ? { strictRelays: true } : {}),
    ...(mesh.notes ? { notes: mesh.notes } : {}),
  })
}

export type MeshEventListFilter = {
  from?: string | number
  to?: string | number
  group?: string
  limit?: number
}

/**
 * Create a thin HTTP query-plane client.
 * Paths: GET {query}/api/v1/calendar/events · GET {query}/api/v1/calendar/resolve
 *
 * Throws MeshQueryError on non-OK HTTP so UI can map 5xx → product signal.
 */
export function createMeshQueryClient(
  mesh: ResolvedMesh | MeshDescriptorV1,
  fetchImpl: typeof fetch = fetch,
) {
  const queryBase = mesh.query.replace(/\/$/, '')
  return {
    mesh,
    queryBase,
    async listEvents(filter: MeshEventListFilter = {}) {
      const params = new URLSearchParams()
      if (filter.from != null) params.set('from', String(filter.from))
      if (filter.to != null) params.set('to', String(filter.to))
      if (filter.group) params.set('group', filter.group)
      if (filter.limit != null) params.set('limit', String(filter.limit))
      if ('calendar' in mesh && mesh.calendar) {
        params.set('calendar', mesh.calendar)
      }
      const qs = params.toString()
      const path = `/api/v1/calendar/events${qs ? `?${qs}` : ''}`
      const res = await fetchImpl(`${queryBase}${path}`)
      if (!res.ok) {
        throw new MeshQueryError(
          `mesh query listEvents failed: HTTP ${res.status}`,
          res.status,
          path,
        )
      }
      return res.json()
    },
    async getCalendarAddress() {
      if ('calendar' in mesh && mesh.calendar) return mesh.calendar
      const path = '/api/v1/calendar/resolve'
      const res = await fetchImpl(`${queryBase}${path}`)
      if (!res.ok) {
        if (res.status >= 500) {
          throw new MeshQueryError(
            `mesh query resolve failed: HTTP ${res.status}`,
            res.status,
            path,
          )
        }
        return undefined
      }
      const body = (await res.json()) as { calendar?: string }
      return body.calendar
    },
  }
}
