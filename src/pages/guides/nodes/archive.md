---
title: "Archive Node"
description: "Run a node that keeps full history"
---

An archive node keeps every historical state (`pruning = "nothing"`). It needs far more disk than a pruned node, but it can answer queries at any height.

## Configure pruning

In `~/.terpd/config/app.toml`:

```sh
sed -i -e 's/^pruning *=.*/pruning = "nothing"/' $HOME/.terpd/config/app.toml
```

Restart the node. From here on it retains everything — it does not backfill history it already pruned.

## Syncing an archive

Syncing from genesis replays the entire chain and takes a long time. Faster: restore a published archive pack if one is fresh, then let the node follow head:

```bash
# same layout as the daily packs, under archive/
curl -s https://s3.terp.network/snapshots/mainnet/morocco-1/archive/snapshot.json | jq -r .latest
```

Compare the pack height against the live tip first — a stale archive means replaying the gap anyway. Run the binary matching the network's current release ([Install](./install)); historical heights may need older binaries, see [Upgrades history](/guides/validators/upgrades-history).

## Disk planning

Archive data grows monotonically. Give the node dedicated NVMe storage, monitor disk usage with the same [monitoring](/guides/validators/monitoring) stack as validators, and never run an archive and a validator on the same host competing for I/O.
