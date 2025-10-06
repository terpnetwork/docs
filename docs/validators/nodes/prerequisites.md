---
title: 1. prerequisites
sidebar_position: 1
---
This guide explains what the requirements are to install and run an Terp Network full node. We assume that you are on a linux distrubtion with atleast 100GB of storage, 1 CPU, and 16GB of RAM.

To quickly spin up a linux testing environment, Akash Console, or Digital Ocean, are two options available to spin up a linux envoronment.

## Install prerequisites

```bash
# update the local package list and install any available upgrades
sudo apt-get update && sudo apt upgrade -y

# install toolchain and ensure accurate time synchronization
sudo apt-get install make build-essential gcc git jq chrony lz4 -y
```

### Go

First we will need [to install Go](https://go.dev/doc/install) .

For an Ubuntu, you can probably use:

```bash
wget https://golang.org/dl/go1.25.1.linux-amd64.tar.gz
sudo tar -C /usr/local -xzf go1.25.1.linux-amd64.tar.gz
```

Please install Go v1.25.1 or later.

Unless you want to configure in a non standard way, then set these in the .profile in the user's home (i.e. ~/) folder.

```bash
export GOROOT=/usr/local/go
export GOPATH=$HOME/go
export GO111MODULE=on
export PATH=$PATH:/usr/local/go/bin:$HOME/go/bin
```

After updating your ~/.profile you will need to source it:

```bash
source ~/.profile
```

## Next steps

You are ready to go! Let's go forward with installing the terp-core node binary.
