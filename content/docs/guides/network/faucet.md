---
title: Faucet
description: Fund accounts on public testnet, Docker localterp, or terpd testnet create — HTTP faucet APIs and safety limits
status: complete
---
A **faucet** sends a small amount of test tokens to an address so you can pay fees and exercise txs without mainnet funds. Terp exposes several faucet surfaces depending on environment.

| Environment | How you get tokens | Typical endpoint |
|-------------|--------------------|------------------|
| Public testnet (`90u-4`) | Hosted faucet HTTP GET | `https://faucet.terp.network/90u-4/&lt;address>` |
| Docker `localterp` image | Process on port **5000** | `http://localhost:5000/faucet?address=…` |
| `terpd testnet create --faucet` | Embedded HTTP server (default port **5000**) | `http://localhost:5000/faucet?address=…` |
| Single-node manual localnet | No public faucet — genesis balances + bank send | See [Local network](/docs/guides/network/deploy/local) |
| App REST faucet (`app.toml [faucet]`) | Optional handler on LCD (port **1317**) when enabled | Implementation in `app/testutils/faucet.go` |

Never enable a funded faucet on **mainnet**.

## Public testnet

Chain ID **`90u-4`**, base denom often **`uthiolx`** (confirm with live params). From [Quick start](/docs/overview/quickstart):

```bash
ADDR=$(terpd keys show my-wallet -a)
curl -sS "https://faucet.terp.network/90u-4/${ADDR}"
```

Then query balances against a testnet RPC from [Public endpoints](/docs/resources/public):

```bash
terpd query bank balances "$ADDR" \
  --node <TESTNET_RPC> \
  --chain-id 90u-4
```

Public faucet software reference: [hard-nett/cosmos-faucet](https://github.com/hard-nett/cosmos-faucet). Rate limits and daily caps are enforced server-side; treat failures as expected under load.

## Docker localterp

From [terp-core `docker/README.md`](https://github.com/terpnetwork/terp-core/blob/main/docker/README.md):

```bash
docker buildx build --target localterp -t terpnetwork/terp-core:localterp --load .
docker run --rm -it \
  -p 26657:26657 -p 1317:1317 -p 5000:5000 -p 9090:9090 \
  terpnetwork/terp-core:localterp
```

## Status and fund

```bash
curl -sS localhost:5000/status
## {"faucet_address":"terp1...","amount":"1000000000","denoms":["uterp","uthiol"]}

curl -sS "localhost:5000/faucet?address=terp1youraddr"
## {"txhash":"…"}
```

## Environment variables (image)

| Variable | Default | Description |
|----------|---------|-------------|
| `FAUCET_WALLET_NAME` | `a` | Keyring key that sends |
| `FAUCET_AMOUNT` | `1000000000` | Amount **per denom** per request |
| `DENOMS` | `uterp,uthiol` | Comma-separated denoms |

Pre-funded keys in the image include `validator`, `a` (default faucet source), `b`, `c`, `d` — each with large genesis balances of `uterp` and `uthiol`.

### ict-rs

The Rust interchain harness can use localterp’s faucet via `TestEnv::terp_localterp_config()` and `tc.faucet_fund("terp1…")`. See `terp-rs` / `ict-rs` docs in the monorepo when present.

## `terpd testnet create --faucet`

`terpd testnet create` initializes a single-validator local chain with deterministic test mnemonics and optional embedded faucet (`cmd/terpd/cmd/testnet_create.go`, `cmd/terpd/cmd/faucet.go`).

```bash
terpd testnet create \
  --chain-id zk-testnet-1 \
  --faucet \
  --faucet-port 5000 \
  --faucet-key-name a \
  --faucet-amount 1000000000 \
  --faucet-denoms uterp,uthiol \
  --home $HOME/.terpd-testnet
```

Flags (from CLI help / source):

| Flag | Default | Meaning |
|------|---------|---------|
| `--faucet` | off | Start HTTP faucet beside the node |
| `--faucet-port` | `5000` | Listen port |
| `--faucet-amount` | `1000000000` | Amount per denom per request |
| `--faucet-denoms` | `uterp,uthiol` | Denoms to send |
| `--faucet-key-name` | `a` | Keyring key used as source |
| `--home` | node default | Data directory (must contain the faucet key) |

Endpoints:

```bash
curl -sS localhost:5000/status
curl -sS "localhost:5000/faucet?address=terp1…"
## Browser-friendly HTML also served on / when Accept prefers HTML
```

Deterministic key names include `validator`, `a`, `b`, `c`, `d`, and `faucet`. **These mnemonics are public test vectors** — never reuse them outside disposable localnets.

## App REST faucet (`[faucet]` in app.toml)

`app/testutils/faucet.go` defines an optional LCD-attached faucet (intended for testnets), configured as:

```toml
[faucet]
enable = false
key-name = "faucet"
amount = 10000000
denom = "uthiol"
gas-price = "0.025uthiol"
gas = 200000
cooldown-seconds = 86400
```

Behavior when enabled:

- Accepts address via `?address=terp1…` or JSON body `{"address":"…"}`
- Sends `amount` of `denom` from the keyring key `key-name`
- Per-address cooldown (`cooldown-seconds`, default 24h)
- JSON responses: `tx_hash`, `amount`, or `error`

Default **`enable = false`**. Only turn on for isolated test infrastructure with a dedicated funded key.

## Localnet without faucet

The [single-node local guide](/docs/guides/network/deploy/local) funds via genesis `add-genesis-account` and `bank send`. That is enough for most contract work. Prefer Docker localterp or `testnet create --faucet` when many ephemeral addresses need funding.

## Verify

| Check | Command |
|-------|---------|
| Public faucet responds | `curl -sS -o /dev/null -w '%{http_code}\n' https://faucet.terp.network/90u-4/&lt;addr>` |
| Local status | `curl -sS localhost:5000/status \| jq .` |
| Balance after drip | `terpd query bank balances &lt;addr> --node …` |
| Tx landed | `terpd query tx &lt;hash> --node …` |

## Related concepts

- [Quick start](/docs/overview/quickstart) — first keys + testnet fund
- [Local network](/docs/guides/network/deploy/local) — genesis-funded single node
- [Tokens](/docs/overview/concepts/tokens) — denoms
- [Public endpoints](/docs/resources/public)

## Further reading

- [terp-core docker/README.md](https://github.com/terpnetwork/terp-core/blob/main/docker/README.md)
- Source: `cmd/terpd/cmd/faucet.go`, `cmd/terpd/cmd/testnet_create.go`, `app/testutils/faucet.go`
- [MessageFilter authenticator](/docs/guides/authentication/authenticators/message-filter) — patterns for permissioned utility senders (not a public faucet)
