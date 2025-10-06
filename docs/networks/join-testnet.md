# Joining Testnet
**A Test Network exist for community members to have a way to familiarize themselves with terp-core & battleharden their custom smart contract code.** 

If you plan to run a node on main network, it is highly reccomended to treat the test network as a production environment to get into the habit of best practices in terms of node operation security. 
___
## Current testnet 

Below is the list of Terp testnets and their current status. You will need to know the version tag for installation of the `terpd` binary.

For details of upgrades on the current testnet, as well as syncing, you can check out the testnets repo, which is the definitive source of truth.

If you get stuck, then please ask on Discord.

| chain-id | Current Github version tag |
| -------- | -------------------------- |
| 90u-4    | v4.2.0               |

## Minimum Hardware Requirements

The minimum recommended hardware requirements for running a validator for the Terp testnets are:

| Requirements                                                                          |
| ------------------------------------------------------------------------------------- |
| <ul><li>16GB RAM</li><li>200GB of disk space</li><li>2 Cores (modern CPU's)</li></ul> |

> These specifications are the minimum recommended. As Terp Network is a smart contract platform, it can at times be very demanding on hardware. Low spec validators WILL get stuck on difficult to process blocks.


> Note that the testnets accumulate data as the blockchain continues. This means that you will need to expand your storage as the blockchain database gets larger with time.

## terpd Installation

To get up and running with the terpd binary, please follow the instructions [here](getting-setup.md)

## Configuration of Shell Variables

For this guide, we will be using shell variables. This will enable the use of the client commands verbatim. It is important to remember that shell commands are only valid for the current shell session, and if the shell session is closed, the shell variables will need to be re-defined.

If you want variables to persist for multiple sessions, then set them explicitly in your shell .profile, as you did for the Go environment variables.

To clear a variable binding, use unset $VARIABLE_NAME. Shell variables should be named with ALL CAPS.

### Choose a testnet

Set the `CHAIN_ID`:

```bash
CHAIN_ID=90u-4
```
### Set your moniker name

Choose your `<moniker-name>`, this can be any name of your choosing and will identify your validator in the explorer. Set the `MONIKER_NAME`:

```bash
MONIKER_NAME=<moniker-name>

#Example
MONIKER_NAME="HASHONLY 9000"
```

### **Set persistent peers**

Persistent peers will be required to tell your node where to connect to other nodes and join the network. To retrieve the peers for the chosen testnet:


> NB: If you are unsure about this, you can ask in discord for the current peers and explicitly set them in `~/.terp/config/config.toml` instead.

### Set minimum gas prices 
For RPC nodes and Validator nodes we recommend setting the following minimum-gas-prices. This setting will help protect against contract spam and potential wasm contract attack vectors.

In `$HOME/.terp/config/app.toml`, set minimum gas prices:
```
# note testnet denom
0.05uthiolx
```

## Setting up the Node

> Running a node is different from running a Validator. In order to run a Validator, you must create and sync a node, and then upgrade it to a Validator.

These instructions will direct you on how to initialise your node, synchronise to the network and upgrade your node to a validator.

### **Initialize the chain**
```bash
terpd init $MONIKER_NAME --chain-id $CHAIN_ID
```

This will generate the following files in `~/.terp/config/`

* `genesis.json`
* `node_key.json`
* `priv_validator_key.json`

> Note that this means if you jumped ahead and already downloaded the genesis file, this command will replace it and you will get an error when you attempt to start the chain.

### Download the genesis file
```
curl https://raw.githubusercontent.com/terpnetwork/networks/main/testnet/90u-4/genesis.json > ~/.terp/config/genesis.json
```

This will replace the genesis file created using `terpd init` command with the genesis file for the testnet.

### **Set persistent peers**

### **Create a local key pair**
Create a new key pair or restore a key for your validator:

```sh
# Create new keypair 
terpd keys add <key-name>

# OR 

# Restore existing terp wallet with mnemonic seed phrase. 
# You will be prompted to enter mnemonic seed. 
terpd keys add <key-name> --recover

# OR 

# Store a local reference to a connected ledger device
terpd keys add <key-name> --recover --ledger

# Query the keystore for your public address
terpd keys show <key-name> -a
```
Replace `<key-name>` with a key name of your choosing.

> After creating a new key, the key information and seed phrase will be shown. It is essential to write this seed phrase down and keep it in a safe place. The seed phrase is the only way to restore your keys.

### **Get some testnet tokens**

Testnet tokens can be requested from the `#faucet` channel on Discord

## Setup cosmovisor

Follow [these](setting-up-cosmovisor.md) instructions to setup cosmovisor and start the node.

## Syncing the node

After starting the terpd daemon, the chain will begin to sync to the network. The time to sync to the network will vary depending on your setup, but could take a very long time. To query the status of your node:

```bash
# Query via the RPC (default port: 26657)
curl http://localhost:26657/status | jq .result.sync_info.catching_up
```

If this command returns `true` then your node is still catching up. If it returns `false` then your node has caught up to the network current block and you are safe to proceed to upgrade to a validator node.

> Validators and sentries can rapidly join the network with state-sync. See instructions for using state-sync.

## Upgrade to a validator
To upgrade the node to a validator, you will need to submit a `create-validator` transaction:

```sh
terp tx staking create-validator \
  --amount 1000000uterpx \
  --commission-max-change-rate "0.1" \
  --commission-max-rate "0.20" \
  --commission-rate "0.1" \
  --min-self-delegation "1" \
  --details "validators write bios too" \
  --pubkey=$(terpd tendermint show-validator) \
  --moniker "$MONIKER_NAME" \
  --chain-id $CHAIN_ID \
  --gas auto\
  --fees 30000uthiolx\
  --gas-adjustment 1.5
  --from <key-name>
  ```

  ## Backup critical files
There are certain files that you need to backup to be able to restore your validator if, for some reason, it damaged or lost in some way. Please make a secure backup of the following files located in `~/.terp/config/`:
* `priv_validator_key.json`
* `node_key.json`

It is recommended that you encrypt the backup of these files.