# Snapshot backup

The snapshot script will shutdown the node for as long as the archive and upload process takes, 
so use a dedicated node for creating snapshots. [See the README](/README.md#snapshot-restore) for the configuration options available.


## deploy.yml 
```yaml
---
version: "2.0"

services:
  node:
    image: ghcr.io/ovrclk/cosmos-omnibus:v0.3.3-terpnet-v0.1.0
    env:
      - MONIKER=my-moniker-1
      - CHAIN_JSON=https://raw.githubusercontent.com/ovrclk/net/master/mainnet/meta.json
      - SNAPSHOT_JSON=https://cosmos-snapshots.s3.filebase.com/akash/pruned/snapshot.json
      - FASTSYNC_VERSION=v0
      - PRUNING=nothing
      - S3_KEY=<s3-key>
      - S3_SECRET=<s3-secret>
      - SNAPSHOT_PATH=<bucket/path>
      - SNAPSHOT_TIME=00:00:00
      # - SNAPSHOT_DAY=* #(1-7)
      - SNAPSHOT_SIZE=214748364800 # 200GB in bytes
      - SNAPSHOT_METADATA_URL=https://<bucket>.s3.filebase.com/<path>
    expose:
      - port: 26657
        to:
          - global: true
    # params:
    #   storage:
    #     data:
    #       mount: /root/.akash

profiles:
  compute:
    node:
      resources:
        cpu:
          units: 4
        memory:
          size: 8Gi
        storage:
          size: 100Gi
          # - size: 100Mi
          # - name: data
          #   size: 400Gi
          #   attributes:
          #     persistent: true
  placement:
    dcloud:
      attributes:
        host: akash
      signedBy:
        anyOf:
          - akash1365yvmc4s7awdyj3n2sav7xfx76adc6dnmlx63
      pricing:
        node:
          denom: uakt
          amount: 1000

deployment:
  node:
    dcloud:
      profile: node
      count: 2
``` 
