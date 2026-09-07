---
title: Install
description: This guide provides instructions on how various methods to install and run a full node on the Terp Network blockchain.
status: partial
---
This guide provides instructions on how various methods to install and run a full node on the Terp Network blockchain.

## Option 1: Build from source

### Build Terp-Core from source

```bash
# from $HOME dir
git clone https://github.com/terpnetwork/terp-core
cd terp-core
git fetch
git checkout <verison-tag>
```

The `&lt;version-tag>` for `morocco-1` is
The `&lt;version-tag>` for `90u-4` is

## Ensure that terpd is installed

Do the following to build and install the terpd daemon:

```bash
cd terp-core
make install
```

You can now verify that **terpd** has been correctly installed by launching:

```bash
terpd version
```

The version you installed should be returned.

## Option 2: Use the pre-built binary

### Download the binary

Binaries are on `s3.terp.network` under `releases/terp-core/<tag>/` (ADR-11). Prefer `curl -sL https://terp.network/get | bash`.

For Linux:

<Tabs>
<Tab value="amd64" label="amd64">

```bash
wget https://s3.terp.network/releases/terp-core/v5.2.0/terpd-5.2.0-linux-amd64.tar.gz
tar -xzf terpd-5.2.0-linux-amd64.tar.gz
```

</Tab>
<Tab value="arm64" label="arm64">

```bash
wget https://s3.terp.network/releases/terp-core/v5.2.0/terpd-5.2.0-linux-arm64.tar.gz
tar -xzf terpd-5.2.0-linux-arm64.tar.gz
```

</Tab>
</Tabs>

## Verify the integrity of the binary

You can now verify the download by generating the sha256 hash for the downloaded file:

<Tabs>
<Tab value="amd64" label="amd64">

```bash
sha256sum terpd_linux_amd64
// returns:
```

</Tab>
<Tab value="arm64" label="arm64">

```bash
sha256sum terpd_linux_arm64
// returns:
```

</Tab>
</Tabs>

## Use Docker

### Build or Pull the docker image

You can pull the docker image from the following repositories:

- **[End to End Repo](https://github.com/terpnetwork/terp-core/pkgs/container/terp-core-e2e)**

Make sure to always use the image tag that points to the network you want to connect.

You can build a docker image locally by running this command in the root of the terp-core repository:

```bash
docker build -t terpnetwork/terp-core:<version-info> .
```

This will generate a docker image locally, named `terpnetwork/terp-core:&lt;version-info>`.

## Set up the PATH

By default, the Docker image runs the `terpd` binary, so you should specify the arguments for `terpd` right after the image name. For better usage, mount an external volume at `/root/.terp` to persist the daemon home path across different runs. For example, if you want to add a key:

```bash
docker run --rm -it \
  -v ~/.terp:/root/.terp \
  terpnetwork/terp-core:<version-info> \
  keys add test-key
```

And then list all keys:

```bash
docker run --rm -it \
  -v ~/.terp:/root/.terp \
  terpnetwork/terp-core:<version-info> \
  keys list
```

It's also important to notice that, when running a node in a network, you'll need to expose the container ports for external connectivity. The image exposes the following ports:

- **1317**: Rest server
- **26656**: Tendermint P2P
- **26657**: Tendermint RPC

To simplify using the Docker container, you can set an alias with the home path and the proper image tag, like:

```bash
alias terpd="docker run --rm -it -v ~/.terp:/root/.terp terpnetwork/terp-core:<version-info>"

```

After setting the alias with the above tip, you can use the other terpd commands without typing the verbose Docker run command. For the sake of comprehensive documentation, the full Docker command is shown. Just remember that by setting the alias you can simply use terpd instead of the Docker command.

## Next steps

Now its time to initialize your [node](./configure)
