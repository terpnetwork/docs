---
title: "Proposals"
description: "How ideas become on-chain governance proposals on Terp Network"
---

Ideas start as forum discussion and graduate to on-chain proposals that stakeholders vote on. The forum-tag workflow (`IDEATION` → `PRE-PROPOSAL` → `PROPOSAL` → `VOTING`) is a social convention — what actually executes lives on-chain.

## Lifecycle

1. **Discuss** — float the idea in [Discord](https://discord.terp.network) and with validators. No format required yet.
2. **Draft** — write title, description, and exact on-chain effects. For spend proposals: recipient, amount, denom.
3. **Submit** — `terpd tx gov submit-proposal` with a deposit (returned if the proposal passes or reaches quorum rules; check live params below).
4. **Vote** — see [Voting](./voting). Anyone staking can vote directly or inherit their validator's vote by abstaining.
5. **Enact** — passed proposals execute automatically (param changes, spends) or record the decision (text proposals).

## Proposal types

- **Text** — records agreement on a strategy or plan. No automatic on-chain effect.
- **Community pool spend** — moves funds: title, description, recipient (bech32), amount, deposit. Verify the description matches what the messages actually enact.
- **Parameter change** — alters a module parameter (note: `gov` params use subkeys). Double-check the parameter path against the [API reference](/api/rest).

## Live parameters

Don't trust hardcoded voting periods or quorums from guides — read them from the chain:

```bash
terpd query gov params voting --output json
terpd query gov params tallying --output json
terpd query gov params deposit --output json
```

Or browse them in the [REST API](/api/rest) under the Gov group.
