---
title: front end UI
sidebar_position: 1
---
**This guide will show you how to setup a minimal template for creating an application.** We will be using **[Cosmology](https://cosmology.tech)**, an exellect package library specifically for network using Cosmos-SDK.
___
# Introduction

Distributed applications (dApps) are software applications that run on distributed networks. Blockchains provide persistent data, or the state, as well as persistent processes and logic. A user interface is important in most cases, and server interactions are important in many cases.

There are many ways to build a dapp that can connect & communicate with Terp Network.

## The Server \ Client Tech

Often, applications grapple with multple or heavy computations, as well as the challenge of securing sensitive communication like passwords and wallet keys on public websites. The client-server model, akin to a farmers market, offers a straightforward solution.

 Imagine the client as a shopper making a request. a reliable vendor selling goods (the server), takes requests from clients. The client **requests** specific items, and if the server both **speaks the same language** as the request, and **can provide** that specific request from the client, the transfer is made.

**This is how applications work when communicating with Terp Network.** 

Web-apps are usually both a server and client. It serves the HTML code for the components of the app, and also can make request to other servers to use in its own processes. 

If we have built a web-app and have a component that queries & displays my token balance, the communication flow for that request will look like:

 `my-device --> web-app --> blockchain-node --> web-app --> my-device`  
 
  Notice that the web-app will translate the balance request, then request a public-endpoint of Terp Network, which will provide a response back to the web-apps server, which can then provide a response back to my device.

:::info
*Its important to highlight a web-app may have multiple databases it uses to store data, usually to improve the user experience such as query & data population times. These are preconfigured prior to deployment of the web-app. [DAO DAO UI](https://github.com/da0-da0/dao-dao-ui) is a great example of a web-app acting as a client and taking use of indexer servers.*
:::


** In this guide, we will show you how to setup a web-app which will act as both a client & server, for communicating with Terp Network.** 
