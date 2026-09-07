---
title: Troubleshooting
description: Common validator failures and fixes
status: complete
---
Here we walk through several common issues that you might encounter when you are running a validator node.

## Validator has 0 voting power

If your validator has 0 voting power, your validator has become auto-unbonded. On the mainnet, validators unbond when they do not vote on **9500** of the last **10000** blocks (**50** of the last **100** blocks on the testnet). Because blocks are proposed every **~5** seconds, a validator that is unresponsive for **~13** hours (**~4** minutes on testnet) become unbonded. This problem usually happens when your **terpd** process crashes.

To return the voting power back to your validator, check if **terpd** is running:

```bash
terpd status
```

If **terpd** is not running, restart it:

```bash
terpd start
```

## Failed to initialize database: resource temporarily unavailable

If you are getting this error while launching **terpd start** you probably have **terpd** already running. If you previously started it as a service, make sure to stop it with:

```bash
sudo systemctl stop terpd.service
```

You can now launch **terpd start** again.

## "terpd: command not found" error

If you receive an  `terpd: command not found` Error message, you should:

### Make sure your GOPATH is properly set

Ensure the Go environment variables are <a href="https://golang.org/doc/gopath_code#GOPATH" target="_blank">set properly</a> on your system.

You could set the **GOROOT** and **GOPATH** in the **~/.profile** file:

```bash
export GOROOT=/usr/local/go
export GOPATH=$HOME/go
export PATH=$PATH:$GOROOT/bin:$GOPATH/bin
```

And applying those changes with:

```bash
source ~/.profile
```

When running a validator, consider adding the flag **--home ./my-node** flag in almost all commands tells **terpd** to work on that specific directory

## Cleaning up

If you already tried setting up a node and need a cleanup, it may be good to remove any previous genesis file and configuration that you have used:

```bash
rm -rf ~/.terp
```

This command will remove all data and configs you already set, including keyring information. Be sure to save a copy of your key files

## Unjail the validator

Wait for your full node to reach the latest block, and run:

::highlight-card

```bash
terpd tx slashing unjail <ValidatorAddress> --chain-id=<ChainId> --from=<Name>
```

where

- `<ValidatorAddress>` is the address of your validator account.
- `<Name>` is the name or address of the validator account. To find this information, run `terpd keys list`.

  If you don't wait for **terpd** to sync before running **unjail**, an error message will inform you that your validator is still jailed.

You can check your validator again to see if your voting power is back:

```bash
terpd status
```

If your voting power is less than it was previously is probably due to the fact you were slashed for downtime.

## Too many files open and terpd crashes

The default number of files Linux can open per process is **1024**. **terpd** is known to open more than this amount, causing the process to crash. To fix this problem:

Increase the number of open files by running:

```bash
ulimit -n 4096
```

And restart the process by running:

```bash
   terpd start
```

## Additional considerations

### Connection errors

- Check your network settings: Make sure that your node's network settings are properly configured to communicate with other nodes on the network. Check your firewall settings and ensure that they are not blocking incoming or outgoing connections.

- Restart your node: Try restarting your node to see if that resolves the connection issue. Sometimes a simple restart can help fix communication problems.

### Memory errors

- Make sure that your node's memory settings are properly configured for your node's resources and capabilities.

### Disk space errors

- Make sure that your node's disk space settings are properly configured for your node's resources and capabilities.
- If your node is running out of disk space, consider pruning old blocks or transactions to free up space.
