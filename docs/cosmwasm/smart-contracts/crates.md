---
title: Crates
sidebar_position: 1
---

*Cargo is Rust's build system and package manager. Most Rustaceans use this tool to manage their Rust projects because Cargo handles a lot of tasks for you, such as building your code, downloading the libraries your code depends on, and building those libraries. (We call the libraries that your code needs dependencies.)*

Read more about [Cargo](https://doc.rust-lang.org/book/ch01-03-hello-cargo.html#hello-cargo) in the official [Cargo Book](https://doc.rust-lang.org/cargo/)

## Overview

Here's an overview of some common Cargo commands used:

- `cargo build`: Compiles your project and its dependencies.
- `cargo test`: Runs tests for your project and its dependencies.
- `cargo run`: Compiles and runs your project.
- `cargo update`: Updates your project's dependencies according to the specified version ranges in the Cargo.toml file.

## Workspaces

Cargo workspaces help manage multiple related projects within a single repository. To create and configure a workspace, add a workspace section to the Cargo.toml file, and list the project paths under the members key.

Example:

```yaml
[workspace]
members = [
  "project-1",
  "project-2",
  "project-3",
]
```

## Cargo.toml

The Cargo.toml file at the root of an cosmwasm project is called its [manifest](https://en.wikipedia.org/wiki/Manifest_file), and contains all of the metadata Cargo needs to compile the smart contract project and its dependencies. Every manifest file consists of one or more sections.

The following sections are some examples commonly found in cosmwasm projects:

- **package** - The first section in a Cargo.toml is always package and must include the metadata properties name and version
- **lib** - Library target settings
- **profile.release** - This section is for setting your build profile. Cargo has 4 built-in profiles: dev, release, test, and bench.
- **features** - Conditional compilation features
- **package.metadata.scripts** - This section is part of the cargo-run-script module, it's where scripts are defined. If you are familiar with node, cargo-run-script brings the npm run functionality to the Rust and Cargo ecosystem
- **dependencies** - Use this section for defining your project's dependencies for compilation and releases
- **dev-dependencies** - Use this section for defining your project's dependencies for examples, tests, and benchmarks

Check the Cargo book for the [full list](https://doc.rust-lang.org/cargo/reference/manifest.html) of possible sections and valid properties.

## Semantic Versioning

## Updating Dependencies

It's recommended to follow [CosmWasm development](https://github.com/CosmWasm/cosmwasm) and [release schedule](https://github.com/CosmWasm/cosmwasm/releases). As fixes or new features become available, it could be advantageous or critical to update your project dependencies.
The only challenging aspect of this process is that your dependencies may have their own dependencies. If you encounter a compilation error after updating a dependency, it is likely due to a change or addition in a sub-dependency.
