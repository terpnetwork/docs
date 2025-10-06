---
title: grasping ibc channels, clients, connections and more.
sidebar_position: 1
---

## Goals 

- describe how ibc protocol works
- describe the lifecycle of an ibc transaction
- describe ibc-denoms

## IBC Transport Layer

The transport layer consists of 4 specific items:
- light clients
- connection
- channels
- ports

### Light Clients
IBC clients are able to track and effeciently vverify the validity of cross-chain transactions, without the need for an intermediary. A client can be associated with any number of connections to a counterparty chain. 

#### Client State
- proofs - block of recent proof must be in a light client state.

**IF A CLIENT IS NOT UPDATED WITHIN THE `TrustingPeriod`, THE CLIENT WILL EXPIRE**

### Connections
Connections are responsible for facilitation all cross-chain verifications on an IBC state. connections have many channels, but only one light client of the counterparty chain. The connection handshake is responsible for verifying the light clients on each chain are the correct ones for their respective counterparties.

### Channels
A user or module on one blockchain can communicate with a other modules on other blockchains by sending, recieving, and acknowledging packets through channels that are uniquely identified by the (`channelId`, `portId`) tuple. Each channel consists of 2 clients. 1 client for each connected chain/zones.

Just like connections, channels are established with a handshake.

`ORDERED` channels process packets in order they were sent.
`UNORDERED` channels process packets in order they arrive.

### Ports
IBC modules can bind to any number of ports. Each port is identified by unique portID. the `portId` denotes the type of application. 

`transfer` is the `portID` for fungible token transfers

## New Connection Workflow

Establishing an IBC connection (for example, between chain A and chain B) requires four handshakes:

- `OpenInit`
- `OpenTry`
- `OpenAck`
- `OpenConfirm`

### Initialize Connection A  
`OpenInit` initializes any connection which may occur. It is like an identifying announcement from the IBC module on chain A which is submitted by a relayer. 

### Try Open Conection B
`OpenTry` is where chain B verifies the identity of chain A according to information that chain B has about chain A in its light client (the algorithm and the last snapshot of the consensus state containing the root hash of the latest height as well as the next validator set). It also responds to some of the information about its own identity in the OpenInit announcement from chain A.

### Acknowledge Open Connection A
`OpenAck` is very similar to the functionality of OpenInit, except that the information verification now occurs for chain A.

### Confirm Open Connection B
`OpenConfirm` is the final handshake, in which chain B confirms that both self-identification and counterparty identification were successful.


## New Channel Workflow 
Similarly to how connections are established, channels are established through a four-way handshake, in which each step is initiated by a relayer:


### Initialize Channel A 
`ChanOpenInit`: will set the chain A into `INIT` state. This will call `OnChanOpenInit` so application A can apply the custom callback that it has set on `INIT`, e.g. check if the port has been set correctly, the channel is indeed unordered/ordered as expected, etc. An application version is also proposed in this step.

### Try Open Channel B

`ChanOpenTry`: will set chain B into `TRY` state. It will call `OnChanOpenTry` so application B can apply its custom `TRY` callback. Application version negotiation also happens during this step.

### Acknowledge Open Channel A

`ChanOpenAck`: will set the chain A into `OPEN` state. This will call `OnChanOpenAck` which will be implemented by the application. Application version negotiation is finalised during this step.

### Confirm Open Channel B

`ChanOpenConfirm`: will set chain B into `OPEN` state so application B can apply its `CONFIRM` logic.

## IBC denoms

### How are IBC denoms derived?
This code is how a denomnication for a token is standardized for the IBC protocol:
```go
// hash() representing a SHA256 hashing function returning a string
ibc_denom := 'ibc/' + hash('path' + 'base_denom')
```

___
> Sources:
* https://ida.interchain.io/
>