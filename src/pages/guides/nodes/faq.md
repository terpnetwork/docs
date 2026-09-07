---
title: "Node FAQ"
description: "Short answers to common node operator questions"
---

## How much does self-delegation need to be?

Pass `--min-self-delegation` in `uterp` when creating the validator (see [Setup](/guides/validators/setup)). The exact minimum is a chain parameter — read it live rather than trusting a guide:

```bash
terpd query staking params --output json | jq .params.min_self_delegation
```

## How long is unbonding?

Read it from the chain — it differs between mainnet and testnet:

```bash
terpd query staking params --output json | jq .params.unbonding_time
```

## What gets me slashed?

Downtime (missing too many blocks in a signed window) and double-signing (two signers on one consensus key — the fast track to tombstoning). Both are covered in [Validator overview](/guides/validators/overview); the defense is [monitoring](/guides/validators/monitoring) plus [one signer per key](/guides/nodes/threshold-signing).

## Can I run a validator and an RPC node on one host?

Don't. RPC traffic competes with consensus for CPU, disk I/O, and file descriptors. Run the validator private behind a [sentry array](/guides/validators/sentry) and serve queries from separate full nodes.

## Where do I watch upgrades and params?

Upgrade proposals: `terpd query gov proposals --status voting_period`. Live module params (slashing windows, gov periods, staking limits): the [REST API](/api/rest) — Cosmos SDK, Gov, Slashing, and Staking groups.

## My node is stuck — where do I start?

[State sync](/guides/nodes/state-sync) trust-height refresh, then [snapshots](/guides/nodes/snapshots), then [troubleshooting](/guides/validators/troubleshooting) — in that order.
