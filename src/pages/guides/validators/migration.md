---
title: "Migration"
description: "Migrate validator keys and hosts safely"
status: "complete"
---
## Perform a node migration

There are a few reasons why migrating your validator node might be required. Some of those reasons may include changing the underlying infrastructure of the node, such as increasing performance or upgrading storage. It may also be necessary to migrate the node if it is not as reliable as expected.

When performing a node migration, there are several things to consider:

- **Data migration**: You will need to migrate any relevant data to the new node, such as blockchain data, application data, and configuration files.

- **Node configuration**: You will need to configure the new node with the same parameters as the old node, such as the chain ID, genesis file, and network settings.

There are a few tips that may help you with the node migration process:

- **Plan ahead**: Plan the migration carefully and ensure that you have a clear understanding of the process and the potential risks involved.

- **Back up your data**: Take a backup of all your data, including the blockchain data, application data, and configuration files, before starting the migration process.

- **Test the migration**: Before migrating your node to the new infrastructure, test the migration process on a testnet or a staging environment to ensure that everything works as expected.

- **Monitor the new node**: Monitor the new node closely after the migration to ensure that it is working properly and is in sync with the network.

- **Update your peers**: Once the migration is complete, update your peers and let them know that you have migrated your node to the new infrastructure.

## Backup the necessary files

In order to migrate or restore your validator node you need to have a backup of the following files located in the config folder:

You can find those files in the **~/.terpd/config** folder:

```bash
cd "${HOME}"/.terpd/config
```

Within that folder, you can find files that you need to back up:

- **priv_validator_key.json**
- **node_key.json**

Make sure to have a backup the mnemonic used to create your validator node.

If you customized your node, you may want to backup also the following files:

**config/config.toml**
**config/app.toml**

## Make sure the new node is fully synced

Start a new node with the [node guides](/guides) and make sure the new node is fully synchronized. The new node should have a **priv_validator_key.json** and new **node_key.json**.

Never run more than one node simultaneously with the same priv_validator_key.json, as this counts as double signing and your node will be slashed and permanently jailed.

Run the command:

```bash
terpd status
```

and look for the **sync_info** section. If the **catching_up** field is set to **false**, then your node is fully synchronized.

The output also shows the latest block height that your node is aware of.

## Stop the old node

Stop the old node to prevent it from signing transactions.

```bash
sudo systemctl stop terpd
```

In case you have Cosmovisor enabled, stop it with:

```bash
sudo systemctl stop cosmovisor
```

Make sure that the service has stopped and confirm on a [public RPC](/resources/public) (`terpd status`, voting power gone from the validator set) that the node is no longer signing blocks. You can also take precautionary steps by renaming **priv_validator_key.json** to **priv_validator_key.json_backup** and **node_key.json** to **node_key_backup.json**

## Replace the backed-up files

Now, stop the new node too, and double check that the service is no longer running. Once stopped, confirm the node dropped out of the signing set via a [public RPC](/resources/public). Backup the **priv_validator_key.json** and **node_key.json** files and replace them with the respective files from the old node. If the backed-up files are stored on your local machine you can execute the following to copy the files to your new node:

In case you made some changes to the **/.terpd/config/config.toml** and **/.terpd/config/app.toml** files, make sure to copy over those changes to the new node.

Once all required files are updated, restart the **terpd** or **cosmovisor** service. Check a [public RPC](/resources/public) to see the node signing blocks again.

## Add the old keys

Back up the keyring for your backend first (`--keyring-backend` defaults to `os`; file backends live under `~/.terpd/`), then run the following command to add the keys from the old node:

```bash
terpd keys add <key-name> --recover
```

You can then paste the old **mnemonic** which will add the account from the previous node to the keyring.
