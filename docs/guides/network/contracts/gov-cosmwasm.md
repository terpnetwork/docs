---
title: c. propose to upload a contract
sidebar_position: 3
---
The following is a quick guide to provide a basic example on how submit a wasm binary proposal in Terp Network. This particular example will be with localterp but it can also be used with testnet.

Learn more: <https://github.com/CosmWasm/wasmd/blob/main/x/wasm/Governance.md>

## Query Governance Params

```sh
terpd q gov params
```

*Often times its useful to reference this endpoint for the proposal deposit params.*

## Draft Proposal

```sh
terpd tx gov draft-proposal 
```

this prints two files, `draft_metadata.json` & `draft_proposal.json`.

## Submit Proposal

```sh
terpd tx gov submit-proposal
```
