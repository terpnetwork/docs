---
title: sync from state-sync
sidebar_position: 3
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

:::danger 
Statesync Providers are 3rd-party, non-audited sources. It is generally not good practive to run statesync or configure your local node to a public endpoints, without VPN or sentry array setup. 
:::

**state-sync** is a feature that allows nodes to quickly sync their state by fetching a snapshot of the application state at a specific block height. 

This greatly reduces the time required for node to sync with the network, compared to the default method of replaying all blocks from the genesis block. The syncing happens through a snapshot-enabled RPC and from a trusted block height.

*An advantage of state-sync is that the database is very small in comparison to a fully synced node, therefore using state-sync to resync your node to the network can help keep running costs lower by minimizing storage usage.*

## Guide: Connect via statesync 

### Stop Node & Resest
```sh
sudo systemctl stop terpd
terpd tendermint unsafe-reset-all --home ~/.terp/ --keep-addr-book
```

### Configure StateSync 
```sh
SNAP_RPC="<STATESYNC_ENDPOINT>"
LATEST_HEIGHT=$(curl -s $SNAP_RPC/block | jq -r .result.block.header.height); \
BLOCK_HEIGHT=$((LATEST_HEIGHT - 1000)); \
TRUST_HASH=$(curl -s "$SNAP_RPC/block?height=$BLOCK_HEIGHT" | jq -r .result.block_id.hash)
echo $LATEST_HEIGHT $BLOCK_HEIGHT $TRUST_HASH

sed -i.bak -E "s|^(enable[[:space:]]+=[[:space:]]+).*$|\1true| ; \
s|^(rpc_servers[[:space:]]+=[[:space:]]+).*$|\1\"$SNAP_RPC,$SNAP_RPC\"| ; \
s|^(trust_height[[:space:]]+=[[:space:]]+).*$|\1$BLOCK_HEIGHT| ; \
s|^(trust_hash[[:space:]]+=[[:space:]]+).*$|\1\"$TRUST_HASH\"|" ~/.v/config/config.toml
more ~/.terp/config/config.toml | grep 'rpc_servers'
more ~/.terp/config/config.toml | grep 'trust_height'
more ~/.terp/config/config.toml | grep 'trust_hash'
```

### Download Wasm
```sh
rm -rf ~/.terp/wasm

curl -o - -L https:/<YOUR_WASM_SNAPSHOT_ENDPOINT>/wasm.tar.lz4 | lz4 -dc - | tar -xf - -C $HOME/.terp
```

### Restart Node

```sh
sudo systemctl restart terpd
journalctl -u terpd -f
```