---
title: "Prerequisites"
description: "This guide explains what the requirements are to install and run an Terp Network full node. We assume that you are on a linux distrubtion with atleast 100GB..."
status: "partial"
---
This guide explains what the requirements are to install and run an Terp Network full node. We assume a Linux distribution with at least 100GB of storage, 1 CPU, and 16GB of RAM.

To spin up a Linux test environment quickly, Akash Console and DigitalOcean are two options.

## Install prerequisites

```bash
# update the local package list and install any available upgrades
sudo apt-get update && sudo apt upgrade -y

# install toolchain and ensure accurate time synchronization
sudo apt-get install make build-essential gcc git jq chrony lz4 -y
```

## Go

Follow the instructions [here](https://go.dev/doc/install) to install Go.

For an Ubuntu, you can probably use:

```bash
wget https://golang.org/dl/go1.26.5.linux-amd64.tar.gz
sudo tar -C /usr/local -xzf go1.26.5.linux-amd64.tar.gz
```

Install Go v1.26.5 or later (this is what `terpd` v6 builds with).

Unless you want to configure in a non standard way, then set these in the .profile in the user's home (i.e. ~/) folder.

```bash
export GOPATH=$HOME/go
export PATH=$PATH:/usr/local/go/bin:$HOME/go/bin
```

After updating your ~/.profile you will need to source it:

```bash
source ~/.profile
```

## Next steps

You are ready to go! Let's go forward with installing the terp-core node binary.
