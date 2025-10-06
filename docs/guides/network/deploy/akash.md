---
title:  Using Akash To Deploy Servers
sidebar_position: 2
---

# What is Akash Network?

[Akash Network](https://akash.network) is a decentralized compute market, allowing permissionless auctions and bids on deployments of software images to hardware. This allows anyone to do thinks like host their own websites, or utilize available GPU's to run LLM & AI models. 

## Goal
This guide will cover a basic example to setup a public RPC & Sentry Node via resources rented on Akash. This is done with cosmos-omnibus,or as we like to call it, the **o-line**, a rotatable, proactively defesive front for your own validator infra.   

## STEP 1: Prepare SDL File 
On Akash, .sdl files are Server Description Language files that define the configuration and requirements for a server instance. To learn more on cull customization of SDL files, [view here](https://akash.network/docs/getting-started/stack-definition-language/)

### Multiple services 
SDL files can define multiple services, each with their own paramters defined. One sdl file can have 2 sentry  nodes, a seed node, and a validator in it.

### HTTPS/DNS support 
We want to ensure we are able to connect the human readable dns links to these endpoints, so we must set them in the sdl. **Example Addition for HTTPS/DNS in SDL**:

```yaml
expose:
    - port: 26657
    as: 80
    accept:
        - rpc.terp.network
        - www.rpc.terp.network
    to:
        - global: true
```

### Generic Image:
Add the following environment variables to the generic `cosmos-omnibus` to deploy with a Terp Network node:
```yaml
env:
  - CHAIN_ID=morocco-1  
  - MONIKER=YourNodeName
  - RPC_ADDR=:26657
  - P2P_ADDR=:26656
```

### Snapshots 
An o-line node is able to take snapshots of its state, and export the snapshot to an external storage provider. To enable this support, add the following values to the env:
```yaml
- S3_KEY=
- S3_SECRET=
- S3_HOST=
- SNAPSHOT_PATH=
- SNAPSHOT_TIME=22:45:00
- SNAPSHOT_SIZE=214748364800 # 200 GB
- SNAPSHOT_DIR=/root/.terp
- SNAPSHOT_METADATA=0
- SNAPSHOT_SAVE_FORMAT=tar.gz
```
### Sentry Configuration
Setting a centry involves deploying new nodes with private peers set as the nodes we do not want to expose to the public network. To do this set your private nodes peer id into the SDL of your centry node like so:
```yaml
- TERPD_P2P_PRIVATE_PEER_IDS=
- TERPD_P2P_UNCONDITIONAL_PEER_IDS=
```

### Load Balanced Setup
Here is [an example](https://github.com/akash-network/cosmos-omnibus/tree/master/_examples/load-balanced-rpc-nodes) of a deployment making use of nginx to load-balance request between two nodes.

## STEP 2: DEPLOY TO HARDWARE ON AKASH

## Akash Account    
First, we will need an account with at minimum 1 AKT token to place our ask. You can get this from your friend in exchange for some yard work, or you can purchase AKT with you credit card. 

## Akash Console
Akash Console is a helpful web-app for deployment creation and management on Akash. After accepting the terms & conditions, in the top-left corner you will find the button to create a new deployment.

Here, you will see a few options to choose from:

- **Hello World** Simple next.js web application showing hello world.
- **Rent Gpu's** - Rent GPUs from the Akash Network providers to run your AI workloads
- **Build Your Template** - With our new SDL Builder, you can create your own SDL from scratch in a few clicks!
- **Upload SDL** - upload a deploy.yml file from the computer

### SDL File
On Akash, .sdl files are Server Description Language files that define the configuration and requirements for a server instance. To learn more on cull customization of SDL files, [view here](https://akash.network/docs/getting-started/stack-definition-language/)


#### O-Line - Terp Network Template
O-Line *A Cosmos Omnibis Fork* is a repo containing docker images and configuration meant to make deploying onto Akash easy and standardized across cosmos. [Here you can find Terp Network's configuration](https://github.com/terpnetwork/o-line/tree/master/terpnetwork).


:::info 
the SDL within GitHub currently has a storage > size value of 120Gi. O-line uses a compressed snapshot of the blockchain and when expanded 120GB of storage for the deployment will not be enough. At the time of this writing adjusting the storage size to 350GB will suffice and allow some growth. Please adjust the storage appropriately and as shown in the screenshot below.
::: 

* Accept the initial deposit of 5 AKT into the deployment’s escrow account
* The escrow can be refilled easily within Cloudmos Deploy at any time
* Approve the transaction fee to allow the deployment to continue
* Select a provider from the bid list *(this is a big decision!)*
* Accept the transaction fee to create a lease with the provider
* Once the deployment is complete the lease details are shown
* After some time the Available/Ready Replicas fields will update to show the current node count. It may be necessary to refresh the screen for this count to update.


## Further Resources
- [Akash Documentation](https://docs.akash.network)