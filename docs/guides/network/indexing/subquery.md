---
title: indexing - filter for specific historic data
sidebar_position: 2
---

# Subquery

## Guide 
This guide will walkthrough indexing all slashing events that have occured for a specific time period, including all delegators impacted, the amount of tokens slashed, and voting power.

## Requirements 
- [NodeJS](https://nodejs.org/en/): A modern (e.g. the LTS version) installation of NodeJS.
- [Docker](https://docker.com/): This tutorial will use Docker to run a local version of SubQuery's node.

## 0. Your Project Manifest File
The Project Manifest file is an entry point to your project. It defines most of the details on how SubQuery will index and transform the chain data.
For Cosmos chains, there are four types of mapping handlers (and you can have more than one in each project):

```js
{
  dataSources: [
    {
      kind: CosmosDatasourceKind.Runtime,
      startBlock: 9700000,
      mapping: {
        file: "./dist/index.js",
        handlers: [
          {
            handler: "handleEvent",
            kind: CosmosHandlerKind.Event,
            filter: {
              type: "execute",
              messageFilter: {
                type: "/cosmwasm.wasm.v1.MsgExecuteContract",
              },
            },
          },
          {
            handler: "handleMessage",
            kind: CosmosHandlerKind.Message,
            filter: {
              type: "/cosmwasm.wasm.v1.MsgExecuteContract",
            },
          },
        ],
      },
    },
  ],
}
```

Type | Description | |
--- | --- | --- | 
BlockHandlers |  On each and every block, run a mapping function| 
TransactionHandlers | On each and every transaction, run a mapping function | 
MessageHandlers | On each and every message that matches optional filter criteria, run a mapping function | 
EventHandlers | On each and every event that matches optional filter criteria, run a mapping function|

Note that the manifest file has already been set up correctly and doesn’t require significant changes, but you need to change the datasource handlers. This section lists the triggers that the manifest file looks for on the blockchain to start indexing.


## 1. Install Subquery CLI
Install SubQuery CLI globally on your terminal by using NPM. We **do not** encourage the use of `yarn global` for installing `@subql/cli` due to its poor dependency management. This may lead to multiple errors.

```shell
# NPM
npm install -g @subql/cli

# Test that it was installed correctly
subql --help
```

## 2. Initialise a new SubQuery Project

Run the following command inside the directory that you want to create a SubQuery project in:

```shell
subql init
```

You'll be asked certain questions as you proceed ahead, and will generate a new folder that is your project name.

## 3. Editing your SubQuery project
Navigating into the new project, you can see this is a working example SubQuery project.  

You can edit the SubQuery project by changing the following files:
- The project manifest in `project.ts` defines the key project configuration and mapping handler filters
- The GraphQL Schema (`schema.graphql`) defines the shape of the resulting data that you are using SubQuery to index
- The Mapping functions in `src/mappings/` directory are typescript functions that handle transformation logic

SubQuery supports various layer-1 blockchain networks and provides [dedicated quick start guides](https://academy.subquery.network/quickstart/quickstart.html) as well as [detailed technical documentation](https://academy.subquery.network/build/introduction.html) for each of them.