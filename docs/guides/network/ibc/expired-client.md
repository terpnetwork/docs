---
title: expired-client
sidebar_position: 2
---

## Goal
In this guide, we review why and how IBC clients expire, as well as review the process to update an expired client.


## Why Do Clients Expire?

### Trusting Period
Clients expire when `TrustingPeriod` has passed since the last updated client state. This is usually due to lack of use of the ibc channel, or lack of active relayers.

It is recommended that `TrustingPeriod` should be set as 2/3 of the `UnbondingPeriod` of the network.


## How is a Client Updated Normally?
These command are usually ran by a relayer during the ibc transaction workflow to update the state of a client for a channel:

<Container>
<Tabs>
<TabItem value="hermes" label="hermes">

```sh
hermes update client --host-chain <chain-id> --client <client>
```

</TabItem>

<TabItem value="rly" label="rly">

```sh
rly tx update-clients <path-name>
```

</TabItem>
</Tabs>
</Container>

### Steps to carry out the process of reviving the IBC client:
1. Determine which client is expired and on which host chain
2. Create a new client on that host chain
3. Push a proposal on-chain that replaces the expired client-id with an active newly created one
4. Check if the channel is once again operational

## 1. Check for Expired Clients 
You will know if a client is expired if your ibc tx fails, and the error logs communicates that the client is expired. You can also get the status of a client with:

<Container>
<Tabs>
<TabItem value="hermes" label="hermes">

```sh
hermes query client state --chain chain-id --client 07-tendermint-123

```

</TabItem>

<TabItem value="rly" label="rly">

```sh
rly q clients-expiration hostchain-counterpartychain
```

</TabItem>
</Tabs>
</Container>

## 2. Create a New Client on Host Chain 
<Container>
<Tabs>
<TabItem value="hermes" label="hermes">

```sh
hermes tx client

```

</TabItem>
<TabItem value="rly" label="rly">

```sh
rly tx clients terpnetwork-secretnetwork --override
```
</TabItem>
</Tabs>
</Container>

## 3. Create Governance Proposal To Update Expired Client

to propose to update an expired client:
```sh
terpd tx gov submit-legacy-proposal update-client [subject-client-id] [substitute-client-id] [flags]
```

### References 

- [simply-staking guide](https://medium.com/simplystaking/reviving-an-ibc-client-with-governance-hermes-relayer-362a1da4814d)
- [ida-documentation](https://ida.interchain.io/)