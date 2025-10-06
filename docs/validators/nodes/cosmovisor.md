---
title: 6. automation via cosmovisor
sidebar_position: 6
---

## What is cosmovisor?

Cosmovisor is a powerful utility for managing the binary version of Cosmos SDK-based chains. Its primary function is to enable seamless binary upgrades without requiring a full node restart or manual intervention. In essence, Cosmovisor provides for automated processes to handle upgrades, reducing downtime or manual intervention.

Even when automatic upgrades are not enabled, Cosmovisor remains a valuable tool for managing different versions of the **terpd** binary. It simplifies the process of managing different versions of the binary by automatically switching to the appropriate binary version based on the block height. This helps reduce potential errors or missed upgrades during the manual process, allowing validators to maintain their nodes with greater ease and accuracy.

While Cosmovisor can **also** automate the process of downloading and installing new binaries, it's important to note that node operators bear the responsibility of ensuring the binaries they are running are trustworthy. Therefore, even when using Cosmovisor, it is recommended for operators to remain vigilant of upgrade proposals and verify new binaries independently.

In cases where a node operator prefers or requires a greater degree of control, manual upgrades are preferable.
:::danger
Make sure you have backed up the key mnemonic before removing any of your keys, as there will be no way to recover your key without the mnemonic.
:::

:::

## Install

To install the latest version of cosmovisor, run the following command:

```bash
go install cosmossdk.io/tools/cosmovisor/cmd/cosmovisor@latest

# To install a previous version, you can specify the version after the @ sign. Note that versions older than 1.4.0 can also target a specific version, at a slightly different location:
go install github.com/cosmos/cosmos-sdk/cosmovisor/cmd/cosmovisor@v1.0.0
```

{% hint style="danger" %}
When using cosmovisor, make sure that you do not have auto download of binaries on. Ensure you have the environment variable `DAEMON_ALLOW_DOWNLOAD_BINARIES` set to `false`.
{% endhint %}

Your installation can be confirmed with:

```bash
which cosmovisor
```

This will return something like:

```bash
/home/<your-user>/go/bin/cosmovisor
```

## Add environment variables to your shell

In the `.profile` file, usually located at `~/.profile`, add:

```bash
export DAEMON_NAME=terpd
export DAEMON_HOME=$HOME/.terp
```

Then source your profile to have access to these variables:

```bash
source ~/.profile
```

You can confirm success like so:

```
echo $DAEMON_NAME
```

It should return `terpd`.

## Set up folder structure

Cosmovisor expects a certain folder structure:

```bash
.
├── current -> genesis or upgrades/<name>
├── genesis
│   └── bin
│       └── $DAEMON_NAME
└── upgrades
    └── <name>
        └── bin
            └── $DAEMON_NAME
```

Don't worry about `current` - that is simply a symlink used by Cosmovisor. The other folders will need setting up, but this is easy:

```bash
mkdir -p $DAEMON_HOME/cosmovisor/genesis/bin && mkdir -p $DAEMON_HOME/cosmovisor/upgrades
```

### Set up genesis binary

Cosmovisor needs to know which binary to use at genesis. We put this in `$DAEMON_HOME/cosmovisor/genesis/bin`.

First, find the location of the binary you want to use:

```bash
which terpd
```

Then use the path returned to copy it to the directory Cosmovisor expects. Let's assume the previous command returned `/home/your-user/go/bin/terpd`:

```bash
cp $HOME/go/bin/terpd $DAEMON_HOME/cosmovisor/genesis/bin
```

## Cosmovisor init

Post v1 versions of Cosmovisor have a command that will create the directories and copy the `terpd` binary into the proper directory. To create the directories and copy the binary, run this command:

```bash
cosmovisor init $HOME/go/bin/terpd
```

Once you're done, check the folder structure looks correct using a tool like `tree`.

## Set up service

Commands sent to Cosmovisor are sent to the underlying binary. For example, `cosmovisor version` is the same as typing `terpd version`.

Nevertheless, just as we would manage `terpd` using a process manager, we would like to make sure Cosmovisor is automatically restarted if something happens, for example an error or reboot.

First, create the service file:

```bash
sudo nano /etc/systemd/system/terpd.service
```

Change the contents of the below to match your setup - `cosmovisor` is likely at `~/go/bin/cosmovisor` regardless of which installation path you took above, but it's worth checking.

**Note** `cosmovisor run start` is only for the latest versions of cosmovisor. For earlier versions that line should be:

```
ExecStart=/home/<your-user>/go/bin/cosmovisor start
```

```
[Unit]
Description=Terp Network  (cosmovisor)
After=network-online.target

[Service]
User=<your-user>
ExecStart=$HOME/go/bin/cosmovisor run start
Restart=always
RestartSec=3
LimitNOFILE=4096
Environment="DAEMON_NAME=$DAEMON_NAME"
Environment="DAEMON_HOME=$DAEMON_HOME"
Environment="DAEMON_ALLOW_DOWNLOAD_BINARIES=false"
Environment="DAEMON_RESTART_AFTER_UPGRADE=true"
Environment="DAEMON_LOG_BUFFER_SIZE=512"

[Install]
WantedBy=multi-user.target
```

## Sync With Snapshot
:::warning
If syncing from a snapshot, do not start Cosmovisor yet.
:::


## Start Cosmovisor
Finally, enable the service and start it.

```bash
sudo -S systemctl daemon-reload
sudo -S systemctl enable terpd
# check config one last time before starting!
sudo systemctl start terpd
```

Check it is running using:

```
sudo systemctl status terpd
```

If you need to monitor the service after launch, you can view the logs using:

```bash
journalctl -fu terpd
```

