
import {MoroccoBinaryVersion, TestnetBinaryVersion} from '../../src/client/terpd-version';

# Joining Mainnet
**General instructions to join the Terp mainnet after network genesis.** 

If you plan to run a node on main network, it is highly reccomended to treat the test network as a production environment to get into the habit of best practices in terms of node operation security. 
___

## Terp-Core Installation

Make sure you have [installed the Terp Core Binary (Terpd)](../overview/getting-started).

## Mainnet binary version 

Terp Network will go through upgrades as it matures. 

The first mainnet is `morocco-1`.

The correct version of the binary for mainnet is <MoroccoBinaryVersion/>

Releases after genesis can be found in the mainnet repo.

> To find the current version of the binary, go to the mainnet repo find the most recent upgrade

> If you plan to use a snapshot or state sync to sync your node, you will need the latest binary.

## Recommended Minimum Hardware
The minimum reccomended hardware requirements for running a validator for the Terp Mainnet are:
- 4 Cores (modern CPU's)
- 16GB RAM 
- 500 GB of storage (SSD or NVME)

> These specifications are the minimum recommended. As Terp Network is a smart contract platform, it can at times be very demanding on hardware. Low spec validators WILL get stuck on difficult to process blocks.
> If you are running less than 16GB RAM, we recommend adding a swap on NVME storage to help process large and complex blocks.

> Note that the mainnet will accumulate data as the blockchain continues. This means that you will need to expand your storage as the blockchain dadtabase gets larger with time. 


## Configuration of Shell Variables

For this guide, we will be using shell variables. This will enable the use of the client commands verbatim. It is important to remember that shell commands are only valid for the current shell session, and if the shell session is closed, the shell variables will need to be re-defined.

If you want variables to persist for multiple sessions, then set them explicitly in your shell .profile, as you did for the Go environment variables.

To clear a variable binding, use unset $VARIABLE_NAME. Shell variables should be named with ALL CAPS.

### Choose the required mainnet chain-id
```
CHAIN_ID=morocco-1
```

### Set your moniker name

Choose your `<moniker-name>`, this can be any name of your choosing and will identify your validator in the explorer. Set the `MONIKER_NAME`:

```bash
MONIKER_NAME=<moniker-name>

#Example
MONIKER_NAME="Validatron 9000"
```
## Setting up the Node
These instructions will direct you on how to initialize your node, synchronize to the network and upgrade your node to a validator.

### Initialize the chain

```
terpd init "$MONIKER_NAME" --chain-id $CHAIN_ID
```
This will generate the following files in `~/.terp/config/
- `genesis.json`
- `node_key.json`
- `priv_validator_key.json`

### Downloading the genesis file
Download the "Morocco" genesis file. The following instructions download the genesis file
```
# Download genesis.json file
rm ~/.terp/config/genesis.json
curl -s https://raw.githubusercontent.com/terpnetwork/networks/main/mainnet/morocco-1/genesis.json> $HOME/.terp/config/genesis.json
```

This will replace the genesis file created using terpd init command with the mainnet `genesis.json`

### Set seeds
We can set the `seeds` by retrieving the list of seeds from the chain registry 

> If you are unsure about this, you can ask in discord for the current peers and explicitly set them in `~/.terp/config/config.toml` instead.

### Set minimum gas prices 
For RPC nodes and Validator nodes we recommend setting the following minimum-gas-prices. This setting will help protect against contract spam and potential wasm contract attack vectors.

In `$HOME/.terp/config/app.toml`, set minimum gas prices:
```sh
0.05uthiol
```

### Create (or restore) a local key participate

Either create a new key pair, or restore an existing wallet for your validator:
```bash
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

### Get some Terp tokens
You will require some Terp tokens to bond to your validator. TO be in the active set you will need to have enough tokens to be in the top 69 validators by delegation weight. 

If you do not have and Terp tokens for your validator, you may request for 1 in the Discord, as the large majority of Terp Tokens are vesting currently. 
### Syncing the node

There are methods to sync a node to the network: 
1. From genesis and follwoing the Mainnet Updgrades path
2. Sync from Snapshot 
3. Sync with state-sync

### From genesis
After starting the terpd daemon, the chain will begin to sync to the network. The time to sync to the network will vary depending on your setup and the current size of the blockchain, but could take a very long time. To query the status of your node:
```
# Query via the RPC (default port: 26657)
curl http://localhost:26657/status | jq .result.sync_info.catching_up
```
If this command returns true then your node is still catching up. If it returns false then your node has caught up to the network current block and you are safe to proceed to upgrade to a validator node.

#### Binary upgrades
During the syncing process you will need to install binary upgrades at the correct height. Please refer to Mainnet Upgrades for further information.

### Upgrade to a validator 
> Do not attempt to upgrade your node to a validator until the node is fully in sync as per the previous step.

To upgrade the node to a validator, you will need to submit a create-validator transaction:
```
terp tx staking create-validator \
  --amount 1000000uterp \
  --commission-max-change-rate "0.1" \
  --commission-max-rate "0.20" \
  --commission-rate "0.1" \
  --min-self-delegation "1" \
  --details "validators write bios too" \
  --pubkey=$(terpd tendermint show-validator) \
  --moniker "$MONIKER_NAME" \
  --chain-id $CHAIN_ID \
  --gas auto\
  --fees 30000uthiol\
  --gas-adjustment 1.5
  --from <key-name>
  ```

  The above transaction is just an example. There are many more flags that can be set to customise your validator, such as your validator website, or keybase.io id, etc. To see a full list:
  ```
  terpd tx staking create-validator --help
  ```

### Backup critical files
There are certain files that you need to backup to be able to restore your validator if, for some reason, it damaged or lost in some way. Please make a secure backup of the following files located in ~/.terp/config/:
- `priv_validator_key.json`
- `node_key.json`

It is recommended that you encrypt the backup of these files.