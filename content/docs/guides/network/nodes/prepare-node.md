---
title: Prepare Node
description: A moniker is a human-readable name that represents the validator node. It's a way to identify your validator to other participants in the network, much like a...
status: partial
---
## Initialize a node

A **moniker** is a human-readable name that represents the validator node. It's a way to identify your validator to other participants in the network, much like a username or a handle. It's intended to be easier to remember and recognize than the validator's public key or operator address, which are long and difficult to distinguish at a glance. The moniker shows the activity of your node on the block explorer.

You can set up the moniker of your node by launching the following command:

<Tabs>
<Tab value="testnet" label="testnet">

```bash
terpd init <YOUR_NODE_MONIKER> --chain-id 90u-4
```

</Tab>
<Tab value="mainnet" label="mainnet">

```bash
terpd init <YOUR_NODE_MONIKER> --chain-id morocco-1
```

</Tab>
</Tabs>

## Next Steps

Your node is now initialized in it's default configuration! From here, you can decide how to further configure your node, whether that is to:

- [set up your nodes keys](./keys.md)
- configure a node to be various endpoints, such as:
  - [sentry node](/docs/)
  - [archive node](/docs/)
  - [seed-node](/docs/)
  - [full-node](/docs/)

you can now set up the [node keys](./keys.md)
