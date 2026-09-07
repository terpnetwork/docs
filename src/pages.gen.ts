// deno-fmt-ignore-file
// biome-ignore format: generated types do not need formatting
// prettier-ignore
import type { PathsForPages } from 'waku/router'

// prettier-ignore
type Page =
  | { path: '/_slots'; render: 'static' }
  | { path: '/api/cli'; render: 'static' }
  | { path: '/api/data'; render: 'static' }
  | { path: '/api/endpoints'; render: 'static' }
  | { path: '/api/grpc'; render: 'static' }
  | { path: '/api/ibcgo'; render: 'static' }
  | { path: '/api'; render: 'static' }
  | { path: '/api/lcd'; render: 'static' }
  | { path: '/api/openapi'; render: 'static' }
  | { path: '/api/rpc'; render: 'static' }
  | { path: '/connect/community/daos'; render: 'static' }
  | { path: '/connect/community'; render: 'static' }
  | { path: '/connect/community/meetings'; render: 'static' }
  | { path: '/connect/community/network'; render: 'static' }
  | { path: '/connect/community/proposals'; render: 'static' }
  | { path: '/connect/community/voting'; render: 'static' }
  | { path: '/connect/cross-chain'; render: 'static' }
  | { path: '/connect'; render: 'static' }
  | { path: '/connect/network'; render: 'static' }
  | { path: '/guides/nodes/archive'; render: 'static' }
  | { path: '/guides/nodes/bootstrap'; render: 'static' }
  | { path: '/guides/nodes/configure'; render: 'static' }
  | { path: '/guides/nodes/cosmovisor'; render: 'static' }
  | { path: '/guides/nodes/faq'; render: 'static' }
  | { path: '/guides/nodes/faucet'; render: 'static' }
  | { path: '/guides/nodes/genesis'; render: 'static' }
  | { path: '/guides/nodes/install'; render: 'static' }
  | { path: '/guides/nodes/keys'; render: 'static' }
  | { path: '/guides/nodes/local'; render: 'static' }
  | { path: '/guides/nodes/nginx'; render: 'static' }
  | { path: '/guides/nodes/prepare-node'; render: 'static' }
  | { path: '/guides/nodes/prerequisites'; render: 'static' }
  | { path: '/guides/nodes/snapshots'; render: 'static' }
  | { path: '/guides/nodes/state-sync'; render: 'static' }
  | { path: '/guides/nodes/systemd'; render: 'static' }
  | { path: '/guides/nodes/threshold-signing'; render: 'static' }
  | { path: '/guides/validators/chain-upgrades'; render: 'static' }
  | { path: '/guides/validators/frost-privval'; render: 'static' }
  | { path: '/guides/validators'; render: 'static' }
  | { path: '/guides/validators/migration'; render: 'static' }
  | { path: '/guides/validators/monitoring'; render: 'static' }
  | { path: '/guides/validators/overview'; render: 'static' }
  | { path: '/guides/validators/requirements'; render: 'static' }
  | { path: '/guides/validators/sentry'; render: 'static' }
  | { path: '/guides/validators/setup'; render: 'static' }
  | { path: '/guides/validators/troubleshooting'; render: 'static' }
  | { path: '/guides/validators/upgrades-history'; render: 'static' }
  | { path: '/guides'; render: 'static' }
  | { path: '/'; render: 'static' }
  | { path: '/overview/concepts/consensus'; render: 'static' }
  | { path: '/overview/concepts/crypto'; render: 'static' }
  | { path: '/overview/concepts/decentralization'; render: 'static' }
  | { path: '/overview/concepts/genesis'; render: 'static' }
  | { path: '/overview/concepts/governance'; render: 'static' }
  | { path: '/overview/concepts/hardware'; render: 'static' }
  | { path: '/overview/concepts/ibc'; render: 'static' }
  | { path: '/overview/concepts'; render: 'static' }
  | { path: '/overview/concepts/light-clients'; render: 'static' }
  | { path: '/overview/concepts/llm-and-ml'; render: 'static' }
  | { path: '/overview/concepts/markets'; render: 'static' }
  | { path: '/overview/concepts/networks'; render: 'static' }
  | { path: '/overview/concepts/p2p'; render: 'static' }
  | { path: '/overview/concepts/permissionless'; render: 'static' }
  | { path: '/overview/concepts/privacy/disclosure'; render: 'static' }
  | { path: '/overview/concepts/privacy'; render: 'static' }
  | { path: '/overview/concepts/software'; render: 'static' }
  | { path: '/overview/concepts/tax'; render: 'static' }
  | { path: '/overview/concepts/tokens'; render: 'static' }
  | { path: '/overview/concepts/trustless'; render: 'static' }
  | { path: '/overview'; render: 'static' }
  | { path: '/overview/products'; render: 'static' }
  | { path: '/overview/quickstart'; render: 'static' }
  | { path: '/research/for-engineers'; render: 'static' }
  | { path: '/research/for-operators'; render: 'static' }
  | { path: '/research/for-researchers'; render: 'static' }
  | { path: '/research/glossary'; render: 'static' }
  | { path: '/research'; render: 'static' }
  | { path: '/research/private-bridge/for-engineers'; render: 'static' }
  | { path: '/research/private-bridge/for-users'; render: 'static' }
  | { path: '/research/private-bridge/glossary'; render: 'static' }
  | { path: '/research/private-bridge/honesty'; render: 'static' }
  | { path: '/research/private-bridge/how-it-works'; render: 'static' }
  | { path: '/research/private-bridge'; render: 'static' }
  | { path: '/research/private-dex/for-engineers'; render: 'static' }
  | { path: '/research/private-dex/for-users'; render: 'static' }
  | { path: '/research/private-dex/glossary'; render: 'static' }
  | { path: '/research/private-dex/honesty'; render: 'static' }
  | { path: '/research/private-dex/how-it-works'; render: 'static' }
  | { path: '/research/private-dex'; render: 'static' }
  | { path: '/research/protocol/bitfield'; render: 'static' }
  | { path: '/research/protocol/fold'; render: 'static' }
  | { path: '/research/protocol/lnpr'; render: 'static' }
  | { path: '/research/protocol/membership'; render: 'static' }
  | { path: '/research/protocol/ssle'; render: 'static' }
  | { path: '/research/re-zerve/for-engineers'; render: 'static' }
  | { path: '/research/re-zerve/for-providers'; render: 'static' }
  | { path: '/research/re-zerve/for-tenants'; render: 'static' }
  | { path: '/research/re-zerve/how-it-works'; render: 'static' }
  | { path: '/research/re-zerve'; render: 'static' }
  | { path: '/research/re-zerve/sources'; render: 'static' }
  | { path: '/research/re-zerve/status'; render: 'static' }
  | { path: '/research/resources'; render: 'static' }
  | { path: '/research/status'; render: 'static' }
  | { path: '/research/timeline'; render: 'static' }
  | { path: '/research/verify'; render: 'static' }
  | { path: '/resources/adrs/adr/1'; render: 'static' }
  | { path: '/resources/adrs'; render: 'static' }
  | { path: '/resources/community'; render: 'static' }
  | { path: '/resources/contribution'; render: 'static' }
  | { path: '/resources/contribution/scaffolds'; render: 'static' }
  | { path: '/resources/faq'; render: 'static' }
  | { path: '/resources'; render: 'static' }
  | { path: '/resources/integrity'; render: 'static' }
  | { path: '/resources/libraries'; render: 'static' }
  | { path: '/resources/network'; render: 'static' }
  | { path: '/resources/public'; render: 'static' }
  | { path: '/resources/state-json'; render: 'static' }

// prettier-ignore
declare module 'waku/router' {
  interface RouteConfig {
    paths: PathsForPages<Page>
  }
  interface CreatePagesConfig {
    pages: Page
  }
}
