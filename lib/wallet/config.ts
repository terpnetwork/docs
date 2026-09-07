// ─── Environment-aware chain configuration ──────────────────────
// When NEXT_PUBLIC_CHAIN_ENV=local, use local devnet endpoints.
// Contract addresses can be overridden via NEXT_PUBLIC_* env vars.

const isLocal = process.env.NEXT_PUBLIC_CHAIN_ENV === 'local';

const MAINNET_CONFIG = {
  chainId: 'morocco-1',
  chainName: 'Terp Network',
  rpc: 'https://rpc.terp.network',
  rest: 'https://api.terp.network',
  bech32Prefix: 'terp',
  denom: 'uthiol',
  denomDisplay: 'THIOL',
  denomDecimals: 6,
  stakeDenom: 'uterp',
} as const;

const LOCAL_CONFIG = {
  chainId: '120u-1' as const,
  chainName: 'Local Terp' as const,
  rpc: 'http://localhost:3000/rpc' as const,
  rest: 'http://localhost:1317' as const,
  bech32Prefix: 'terp' as const,
  denom: 'uthiol' as const,
  denomDisplay: 'THIOL' as const,
  denomDecimals: 6 as const,
  stakeDenom: 'uterp' as const,
};

export const CHAIN_CONFIG = isLocal ? LOCAL_CONFIG : MAINNET_CONFIG;

/** Contract addresses — env-var overrides for local testing. */
export const CONTRACTS = {
  terp721Account:
    process.env.NEXT_PUBLIC_TERP721_ACCOUNT ||
    'terp142kvnl56hs7jacmwysswlhp4f4eyt7ljclcy9ak7v3cgg3ldhzzs6ye4vu',
  calendar:
    process.env.NEXT_PUBLIC_CALENDAR || '', // resolved at runtime via billboard text records
  infuser:
    process.env.NEXT_PUBLIC_INFUSER || '', // resolved at runtime via billboard text records
};

/**
 * Billboard account name whose text records hold DAO/subdao addresses.
 * The "subdao" text record points to the DAO that instantiated the calendar.
 */
export const BILLBOARD_ACCOUNT = 'terp' as const;

export const COSMES_CHAIN_INFO = [
  {
    chainId: CHAIN_CONFIG.chainId,
    rpc: CHAIN_CONFIG.rpc,
    gasPrice: { amount: '0.025', denom: CHAIN_CONFIG.denom },
  },
] as const;

/** Keplr experimentalSuggestChain payload. */
export const CHAIN_SUGGEST = {
  chainId: CHAIN_CONFIG.chainId,
  chainName: CHAIN_CONFIG.chainName,
  rpc: CHAIN_CONFIG.rpc,
  rest: CHAIN_CONFIG.rest,
  bip44: { coinType: 118 },
  bech32Config: {
    bech32PrefixAccAddr: 'terp',
    bech32PrefixAccPub: 'terppub',
    bech32PrefixValAddr: 'terpvaloper',
    bech32PrefixValPub: 'terpvaloperpub',
    bech32PrefixConsAddr: 'terpvalcons',
    bech32PrefixConsPub: 'terpvalconspub',
  },
  currencies: [
    { coinDenom: 'TERP', coinMinimalDenom: 'uterp', coinDecimals: 6 },
    { coinDenom: 'THIOL', coinMinimalDenom: 'uthiol', coinDecimals: 6 },
  ],
  feeCurrencies: [
    {
      coinDenom: 'THIOL',
      coinMinimalDenom: 'uthiol',
      coinDecimals: 6,
      gasPriceStep: { low: 0.01, average: 0.025, high: 0.04 },
    },
  ],
  stakeCurrency: {
    coinDenom: 'TERP',
    coinMinimalDenom: 'uterp',
    coinDecimals: 6,
  },
} as const;
