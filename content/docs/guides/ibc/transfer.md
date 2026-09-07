---
title: IBC Transfers
description: Send ICS-20 token transfers on Terp Network and link to wasm memo hooks for contract execution on receive
status: complete
---
import { Callout } from '#vocs-compat';

Move tokens between Terp Network and a counterparty chain over an open ICS-20 channel.

## Prerequisites

- Open transfer channel (`transfer` port, `channel-N`)
- Funded account on the source chain
- Correct **receiver** bech32 for the **destination** chain
- Relayer path for that channel (or a public relayer set)

Validate paths first: [IBC workflows](/docs/guides/ibc/info).

## Cross-chain transfer (CLI)

```bash
terpd tx ibc-transfer transfer \
  transfer \
  channel-0 \
  <destination-receiver-addr> \
  1000000uthiol \
  --from <key> \
  --chain-id morocco-1 \
  --gas auto --gas-adjustment 1.3 \
  -y
```

Replace:

| Placeholder | Meaning |
|-------------|---------|
| `channel-0` | Your **source** channel id toward the counterparty |
| `destination-receiver-addr` | Address on the **other** chain (not necessarily `terp1` if counterparty uses another prefix) |
| `1000000uthiol` | Amount + source base denom |

Query packet / denom state after relay:

```bash
terpd query ibc-transfer denom-traces --node <RPC> -o json | jq '.denom_traces[:5]'
terpd query bank balances <addr> --node <RPC>
```

## Multi-chain and contract execution

Plain ICS-20 only credits a receiver. To **execute a CosmWasm contract on receive**, use a wasm memo via [IBC Hooks](/docs/guides/ibc/hooks).

```bash
## See full guide for memo shape, derived sender, and verify steps
## MEMO='{"wasm":{"contract":"terp1…","msg":{…}}}'
terpd tx ibc-transfer transfer transfer channel-0 <contract-or-receiver> <amount> \
  --memo "$MEMO" \
  --from <key> -y
```

Packet-forward middleware can sit outside hooks on Terp’s transfer stack; multi-hop memos must follow the packet-forward version Terp pins.

## Verify

| Check | How |
|-------|-----|
| Channel open | `terpd query ibc channel end transfer channel-N` |
| Packet acked | Relayer logs / `query tx` on send + counterparty recv |
| Balance | Destination bank balance or IBC denom trace |

## Related concepts

- [IBC Hooks](/docs/guides/ibc/hooks)
- [IBC workflows](/docs/guides/ibc/info)
- [Relay](/docs/guides/ibc/relay/relay)
- [Self-relay](/docs/guides/ibc/self-relay)

## Further reading

- [Expired client recovery](/docs/guides/ibc/expired-client)
- [Wasm light client](/docs/guides/ibc/wasm-light-client)
- [IBC info checksums (trustlessness)](/docs/guides/trustlessness/ibc-info)
