---
title: 2. installation
sidebar_position: 2
---
To get started developing on the Terp Network, you will need to have the the following dependencies installed.

# Required Dependencies

- [Go](#golang 'Install Go')
- [Rustc](#rustc 'Install Rust')
- [Cargo](#cargo 'Install Cargo')
- [Cargo Generate](#cargo-generate 'Install Cargo Generate')
- [wasm32](#wasm32 'Install wasm32')
- [Terpd](#terpd 'Install Terp Network Daemon')
- [Node.js](#nodejs-and-npm 'Install Node.js and NPM')


# <a href="https://docs.docker.com/get-docker" target="_blank" title="Install Docker">Docker</a> 

For local installations, you need root access to run **docker**. Make sure to follow all the steps with **root** access to prevent conflicts and confusions on the deployment process which requires root permission.

If you prefer, you can use Docker Engine instead of Docker Desktop.

# <a href="https://go.dev/doc/install" target="_blank" >Golang</a>

In order to run **terpd**, you will need to install <a href="https://go.dev/doc/install" target="_blank" >Golang</a>.

# <a href="https://www.rust-lang.org/" target="_blank" title="Rust Homepage">Rust</a> 
The compiler for the Rust programming language. **rustc** takes your Rust source code and produces binary code as a library or an executable.

To install Rust, follow the instructions for your operating system <a href="https://www.rust-lang.org/tools/install" target="_blank" title="Install Rust">here</a>.

# [Cargo](https://doc.rust-lang.org/cargo/)
Cargo is the Rust package manager, like **go get** for Golang or **npm** is for JavaScript. Cargo comes with Rust if you installed **rustc** using **rustup**.

If you did not already install **rustc** with **rustup**, or don't have **cargo** in your command line path, see the instructions for installing Cargo <a href="https://doc.rust-lang.org/cargo/getting-started/installation.html" target="_blank" title="Install Rust">here</a>.

# `wasm32-unknown-unknown`

The wasm32 rustup target is a 32-bit "bare wasm" module for producing WebAssembly output that makes zero assumptions about your host machine and environment (hence the -unknown-unkown suffix). It's required by the Developer CLI, as of version 1.2.1, for optimizing wasm output for on-chain storage of binaries.

Install wasm32 using the following command:


```bash
rustup target add wasm32-unknown-unknown
```
# just

## Node.js & Npm

NPM is a package manager for JavaScript and Node.js.


# Terpd

**Terpd** is the command-line-interface & node software for Terp Network.

You can download the latest release of the pre-built binary from the <a href='https://github.com/terpnetwork/terp-core/releases' target='_blank'>releases page</a>.
