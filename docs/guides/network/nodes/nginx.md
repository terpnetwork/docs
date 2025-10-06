---
title: g. configure reverse proxy & DNS
sidebar_position: 6
---
A reverse proxy is a method to expose an application server to the internet. Full nodes will often have endpoints that bind to `localhost` with a TCP port.

 This means by default, your application will only be accessible locally on the machine it resides on. While you can specify a different bind point to force access through the internet, these application servers are designed to be served from behind a reverse proxy in production environments. This provides security benefits in isolating the application server from direct internet access, the ability to centralize firewall protection, and a minimized attack plane for common threats such as denial of service attacks.

From a client’s perspective, interacting with a reverse proxy is no different from interacting with the application server directly. It is functionally the same, and the client cannot tell the difference. A client requests a resource and then receives it, without any extra configuration required by the client.

To create an endpoint that others may use, we will want to configure our nodes into a setup which optimizes your endpoints UX, reliability & security. For this tutorial, we start from a basic Ubuntu server with a Terp Network Full Node installed.. 

## Requirements
This guide shows how to setup a node with custom HTTPS endpoints via Nginx, Certbot, and Cloudflare. 

## Installation

### 1.  Install nginx & certbot
```sh
sudo apt install nginx certbot python3-certbot-nginx
```

### 2. Setup nginx linked files

remove default nginx file
```sh
sudo rm -rf /etc/nginx/sites-available/default /etc/nginx/sites-enabled/default
```

setup nginx file for rpc/api
```sh
sudo nano /etc/nginx/sites-available/<your-endpoint-dns>
```

:::info
A template for the nginx configuration can be found [here](https://raw.githubusercontent.com/permissionlessweb/o-line-playbook/refs/heads/main/reverse-proxy/nginx/sites-available/rpc-api-grpc-peer). 

Credits to Reece from Strangelove for sharing the example this is derived from!!
:::

link `sites-available` to `sites-enabled` 
```sh 
sudo ln -s /etc/nginx/sites-available/<your-endpoint-dns> /etc/nginx/sites-enabled/
```

test configuration is good to go
```
sudo nginx -t 
```

restart nginx service
```
sudo systemctl restart nginx
```

### 3. Request SSL Certificates 

A quick & temporary way to setup ssl certificates is through Let’s Encrypt. To setup certificates for your endpoint, you will need to have pointed your DNS endpoints to your nodes ip address. 

Here, we setup certificates for RPC & API endpoints

```sh
sudo certbot --nginx -d <your-rpc-prefix>.<your-endpoint-dns> -d <your-api-prefix>.<your-endpoint-dns>
```


:::warning
note that this is just one example of how configuring a node with dns may be applied. Please do further research before deciding which method works best for you.
:::