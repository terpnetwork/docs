import type { LucideIcon } from 'lucide-react';
import {
  BookOpen,
  Boxes,
  Code2,
  Cpu,
  FileCode2,
  GitBranch,
  KeyRound,
  Layers,
  Link2,
  Network,
  Package,
  Server,
  Sigma,
  Terminal,
  Workflow,
} from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

/**
 * Brand-tuned icon chip — monochrome Lucide on fd-primary wash.
 * Prefer this over multi-color Illustrator / Osmosis-era SVG assets.
 */
export function ThemedIcon({
  icon: Icon,
  className,
  size = 18,
}: {
  icon: LucideIcon;
  className?: string;
  size?: number;
}) {
  return (
    <span
      className={cn(
        'docs-themed-icon inline-flex shrink-0 items-center justify-center rounded-md',
        'bg-fd-primary/12 text-fd-primary',
        'ring-1 ring-fd-primary/15',
        className,
      )}
      style={{ width: size + 14, height: size + 14 }}
      aria-hidden
    >
      <Icon width={size} height={size} strokeWidth={1.75} />
    </span>
  );
}

/** Map common legacy svgFile paths / names → Lucide */
const SVG_FILE_MAP: Record<string, LucideIcon> = {
  '/icons/api.svg': Code2,
  '/icons/cli.svg': Terminal,
  '/icons/go.svg': FileCode2,
  '/icons/go_osmo.svg': FileCode2,
  '/icons/grpc.svg': Network,
  '/icons/cosmwasm.svg': Boxes,
  '/icons/modules.svg': Layers,
  '/icons/relayer.svg': GitBranch,
  '/icons/registry.svg': Package,
  '/icons/telescope.svg': Workflow,
  '/icons/buf.svg': FileCode2,
  '/icons/beaker.svg': Cpu,
  '/icons/math.svg': Sigma,
  api: Code2,
  cli: Terminal,
  grpc: Network,
  cosmwasm: Boxes,
  modules: Layers,
  relayer: GitBranch,
};

export function iconFromSvgFile(svgFile?: string): LucideIcon | null {
  if (!svgFile) return null;
  if (SVG_FILE_MAP[svgFile]) return SVG_FILE_MAP[svgFile];
  const base = svgFile.split('/').pop()?.replace(/\.svg$/i, '') ?? '';
  return SVG_FILE_MAP[base] ?? SVG_FILE_MAP[`/icons/${base}.svg`] ?? null;
}

export function resolveCardIcon(opts: {
  icon?: ReactNode;
  svgFile?: string;
}): ReactNode {
  if (opts.icon) {
    // Already a React node — if it's a bare multi-color SVG, wrap in host
    return <span className="docs-themed-icon-legacy">{opts.icon}</span>;
  }
  const Lucide = iconFromSvgFile(opts.svgFile);
  if (Lucide) return <ThemedIcon icon={Lucide} />;
  if (opts.svgFile) {
    // Unknown asset: still host it monochrome via CSS
    return (
      <span className="docs-themed-icon docs-themed-icon-legacy">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={opts.svgFile} alt="" aria-hidden />
      </span>
    );
  }
  return undefined;
}

/** Semantic presets for docs cards */
export const DocsIcons = {
  terminal: Terminal,
  chain: Link2,
  modules: Layers,
  network: Network,
  keys: KeyRound,
  wasm: Boxes,
  ide: Code2,
  package: Package,
  server: Server,
  book: BookOpen,
  relayer: GitBranch,
  cpu: Cpu,
} as const;
