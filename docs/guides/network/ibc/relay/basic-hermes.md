---
title: run a relayer via hermes
sidebar_position: 3
---

A relayer communicates with 2 networks in order for packets (msgs) to be sent between them sercurely & with finality.

## GUIDE
Instructions for setting up a relayer via hermes.

## Goals

- install hermes relayer
- configure hermes to networks you would like to use
- configure keys for hermes to sign msgs with
- configure & troubleshoot channels, clients, and connections
- set up software to continuously run

## Step 1: Install Hermes

### Option 1 - Install Via Cargo

*first, install rust on your machine if not already installed:*

```bash
# install rust 
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

***reload your** PATH environment variable to include* Cargo's bin directory `$HOME/.cargo/bin`:

```bash
source $HOME/.cargo/env
```

*now, to install they relayer software:*

```bash
# install the latest release of Hermes
cargo install ibc-relayer-cli --bin hermes --locked
```

*to verify the installation:*

```bash
hermes version
# output should be: hermes v...
```

## Step 2: Setup Initial Configuration for Hermes

For each network you would like to relay messages between, you will need to customize **the config.toml file the relayer software will use to determine where to listen for packets to communicate between networks.**

create a template config file:

```bash
hermes config auto --output $HOME/.hermes/config.toml --chain terpnetwork secretnetwork
```

you should have now created a config.toml file that we can further modify for our needs. Running `cat $HOME/.hermes/config.toml` should return the default template from the chains you intend to relay packets for

## Step 3: Configure Your Relayer Keys

Your relayer will need to sign & broadcast messages on chain, so first the private keys that we will grant to the relayer must be set up.Generally it is ideal to utilize a fresh wallet and private key, not associated with any personal or critical keys in your possession.

Cosmos blockchains enable various methods for handling how the messages are signed, for example a **fee grant** for a key a relayer is using, by a completely different key, and ONLY for the messages that are used when relayed packets are received is possible.


To add keys, this example uses a **mnemonic-file,** which contains just the mnemonic seed phrase of the account you want the relayer to sign & broadcast messages with:

```bash
FILE_NAME=$HOME/.hermes/key-1.txt
echo "<just-your-mnemonic-seed>" > "$FILE_NAME"
```

then, add by restoring the key:

```bash
hermes keys add --key-name key-1 --chain 90u-4 --mnemonic-file $HOME/.hermes/key-1.txt
```

repeat this process for the chains you intend to relay packets for.

## Step 4: A Quick Overview of Relayer Channels, Clients, and Connections

you can find a [basic IBC overview](./basic-ibc-overview) to refresh your memory on how IBC on Terp Network is implemented.

## Step 5: Spinning Up A Fresh Channel, Client & Connection

if there is no existing channels between the pair of networks:
```sh

```

## Step 6: Setup Continuous Relay Service
setup a systemd file for your server:

```sh
[Unit]
Description=Hermes Service
After=network.target

[Service]
User=<username>
ExecStart=/usr/local/bin/hermes start
Restart=always

[Install]
WantedBy=multi-user.target
```

## Step 7: Monitering IBC Relaying on Terp Network
A comprehensive guide for [monitoring your relayer can be found here](https://hermes.informal.systems/tutorials/production/setup-grafana.html).
___
> Sources:
* https://hermes.informal.systems/
* https://docs.junonetwork.io/validators/relaying
>