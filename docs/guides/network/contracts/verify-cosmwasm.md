---
title: b. verify code
sidebar_position: 2
---

# Verifying A CosmWasm Code Contract

We can verify any contract on chain with a few simple commands. Let's consider a practical example: you have an active contract on the blockchain, and you need to determine its code name and version.

## Inspect code
We can query the contract information using the following command:
```
terpd query wasm contract <address-here> --output json  | jq
```

## Find the original code

The hashes for the smart contracts are usually published alongside the contract code, which can be found at their github repositories inside a checksums.txt file. Here is an example:
```
fe34cfff1cbc24594740164abb953f87735afcdecbe8cf79a70310e36fc13aa0  cw1155_base.wasm
6c1fa5872e1db821ee207b5043d679ad1f57c40032d2fd01834cd04d0f3dbafb  cw20_base.wasm
```

## Compile yourself
Instead of relying on pre-existing hashes, we can generate the hash for our contract ourselves. We can use [rust-optimizer](https://github.com/CosmWasm/rust-optimizer) not only to create performant and compact code, but also to ensure that the output code is deterministic and can be compared accurately. In fact, the hashes provided in the previous example were all produced using rust-optimizer.


The hashes will be generated at `./artifacts/checksums.txt`.

## Compare Hashes
You can find the value and compare it to the value we obtained.

```
cat ./artifacts/checksums.txt | grep contract.wasm
dc02d33e40511396a5895ac0b1c3b9d53803e115f605ad5cbfe8035a031bbd3f  contract.wasm
```

If the hashes do match, then the contract is verified.
