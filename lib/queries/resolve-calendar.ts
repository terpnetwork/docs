import { CHAIN_CONFIG, CONTRACTS, BILLBOARD_ACCOUNT } from '@/lib/wallet/config';
import {
  MESH_TEXT_RECORD_KEY,
  TERP_CHAIN_MESH_SERVICES,
  resolveMesh,
  type ResolvedMesh,
} from '@/lib/mesh';
import { queryREST, queryContractSmart } from './fetchers';

const REST_BASE = CHAIN_CONFIG.rest;

// ── Client-side cache (sessionStorage) ────────────────────────────────
// Avoids expensive fallback chain queries on every page navigation.
// The calendar contract address almost never changes after deployment.

const CACHE_KEY = 'dao-calendar-address';
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

interface CacheEntry {
  address: string;
  expiresAt: number;
}

function getCachedAddress(account: string): string | null {
  try {
    const raw = sessionStorage.getItem(`${CACHE_KEY}:${account}`);
    if (!raw) return null;
    const entry: CacheEntry = JSON.parse(raw);
    if (Date.now() > entry.expiresAt) {
      sessionStorage.removeItem(`${CACHE_KEY}:${account}`);
      return null;
    }
    return entry.address;
  } catch {
    return null;
  }
}

function setCachedAddress(account: string, address: string): void {
  try {
    const entry: CacheEntry = { address, expiresAt: Date.now() + CACHE_TTL };
    sessionStorage.setItem(`${CACHE_KEY}:${account}`, JSON.stringify(entry));
  } catch {
    // sessionStorage full or unavailable — silently skip cache
  }
}

interface TextRecord {
  account: string;
  value: string;
}

interface ContractsByCreatorResponse {
  contract_addresses: string[];
  pagination: { next_key: string | null; total: string };
}

/**
 * Resolve mesh for Connect (public read path).
 *
 * Order: env calendar override → mesh.v1 text record → chain headstash defaults
 * → legacy billboard/subdao probe for calendar only.
 */
export async function resolveDaoMesh(
  account: string = BILLBOARD_ACCOUNT,
): Promise<ResolvedMesh> {
  const records = await loadTextRecords(account).catch(() => [] as TextRecord[]);

  const mesh = await resolveMesh({
    chainId: CHAIN_CONFIG.chainId,
    chainServices: { ...TERP_CHAIN_MESH_SERVICES },
    overrides: CONTRACTS.calendar
      ? { calendar: CONTRACTS.calendar }
      : undefined,
    loaders: {
      getTextRecord: async (key) => {
        const hit = records.find((r) => r.account === key);
        return hit?.value;
      },
    },
  });

  // If mesh has no calendar, try legacy discovery and re-resolve with override
  if (!mesh.calendar) {
    try {
      const legacy = await resolveCalendarAddressLegacy(account, records);
      return {
        ...mesh,
        calendar: legacy,
        warnings: [
          ...mesh.warnings.filter((w) => !w.includes('calendar')),
          'calendar filled via legacy billboard/subdao probe',
        ],
      };
    } catch {
      return mesh;
    }
  }

  return mesh;
}

/**
 * Resolve the calendar contract address.
 *
 * Prefers mesh.v1 (text record + chain headstash defaults), then:
 * 1. Static CONTRACTS.calendar
 * 2. Indexer: GET /indexer/dao-calendar/resolve/{account}
 * 3. Legacy billboard subdao → contracts-by-creator probe
 */
export async function resolveCalendarAddress(
  account: string = BILLBOARD_ACCOUNT,
): Promise<string> {
  // Static override — if calendar address is set in config, use it directly
  if (CONTRACTS.calendar) return CONTRACTS.calendar;

  // Client-side cache hit — avoids expensive chain fallback
  const cached = getCachedAddress(account);
  if (cached) return cached;

  // Mesh path (mesh.v1 text record or chain defaults + legacy probe)
  try {
    const mesh = await resolveDaoMesh(account);
    if (mesh.calendar) {
      setCachedAddress(account, mesh.calendar);
      return mesh.calendar;
    }
  } catch {
    // fall through
  }

  // Indexer route
  try {
    const result = await queryREST<{ calendar: string }>(
      `/indexer/dao-calendar/resolve/${encodeURIComponent(account)}`,
    );
    if (result.calendar) {
      setCachedAddress(account, result.calendar);
      return result.calendar;
    }
  } catch {
    // Indexer not available — fall through
  }

  const address = await resolveFromChain(account);
  setCachedAddress(account, address);
  return address;
}

async function loadTextRecords(account: string): Promise<TextRecord[]> {
  return queryContractSmart<TextRecord[]>(CONTRACTS.terp721Account, {
    text_records: { account },
  });
}

async function resolveCalendarAddressLegacy(
  account: string,
  records?: TextRecord[],
): Promise<string> {
  const recs = records ?? (await loadTextRecords(account));
  return resolveFromChainWithRecords(recs);
}

/**
 * Manual chain resolution:
 * billboard text records → subdao address → contracts-by-creator → verify calendar
 */
async function resolveFromChain(account: string): Promise<string> {
  const records = await loadTextRecords(account);
  return resolveFromChainWithRecords(records);
}

async function resolveFromChainWithRecords(
  records: TextRecord[],
): Promise<string> {
  const subdaoRecord = records.find((r) => r.account === 'subdao');
  if (!subdaoRecord?.value) {
    throw new Error('No "subdao" text record found for account');
  }
  const daoAddr = subdaoRecord.value;

  const res = await fetch(
    `${REST_BASE}/cosmwasm/wasm/v1/contracts/creator/${daoAddr}`,
  );
  if (!res.ok) {
    throw new Error(`Failed to query contracts by creator: ${res.status}`);
  }
  const data: ContractsByCreatorResponse = await res.json();
  const candidates = data.contract_addresses;

  if (!candidates.length) {
    throw new Error(`No contracts found instantiated by DAO ${daoAddr}`);
  }

  for (const addr of candidates) {
    try {
      const dao = await queryContractSmart<string>(addr, { dao: {} });
      if (dao === daoAddr) return addr;
    } catch {
      // Not a calendar contract — continue
    }
  }

  throw new Error(
    `Could not find calendar contract among ${candidates.length} contracts from DAO ${daoAddr}`,
  );
}
