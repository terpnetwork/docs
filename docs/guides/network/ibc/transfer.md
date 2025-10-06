---
title: transfers
sidebar_position: 6
---

## Goals 

Review lifecycle of:

- cross-chain token transfer
- multi-chain token transfer 


### Cross Chain Transfers
Tokens can be transferred between 2 chains with a channel connection both sides.

#### CLI Command
```sh
terpd tx ibc-transfer transfer  [src-port] [src-channel] [receiver-addr] [amount] [flags]
```

### IBC Hooks: Multi Chain Transfers