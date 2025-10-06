---
title: run a relayer via go-rly
sidebar_position: 2
---

A relayer communicates with 2 networks in order for packets (msgs) to be sent between them sercurely & with finality.

## GUIDE
Instructions for setting up a relayer via hermes.

## Goals

- install go relayer relayer
- customize config file for networks you would like to use
- configure keys for relayer to sign msgs with
- configure channels, clients, and connections
- run and create service for persistent operations


## Requirements 

- linux environment
- make & go installed 
- full node, with access to state containing light-client proof hash. 

## Step 1: Install Relayer

<Container>
<Tabs>
<TabItem value="source" label="source">

```sh
# build the relayer directly from the source code:
git clone https://github.com/cosmos/relayer.git
cd relayer
git checkout $(git describe --tags $(git rev-list --tags --max-count=1))
make install
```

</TabItem>
<TabItem value="release" label="release">

```bash
# replace <release-version> with desired value
wget https://github.com/cosmos/relayer/releases/download/v2.5.2/Cosmos.Relayer_2.5.2_linux_amd64.tar.gz 
# decompress file & move to go folder
tar -xvf Cosmos.Relayer_2.5.2_linux_amd64.tar.gz && mv 'Cosmos Relayer_2.5.2_linux_amd64'/rly /usr/local/go/bin/
```
</TabItem>
</Tabs>
</Container>

to verify it was installed correctly:
```sh
rly version
version: v2.5.2
commit: dirty
cosmos-sdk: v0.50.4
go: go1.21.5 linux/amd64
```

*If you get an output like `'rly' not found` you should probably add `/srv/rly/go/bin` to your PATH*


# Step 2: Configure Relayer
First, we need to init rly so it will create the default configuration `$HOME/.relayer/config/config.yaml` maybe with a custom memo that will be written on relayed transactions

```bash
rly config init --memo "H.R.E.A.M"
```

Then we will add the chains (Terp Network, Cosmos and Secret Network here) on the config file with a simple command:

```bash
rly chains add terpnetwork secretnetwork cosmoshub
```

*Chains configuration will be pulled from chain-registry https://github.com/cosmos/chain-registry so if you find misconfigurations (like gas fees or other) feel free to contribute.*
Aso RPCs will be chosen from chain-registry, so feel free to change them to your local nodes' RPCs or to a preferred public RPC. If this was unsuccessful, a [default go-relayer template config](https://github.com/terpnetwork/networks/blob/main/mainnet/morocco-1/config/go-rly/TERP_X.toml) can be found.


## Step 3: Configure Your Relayer Keys

:::warning
Your relayer will need to sign & broadcast messages on chain, so first the private keys that we will grant to the relayer must be set up. Generally it is ideal to utilize a fresh wallet and private key, not associated with any personal or critical keys in your possession.
:::

To add keys, this example uses a **mnemonic-file,** which contains just the mnemonic seed phrase of the account you want the relayer to sign & broadcast messages with:

```bash
MNEMONIC="<your_mnemonic_here>"
rly keys restore terpnetwork headstash "$MNEMONIC"
```

For each network keys, edit the configuration file (under `$HOME/.relayer/config/config.yaml`) changing the key values according to the you had defined above. Example:
```sh
# install yaml -> jq tool: sudo apt install yq  
yq -i -y  '.chains[].value.key = "headstash"' .relayer/config/config.yaml

```
In the last step of wallet configuration you can fund your wallets and check balances:
```sh
rly q balance terpnetwork
```

## Step 4: Configuring paths
to add a new path between Terp Network and another blockchain:
```sh
rly paths new <terp-chain-id> <linked-chain-id> custom-alias-to-reference-specific-connection
```

### linking two blockchains
Linking two blockchains for the first times requires the creation & acknowledgement of client-ids, channel-ids, and connection-ids from both protocols. You can review [basic IBC specifics here](./basic-ibc-overview).

:::info
It is reccommended to check for existing clients and connections before creating new ones, in order to promote supported, canonical ibc channels.
:::

### A. Create Clients 
```sh
 rly transact clients path_name [flags]
```

### B. Create Connections
```sh
rly transact connection path_name [flags]
```

### C. Create Channels
```sh
rly transact channel demo-path --src-port transfer --dst-port transfer --order unordered --version ics20-1
```

### OR,

### ABC. Create Clients,Connections,Channels in 1 Tx
```sh
 rly transact link demo-path --src-port transfer --dst-port transfer
```

## Step 6: Setup Continuous Relay Service
This will allow your relayer to run continuously on your server. 
Update the following configuration with your parameters to `/etc/systemd/system/rly.service`
```sh
sudo tee /etc/systemd/system/rly.service > /dev/null <<EOF  
[Unit]
Description=Rly IBC relayer
ConditionPathExists=/root/go/bin/rly
After=network.target
[Service]
Type=simple
User=root
ExecStart=/root/go/bin/rly start
Restart=always
RestartSec=15
# start of parameters to improve connections with public RPCs
RuntimeMaxSec=14400s
StartLimitInterval=200
StartLimitBurst=10
# end of parameters for external RPCs
[Install]
WantedBy=multi-user.target
EOF
```

Then we well start rly with the newly created service and enable it. Note that this step is done from your normal user account that has sudo privileges, so no longer as a rly user.

```sh
systemctl enable rly
systemctl daemon-reload
systemctl start rly
```

## Step 7: Monitering IBC Relaying on Terp Network
COMING SOON


## Configuring Existing IBC Path 

```sh
# grab the ibc path params
terpd q ibc connection end connection-<id>
```
update the path with existing parameters:
```sh
rly paths update terp-juno --dst-client-id 07-tendermint-<id>
rly paths update terp-juno --src-client-id 07-tendermint-<id>
rly paths update terp-juno --src-connection-id connection-<id>
rly paths update terp-juno --dst-connection-id connection-<id>
```

___
> Sources:
* https://hermes.informal.systems/
* https://docs.junonetwork.io/validators/relaying
>