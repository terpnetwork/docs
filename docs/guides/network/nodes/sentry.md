---
title: b. sentry node array tutorial 
sidebar_position: 2
---

We must keep in mind that p2p networks are exposed to the risk of denial of service attacks, and an effective way to mitigate this type of attacks is by using sentry nodes.

### Why is it important to avoid denial of service attacks?
When our node is suffering a denial of service attack that cannot be mitigated by the server provider, it is likely that the server will be inoperative for the duration of the attack because, being saturated, it will stop responding to the requests made by the rest of the nodes in the network.

If our node becomes inoperative, it means that we are no longer participating in the consensus rounds, our node will not be signing blocks or generating rewards for the delegators and therefore in a few minutes the node will be jailed and penalized.

In addition to being a risk for node operators due to the penalties involved in being jailed, it is also a risk for the network, since if an attack is carried out on several nodes at the same time, the stability and security of the network would be affected.

## Sentry nodes hide our validator's IP from the world
Using sentry nodes is a solution to prevent the rest of the network from knowing the IP of our validator node, but allowing our validator node to continue communicating with other validator nodes in the terp network, since if the node were 100% isolated, it would not be able to participate in the network and therefore would not generate rewards for the delegators.

:::info
A sentry node is a bridge between our validator node and the rest of the network, so that the rest of the network does not know the IP of the validator node, but the IP of the sentry nodes.
:::

### Can sentry nodes suffer denial of service attacks?
Yes, but as they are nodes that are not validating transactions and only act as a bridge between the network and the validating node, we could quickly deploy new sentry nodes or even change the IP of the sentry node being attacked.

### How many sentry nodes can there be?

There is really no maximum number, the more sentry nodes we have, the more resistance to denial of service attacks our validator node will have. However, it must be taken into account that the more sentry nodes we have, the more complex it will be to maintain our nodes when carrying out maintenance or upgrades, in addition to the increase in server costs. You should have at least two sentry nodes and if possible have one of them in a different datacenter from where the validator node is deployed.

### Where should the sentry nodes be deployed?
If two sentry nodes are going to be mounted, one of them could be deployed in the same datacenter where our validator node is, this will reduce the latency between both servers, and therefore, the connection between both servers will be quite fast. The other sentry node could be located in a different datacenter; this way, in case the network of the datacenter where our validator node is down for any reason, we would always have a node with the current block available to synchronize our validator node.


## Step by step guide
To follow this guide, we will use a node created & connected to 90u-4 testnet network. In case you have not deployed the node yet, [how to install the terp-core binary](../../validators/nodes/installation)

### Creating the sentry nodes
Once we have contracted the two sentry node servers and we have the access IPs, we must perform the same installation that we would perform as if it were a validator node on both servers.

First, we will need to download and compile the terp-core binary.


```
git clone https://github.com/terpnetwork/terp-core.git
cd terp-core
git checkout <version>
```


Once downloaded, we will proceed to compile the binary:

```
make install
```

It will also be necessary to initialize the node so that the .terp directory is created, for this we can use the following commands, each one in the corresponding server:

**On sentry node A:**
```
terpd init "terpd-up - Sentry A" --chain-id 90u-4
```
**On sentry node B:**
```
terpd init "terpd-up - Sentry B" --chain-id 90u-4
```
Once the previous step is done, the .terp folder will already exist, so we can download the genesis.json file:

```
curl https://raw.githubusercontent.com/terpnetwork/networks/main/testnet/90u-4/genesis.json > ~/.terp/config/genesis.json
```

### Configure service
Finally, we will configure the terp service:

```
sudo nano /etc/systemd/system/system/terpd.service
```

```
sudo tee /etc/systemd/system/terpd.service > /dev/null <<EOF
[Unit]
Description=terpd Daemon
After=network-online.target
[Service]
User=$USER
ExecStart=$(which terpd) start
Restart=always
RestartSec=3
LimitNOFILE=65535
[Install]
WantedBy=multi-user.target
EOF
```

### Base configuration of the sentry nodes
For now we have not done anything different from what we would do when setting up a validator node, although we have stopped doing several things, such as creating the wallet or running the validator creation command "tx staking create-validator", since we do not want to create validator nodes, only nodes that synchronize with the rest of the nodes in the network and we can use to synchronize our validator node in a secure way without exposing our IP to the rest of the network.

The sentry nodes (both), must have peers to be synchronized at all times, we will add the following peers to the config.toml file inside the config folder.

#### Persistent Peers: 
```
peers=$(curl -s https://ss.terp.nodestake.top/peers.txt)
sed -i.bak -e "s/^persistent_peers *=.*/persistent_peers = \"$peers\"/" ~/.terp/config/config.toml
```
Note: the peers were obtained from Nodestake validator team.

It would also be advisable to add as persistent peer the sentry nodes between them. That is to say, that the sentry node B is persistent peer of the sentry node A, in the same way that the sentry node A is persistent peer of the sentry node B; this will make us have more redundancy.

#### Private Peers:

```
In the config.toml file of the config folder of the sentry nodes (both), it is necessary to specify the id of the validator node in the private_peer_ids parameter. This is so that our sentry nodes never share with the rest of the peers of the network the existence of our validator node.
```

**If you don't know how to get the id of your validator node, you can get it with the following command:**
```
terpd tendermint show-node-id
```

#### Unconditional Peers
In the same configuration file, we will also find the unconditional-peer-ids parameter to which we must add our validator node as we did with the private_peer_ids parameter. This step is necessary because the nodes have a limited number of peers to which they can connect.

To avoid the risk of leaving our validator node incommunicado, by setting its id in the unconditional-peer-ids parameter, we will make the sentry nodes always connected to the validator node even if the limit of peers to which they can be connected has been exceeded. Optionally we can also add in this same parameter (separated by commas) the homologous sentry node to guarantee that the sentry nodes will always be connected to each other.

```unconditional-peer-ids = "validator node, peer sentry node".```

#### Start Sentry Nodes 
At this point, we could start our sentry nodes and let them synchronize and be discovered by the rest of the network. For that we will use the following command:
```
sudo systemctl daemon-reload
sudo systemctl enable terpd
```


### Base configuration for validator 
Once the sentry nodes have been synchronized, we can configure the validator node with all certainty that our validator node is not going to stop being synchronized with the network. We will have to edit the config.toml file in the config folder, where we will find the following lines:

#### Persistent Peers
In persistent_peers we will add only the ids of the sentry nodes, that is to say that if the node was already mounted before, we will have to delete the content of this field before adding our sentry nodes.

#### PEX
In the same configuration file we will find the pex parameter, which we must set to "false". This parameter does not discover other peers, it will only use the ones set in the persistent_peers parameter.
```
pex = false
```

#### Remove address book (optional)
If the validator has already been exposed to the network, we can delete the address book so that it only "knows" the sentry nodes; if it is a validator that has never been started, this step is not necessary. Once inside the config folder and with the node stopped, perform the following command:

```
rm -rf $HOME/.terp/config/addrbook.json 
```

#### Start Validator Node
To verify that we are really connected only to two peers and these are the sentry nodes, we can write the following command in our validated node; the output is a JSON where it will show us the number and which peers we are connected to, where the number should be two and the peers should be our sentry nodes.

curl -s localhost:26657/net_info
Here you can see the number of peers to which our validator node is connected, in this case it is two, which is correct.


### Extra: Protecting the validator node through firewall

Right now the p2p port of our validator node is open and anyone can establish a connection. If we have just set up the validator node, with the configurations made, nobody would have to find our validator node, however, to add a plus of security it is advisable to close the p2p port and only allow traffic to the IP's of our sentry nodes.

There are several ways to do this, it is possible that your server provider allows you to do it through a gui. Ufw is a simple to use alternative.

### Extra: Private networks
One possibility we have when our validator node is in the same datacenter as one of the sentry nodes, would be to use private addressing.

In case we want to use private addressing, we will have to edit the addr-book-strict parameter of the config.toml file and set it to false in both the validator node and the sentry node that are communicating under private addressing. This parameter, when set to "true", will only add routable addresses to the address book, the private addresses defined in RFC-1918 are not routable, therefore, they would not be added to the address book, so we will have to change it to false to be able to use IP addresses from the private ranges.

:::info
addr-book-strict: boolean. By default, nodes with a routable address will be considered for connection. If this setting is disabled (false), non-routable IP addresses, such as addresses from a private network, can be added to the address book.
Source: https://docs.tendermint.com/master/nodes/validators.html
:::

### Conclusions

Having sentry nodes will not only help our validator node not to fall victim to a denial of service attack, but will also make the Terp network more robust. The installation of the sentry nodes does not differ much from that of a validator node, and the additional configurations to be performed are very simple and intuitive.

Now that Terp Network is doing the 90u-4 testnet, it is a good time to try to set up sentry nodes and once the mainnet is launched, to be able to replicate it with the experience of having been able to test it in 90u-4. If you already have your node on 90u-4, what are you waiting for to set up your sentry nodes and protect yourself from unwanted attacks?


:::info
sources:
https://stakely.io/en/blog/how-to-deploy-sentry-nodes-in-the-archway-network
:::