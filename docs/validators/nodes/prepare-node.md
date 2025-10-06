---
title: 3. initialize a node
sidebar_position: 3
---

# Initialize a node

A **moniker** is a human-readable name that represents the validator node. It's a way to identify your validator to other participants in the network, much like a username or a handle. It's intended to be easier to remember and recognize than the validator's public key or operator address, which are long and difficult to distinguish at a glance. The moniker shows the activity of your node on the block explorer.

You can set up the moniker of your node by launching the following command:

<Container>
<Tabs>
<TabItem value="testnet" label="testnet">

```bash
terpd init <YOUR_NODE_MONIKER> --chain-id 90u-4
```
</TabItem>
<TabItem value="mainnet" label="mainnet">

```bash
terpd init <YOUR_NODE_MONIKER> --chain-id morocco-1
```

</TabItem>
</Tabs>
</Container>

## Next Steps

Your node is now initialized in it's default configuration! From here, you can decide how to further configure your node, whether that is to:
-  [set up your nodes keys](./keys.md)
-  configure a node to be various endpoints, such as:
    -  [sentry node](../../guides/nodes/sentry)
    -  [archive node](../../guides/nodes/archive)
    -  [seed-node](../../guides/nodes/seed)
    -  [full-node](../../guides/nodes/full-node)

you can now set up the [node keys](./keys.md)