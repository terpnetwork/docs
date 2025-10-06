---
title: d. archive node tutorial
sidebar_position: 4
---

Archive nodes save the raw historical state of the blockchain for full nodes to reference. These require a large amount of storage.

## Solution
To setup an archive node, you will need to customize your nodes pruning settings. To do this, we can run the following command to update the setting located in `~/.terp/config/app.toml`:
```sh
sed -i -e "s/^pruning *=.*/pruning = \"nothing\"/" $HOME/.terp/config/app.toml
```

now your node will keep the entire state saved, without pruning. 


## Sync From Genesis Block Archive 

To sync from block height 1, you will need to ensure the node uses the proper versioning of terp-core dependent on the block height:

| Blocks From | Blocks To | Terp-Core Version | 
| -----------| -----------| ------------------| 
| `0`         | `2,847,602` | `barberry`      |  
| `2,847,603` | `3,039,061` | `v2`            | 
| `3,039,062` | `3,341,663` | `v3`            | 
| `3,341,664` | `current`   | `v4`            | 


## Archive Peers
```sh
PEERS="d6827d32e38faa3a7ea3b7d1128a16bc873fa6b1@207.244.254.232:26656"
sed -i -e "/^\[p2p\]/,/^\[/{s/^[[:space:]]*persistent_peers *=.*/persistent_peers = \"$PEERS\"/}" $HOME/.terp/config/config.toml
```