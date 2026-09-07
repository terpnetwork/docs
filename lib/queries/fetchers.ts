import { CHAIN_CONFIG, CONTRACTS } from '@/lib/wallet/config';

const REST_BASE = CHAIN_CONFIG.rest;
const RPC_BASE = CHAIN_CONFIG.rpc;

export async function queryREST<T>(path: string): Promise<T> {
  const res = await fetch(`${REST_BASE}${path}`);
  if (!res.ok) throw new Error(`REST ${res.status}: ${path}`);
  return res.json() as Promise<T>;
}

export async function queryRPC<T>(
  method: string,
  params?: Record<string, string>,
): Promise<T> {
  const url = new URL(RPC_BASE);
  url.pathname = method;
  if (params) {
    for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  }
  const res = await fetch(url);
  if (!res.ok) throw new Error(`RPC ${res.status}: ${method}`);
  const json = await res.json();
  return json.result as T;
}

export async function queryWithFallback<T>(
  restPath: string,
  rpcFallback?: () => Promise<T>,
): Promise<T> {
  try {
    return await queryREST<T>(restPath);
  } catch (err) {
    if (rpcFallback) return rpcFallback();
    throw err;
  }
}

/** Query a CosmWasm smart contract via REST LCD. */
export async function queryContractSmart<T>(
  contractAddr: string,
  queryMsg: Record<string, unknown>,
): Promise<T> {
  const queryB64 = btoa(JSON.stringify(queryMsg));
  const res = await fetch(
    `${REST_BASE}/cosmwasm/wasm/v1/contract/${contractAddr}/smart/${queryB64}`,
  );
  if (!res.ok) throw new Error(`Contract query ${res.status}`);
  const json = await res.json();
  return json.data as T;
}

/**
 * Indexer-first, contract-fallback for calendar queries.
 * Contract address is resolved at runtime via resolve-calendar.ts.
 */
export async function queryCalendar<T>(
  contractAddress: string,
  queryMsg: Record<string, unknown>,
  indexerPath?: string,
): Promise<T> {
  if (indexerPath) {
    try { return await queryREST<T>(indexerPath); } catch { /* fall through */ }
  }
  return queryContractSmart<T>(contractAddress, queryMsg);
}
