---
title: Mainnet 
sidebar_position: 2
---

# Deploy to Mainnet 

### How do I deploy to Terp Network mainnet?
Terp Network is a permissioned chain, meaning there is a governance process to adhere to. After familiarizing yourslef with the governance process, here's a template to follow for submitting an on-chain proposal. 

To submit a governance proposal via the `terpd` CLI, you may follow the exmaple below

## Create Draft Proposal & Metadata 
```
terpd tx gov draft-proposal 
```

## Format WASM Binary for proposal 

## Submit New Proposal 
```
terpd tx gov submit-proposal draft-proposal.json --from test-key --chain-id morocco-1
```