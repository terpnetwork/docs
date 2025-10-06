---
title: a. deploy a contract to a network
sidebar_position: 1
---

# Deploying A CosmWasm Contract

The following is detailed guide that shows the basics of manually deploying a contract to a Terp Network local environment.

# Deploy contract
In the [Compile Contract](../../cosmwasm/getting-started/compile-a-contract) page, we generated a wasm binary executable. You can upload the code to the blockchain, and once the process is complete, you can download the bytecode for verification purposes.

### Deploy using terpd
Now you will store the wasm bytecode of the **cw_counter** contract on chain and obtain the **code id**. This **code id** will be used later to create an instance of the **cw_counter** contract.
```sh
terpd tx wasm store contract.wasm --from testnet-key --gas-prices 0.025uthiolx --gas-adjustment 1.7 --gas auto
```

The following is an easier way to get the Code Id from the response:
```sh
terpd q tx [hash] | jq 
# or use sed to return just the code_id
terpd q tx [hash] | sed -n 's/.*"key":"code_id","value":"\([^"]*\)".*/\1/p'
# or check the block explorer
https://testnet-ping.pub/terp/tx/[hash]
```
You can see the list of contracts instantiated using the CODE_ID generated above by executing the following command:
```sh
terpd q wasm list-contract-by-code $CODE_ID 
```
The response should be an empty list since no contracts have been instantiated yet.
```json
{"contracts":[],"pagination":{"next_key":null,"total":"0"}}
```
Before you instantiate a contract using the Code Id and interact with it, let's verify if the code stored on the blockchain is indeed the **cw_namespace.wasm** binary you uploaded.

Download the wasm binary from the chain and compare it to the original one:
```sh
terpd q wasm code $CODE_ID download.wasm
```
The two binaries shoud be identical:
```sh
diff artifacts/cw_nameservice.wasm download.wasm
```
If the **diff** command yields an empty output, this indicates that the two files being compared are identical.

# Instantiating the contract

You can now create an instance of the wasm contract. After instantiation, you can make queries and execute transactions.

```sh
terpd tx wasm i <code_id_here> '{"msg_name_here":{}}' --from testnet-key

```

# Contract Interaction
Now that the contract is instantiated, you can register a name and transfer it to another address by paying the transfer fee.

to get the contract address from the code-id tx:
```sh 
terpd q tx <tx_hash> -o json | jq -r '.logs[].events[] | select(.type == "instantiate") | .attributes[] | select(.key == "_contract_address") | .value)'
```