'use client';

import { useEffect, useState } from 'react';
import { Archive, ExternalLink, RefreshCw } from 'lucide-react';

export type NetworkKind = 'mainnet' | 'testnet';

const NETWORKS: Record<
  NetworkKind,
  { chainId: string; baseUrl: string; label: string }
> = {
  mainnet: {
    chainId: 'morocco-1',
    baseUrl: 'https://s3.terp.network/snapshots/mainnet/morocco-1',
    label: 'Mainnet',
  },
  testnet: {
    chainId: '120u-1',
    baseUrl: 'https://s3.terp.network/snapshots/testnet/120u-1',
    label: 'Testnet',
  },
};

export interface SnapshotFull {
  chain_id?: string;
  network_type?: string;
  latest?: string;
  url?: string;
  filename?: string;
  block_height?: string | number;
  created_at?: string;
  size_mb?: number;
  type?: string;
  compression?: string;
  pruning?: string;
  source?: string;
  note?: string;
}

interface PrunedManifest {
  chain_id?: string;
  snapshots?: string[];
  latest?: string;
}

function parseFilename(url: string): { filename: string; height: string; created: string } {
  const filename = url.split('/').pop() ?? url;
  // {chain}_{height}_{UTC}Z.tar.lz4 — chain ids contain dashes, never underscores.
  // Timestamp looks like 2026-09-02T03-49-50Z; restore colons for Date parsing.
  const m = filename.match(/^(.+)_(\d+)_(.+?)(?:\.tar\.(?:lz4|zst|gz)|\.tar)$/);
  const rawTs = m?.[3] ?? '';
  const created = rawTs.replace(/T(\d\d)-(\d\d)-(\d\d)Z$/, 'T$1:$2:$3Z');
  return {
    filename,
    height: m?.[2] ?? '—',
    created: /^\d{4}-\d\d-\d\dT/.test(created) ? created : '',
  };
}

async function loadManifest(cfg: (typeof NETWORKS)[NetworkKind]): Promise<SnapshotFull> {
  // Live catalog first: pruned/snapshot.json is {chain_id, snapshots, latest}.
  // Fall back to the legacy snapshot_full.json shape.
  try {
    const res = await fetch(`${cfg.baseUrl}/pruned/snapshot.json`, { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const manifest = (await res.json()) as PrunedManifest;
    if (!manifest.latest) throw new Error('empty manifest');
    const parsed = parseFilename(manifest.latest);
    return {
      chain_id: manifest.chain_id ?? cfg.chainId,
      latest: manifest.latest,
      filename: parsed.filename,
      block_height: parsed.height,
      created_at: parsed.created,
      type: 'snapshot',
      compression: 'lz4',
      pruning: 'pruned',
      source: 'live catalog',
    };
  } catch {
    const res = await fetch(`${cfg.baseUrl}/snapshot_full.json`, { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return (await res.json()) as Promise<SnapshotFull>;
  }
}

function formatBytes(mb?: number) {
  if (mb == null || Number.isNaN(mb)) return '—';
  if (mb >= 1024) return `${(mb / 1024).toFixed(1)} GB`;
  return `${mb} MB`;
}

// NOTE: this site only compiles `vocs:`-prefixed utilities (see vocs theme
// CSS). Plain tailwind classes and `fd-*` vars do not exist here, so colors
// below use vocs CSS vars via utilities where available, else inline styles.
const labelCls = 'vocs:text-xs vocs:text-muted';
const valueCls = 'vocs:text-sm';

export function SnapshotPanel({
  network = 'mainnet',
}: {
  network?: NetworkKind;
}) {
  const cfg = NETWORKS[network];
  const [data, setData] = useState<SnapshotFull | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    setError(null);
    loadManifest(cfg)
      .then(setData)
      .catch((e: unknown) =>
        setError(e instanceof Error ? e.message : 'Failed to load snapshot'),
      )
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [network]);

  const downloadUrl = data?.url ?? data?.latest;

  return (
    <div
      className="vocs:rounded-xl vocs:border vocs:border-primary vocs:bg-surface vocs:p-5"
      style={{ marginTop: '1.5rem', marginBottom: '1.5rem' }}
    >
      <div className="vocs:mb-4 vocs:flex vocs:flex-wrap vocs:items-center vocs:justify-between vocs:gap-3">
        <div className="vocs:flex vocs:items-center vocs:gap-2">
          <Archive className="vocs:size-5 vocs:text-accent" aria-hidden />
          <div>
            <p className="vocs:text-sm vocs:font-semibold">
              {cfg.label} snapshot
            </p>
            <p className="vocs:font-mono vocs:text-xs vocs:text-muted">
              {cfg.chainId}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={load}
          className="vocs:inline-flex vocs:cursor-pointer vocs:items-center vocs:gap-2 vocs:rounded-md vocs:border vocs:border-primary vocs:px-2 vocs:py-1 vocs:text-xs vocs:font-medium vocs:text-muted"
        >
          <RefreshCw className={`vocs:size-4 ${loading ? 'vocs:animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {loading && !data && (
        <div className="vocs:animate-pulse vocs:rounded-lg vocs:bg-primary" style={{ height: '6rem' }} />
      )}

      {error && (
        <p className="vocs:text-sm" style={{ color: 'var(--vocs-color-destructive)' }}>
          Could not load live snapshot metadata ({error}). Use the static S3
          URL below.
        </p>
      )}

      {data && (
        <dl
          className="vocs:grid vocs:gap-3"
          style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))' }}
        >
          <div>
            <dt className={labelCls}>Block height</dt>
            <dd className={`vocs:font-mono ${valueCls}`}>{data.block_height ?? '—'}</dd>
          </div>
          <div>
            <dt className={labelCls}>Size</dt>
            <dd className={valueCls}>{formatBytes(data.size_mb)}</dd>
          </div>
          <div>
            <dt className={labelCls}>Created</dt>
            <dd className={valueCls}>
              {data.created_at && !Number.isNaN(Date.parse(data.created_at))
                ? new Date(data.created_at).toUTCString()
                : (data.created_at || '—')}
            </dd>
          </div>
          <div>
            <dt className={labelCls}>Type / pruning</dt>
            <dd className={valueCls}>
              {[data.type, data.compression, data.pruning]
                .filter(Boolean)
                .join(' · ') || '—'}
            </dd>
          </div>
          {data.filename && (
            <div style={{ gridColumn: '1 / -1' }}>
              <dt className={labelCls}>Filename</dt>
              <dd className={`vocs:font-mono vocs:text-xs ${valueCls}`} style={{ wordBreak: 'break-all' }}>{data.filename}</dd>
            </div>
          )}
          {data.note && (
            <div style={{ gridColumn: '1 / -1' }}>
              <dt className={labelCls}>Note</dt>
              <dd className={`vocs:text-muted ${valueCls}`}>{data.note}</dd>
            </div>
          )}
        </dl>
      )}

      <div className="vocs:flex vocs:flex-wrap vocs:gap-2" style={{ marginTop: '1rem' }}>
        {downloadUrl && (
          <a
            href={downloadUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="vocs:inline-flex vocs:items-center vocs:gap-2 vocs:rounded-lg vocs:bg-accent vocs:px-3 vocs:py-2 vocs:text-xs vocs:font-medium"
            style={{ color: 'light-dark(#fff, #06130c)', textDecoration: 'none' }}
          >
            Download snapshot
            <ExternalLink className="vocs:size-4" />
          </a>
        )}
        <a
          href={`${cfg.baseUrl}/pruned/snapshot.json`}
          target="_blank"
          rel="noopener noreferrer"
          className="vocs:inline-flex vocs:items-center vocs:gap-2 vocs:rounded-lg vocs:border vocs:border-primary vocs:px-3 vocs:py-2 vocs:text-xs vocs:font-medium"
          style={{ textDecoration: 'none' }}
        >
          snapshot.json
          <ExternalLink className="vocs:size-4" />
        </a>
        <a
          href={`${cfg.baseUrl}/chain.json`}
          target="_blank"
          rel="noopener noreferrer"
          className="vocs:inline-flex vocs:items-center vocs:gap-2 vocs:rounded-lg vocs:border vocs:border-primary vocs:px-3 vocs:py-2 vocs:text-xs vocs:font-medium"
          style={{ textDecoration: 'none' }}
        >
          chain.json
          <ExternalLink className="vocs:size-4" />
        </a>
      </div>
    </div>
  );
}

export function SnapshotPanels() {
  const [network, setNetwork] = useState<NetworkKind>('mainnet');

  return (
    <div className="vocs:space-y-3" style={{ marginTop: '1.5rem', marginBottom: '1.5rem' }}>
      <div className="vocs:flex vocs:gap-2">
        {(['mainnet', 'testnet'] as const).map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => setNetwork(n)}
            className={
              network === n
                ? 'vocs:cursor-pointer vocs:rounded-md vocs:bg-accent vocs:px-3 vocs:py-1 vocs:text-xs vocs:font-medium'
                : 'vocs:cursor-pointer vocs:rounded-md vocs:border vocs:border-primary vocs:px-3 vocs:py-1 vocs:text-xs vocs:font-medium vocs:text-muted'
            }
            style={network === n ? { color: 'light-dark(#fff, #06130c)' } : undefined}
          >
            {n === 'mainnet' ? 'Mainnet' : 'Testnet'}
          </button>
        ))}
      </div>
      <SnapshotPanel network={network} />
    </div>
  );
}
