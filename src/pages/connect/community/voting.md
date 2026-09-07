---
title: "Voting"
description: "How governance voting works on Terp Network"
---

Every staked account can vote on active proposals — directly, or by letting their validator's vote count for them (voting yourself always overrides).

## Options

`Yes`, `No`, `Abstain`, `NoWithVeto`. A veto-heavy rejection burns the deposit; check the live tally params for exact thresholds.

## How to vote

```bash
# list active proposals
terpd query gov proposals --status voting_period --output json

# vote (use your key name, not the address)
terpd tx gov vote <proposal-id> yes --from <key-name> --chain-id <chain-id>
```

Watch the tally while voting is open:

```bash
terpd query gov tally <proposal-id> --output json
```

## Know the current rules first

Voting period, quorum, and thresholds are chain parameters, not constants — read them live ([Proposals](./proposals)) before quoting them anywhere.
