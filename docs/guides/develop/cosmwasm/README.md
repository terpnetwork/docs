---
title: my first cosmwasm
sidebar_position: 1
---
# Introduction

CosmWasm is a smart contract framework that is built on Rust and WebAssembly (WASM) to perform deterministic compute suitable for decentralized systems. It was born out of a desire to outgrow Solidity’s shortcomings.

To learn more about CosmWasm, check out its [official documentation.](https://book.cosmwasm.com/)

## CosmWasm Coming from EVM

There are a few key differences between the EVM and CosmWasm that you should be aware of. The most important one is that instances of contracts and the code that they run against are two different concepts in CosmWasm. This means that you can have multiple instances of the same contract code running at the same time, each with their own state. This is not possible in EVM, where the contract code and the contract instance are the same thing.

## Rust 

Diving one level deeper, we have the Rust programming language. While theoretically any language can be compiled to WebAssembly, Rust is the only language that is officially supported. This is because Rust is a systems programming language that is designed to be fast and extremely safe.

Learn more about Rust [here](https://www.rust-lang.org/), or learn by doing the [rustlings](https://github.com/rust-lang/rustlings/).