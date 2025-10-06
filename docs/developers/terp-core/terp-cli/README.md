---
title: Terp-CLI
sidebar_position: 1
---

# Command Line Interface - TERPD


TERPD CLI is a tool that powers interacting seamlessly with the Terp Network. Terpd has a wide array of operations, from sending transactions to querying the blockchain's state and more.

TERPD CLI is not strictly limited to those running their own nodes. You can engage with the network even without hosting a node personally. You can utilize TERPD CLI to submit transactions or probe the network's state via RPC. This opens up opportunities to interact with the Terp Network blockchain, making it a versatile tool for a range of operations.

## Installation

You can download the latest release of the pre-built binary from the <a href='https://github.com/terpnetwork/terp-core/releases' target='_blank'>releases page</a>.


and you can compare that the sha256 hash strings match, By doing so, you are ensuring that the downloaded file matches the actual release file.

## Scope

The full scope of **terpd** commands can be viewed using the command **terpd --help**:

```
Terp Network Community Network

Usage:
  terpd [command]

Available Commands:
  add-ica-config Add ICA config to genesis.json
  config         Create or query an application CLI configuration file
  debug          Tool for helping with debugging your application
  export         Export state to JSON
  genesis        Application's genesis-related subcommands
  help           Help about any command
  init           Initialize private validator, p2p, genesis, and application configuration files
  keys           Manage your application's keys
  prune          Prune app history states by keeping the recent heights and deleting old heights
  query          Querying subcommands
  rollback       rollback cosmos-sdk and tendermint state by one height
  rosetta        spin up a rosetta server
  start          Run the full node
  status         Query remote node for status
  tendermint     Tendermint subcommands
  tx             Transactions subcommands
  version        Print the application binary version information

Flags:
  -h, --help                help for terpd
      --home string         directory for config and data (default "/home/terps/.terp")
      --log_format string   The logging format (json|plain) (default "plain")
      --log_level string    The logging level (trace|debug|info|warn|error|fatal|panic) (default "info")
      --trace               print out full stack trace on errors

Use "terpd [command] --help" for more information about a command.
```