---
title: Faucet
description: Fund addresses on public testnet 120u-1 and on local chains — real URLs and denoms
---

# Faucet

A faucet sends a small amount of **test** tokens so you can pay fees. There is no mainnet faucet.

## Public testnet (`120u-1`)

The hosted faucet is an HTTP service in front of a funded key on **`120u-1`**. It is **not** path-scoped by chain id.

| | |
|--|--|
| Base | `https://testnet-faucet.terp.network` |
| Alias used by terp.network UI | `https://faucet.terp.network` |
| Status | `GET /status` |
| Drip | `GET /faucet?address=<terp1…>` |
| Chain | `120u-1` only |
| Denoms | `uterp` (stake) and `uthiol` (fee) — confirm on `/status` |

`90u-4` does not exist. Do not call `/90u-4/<address>` or `/120u-1/<address>`.

```bash
ADDR=$(terpd keys show my-wallet -a)

curl -sS https://testnet-faucet.terp.network/status | jq .

curl -sS "https://testnet-faucet.terp.network/faucet?address=${ADDR}" | jq .
# { "txhash": "…" }  or an error / rate-limit body
```

Then query **testnet** RPC (not `rpc.terp.network`, which is mainnet):

```bash
terpd query bank balances "$ADDR" \
  --node https://testnet-rpc.terp.network:443 \
  --chain-id 120u-1
```

Rate limits and daily caps are enforced server-side. A non-2xx or empty drip under load is expected — wait and retry. Never point this faucet at a mainnet address and expect value; it will not send `morocco-1` funds.

## Local Docker `localterp`

Same HTTP shape, on localhost. From [terp-core docker/README.md](https://github.com/terpnetwork/terp-core/blob/main/docker/README.md):

```bash
docker buildx build --target localterp -t terpnetwork/terp-core:localterp --load .
docker run --rm -it \
  -p 26657:26657 -p 1317:1317 -p 5000:5000 -p 9090:9090 \
  terpnetwork/terp-core:localterp
```

```bash
curl -sS localhost:5000/status
# {"faucet_address":"terp1...","amount":"1000000000","denoms":["uterp","uthiol"]}

curl -sS "localhost:5000/faucet?address=terp1youraddr"
```

| Variable | Default | Meaning |
|----------|---------|---------|
| `FAUCET_WALLET_NAME` | `a` | Keyring key that sends |
| `FAUCET_AMOUNT` | `1000000000` | Amount **per denom** per request |
| `DENOMS` | `uterp,uthiol` | Comma-separated |

Image keys `validator`, `a`, `b`, `c`, `d` are **public test vectors**.

## `terpd testnet create --faucet`

```bash
terpd testnet create \
  --chain-id localterp-1 \
  --faucet \
  --faucet-port 5000 \
  --faucet-key-name a \
  --faucet-amount 1000000000 \
  --faucet-denoms uterp,uthiol \
  --home $HOME/.terpd-testnet
```

Same `/status` and `/faucet?address=` on `:5000`. See [Local network](/guides/nodes/local).

## App.toml LCD faucet (test infra only)

`[faucet]` in `app.toml` attaches an optional handler to the REST server (`:1317`). Default **`enable = false`**. Turn it on only for isolated test hosts with a dedicated key.

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

## Manual localnet (no faucet)

[Single-node local](/guides/nodes/local) funds from genesis (`add-genesis-account`) and `bank send`. Prefer Docker or `testnet create --faucet` when many ephemeral addresses need topping up.

## ict-rs

`TestEnv::terp_localterp_config()` + `tc.faucet_fund("terp1…")` hits the localterp faucet, not the public one.

## Verify

| Check | Command |
|-------|---------|
| Public status | `curl -sS https://testnet-faucet.terp.network/status` |
| Public drip | `curl -sS "https://testnet-faucet.terp.network/faucet?address=terp1…"` |
| Local status | `curl -sS localhost:5000/status` |
| Balance | `terpd query bank balances <addr> --node https://testnet-rpc.terp.network:443 --chain-id 120u-1` |

## Related

- [Quickstart](/overview/quickstart)
- [Local network](/guides/nodes/local)
- [Public endpoints](/resources/public)
