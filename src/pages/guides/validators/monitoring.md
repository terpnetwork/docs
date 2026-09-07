---
title: "Monitoring"
description: "Prometheus and Grafana for Terp validators"
status: "complete"
---
There is a [Grafana](https://grafana.com/) dashboard setup that works with any Cosmos SDK / CometBFT chain.

Let's set it up for our network.

## Prerequisites

First install [Grafana](https://grafana.com/) and [Prometheus](https://prometheus.io/) on your machine.

## Enable CometBFT metrics

You will need to edit the node's `config/config.toml` file, setting `prometheus` to `true`:

```bash
sed -i 's/prometheus = false/prometheus = true/g' \
<YOUR-NODE-HOMEDIR>/config/config.toml
```

In order for the change to take effect you will need to restart the node. You should be able to access the CometBFT metrics on port **26660**: `http://localhost:26660`

## Configure prometheus targets

Find `prometheus.yml` file and append the following `job` under the `scrape_configs`:

On linux machines this file can be found under this path: `/etc/prometheus/prometheus.yml`

##
```yaml
- job_name: terp
  static_configs:
    - targets: ['localhost:26660']
      labels:
        instance: validator
```

## Resolving port conflicts

When both **terpd** and **prometheus** are running on the same machine, one of the service will encounter a port conflict, causing it to be unable to execute. Do the following to resolve this issue.

Open the node's **config/app.toml** file and look for:

```toml
[grpc]
address = "0.0.0.0:9090"
```

Change the port to something else:

```toml
[grpc]
address = "0.0.0.0:9095"
```

## Restart prometheus and terpd

Restart **terpd** using the followng:

```bash
sudo systemctl stop terpd
sudo systemctl start terpd
```

The you can restart **prometheus**:

```bash
sudo service prometheus restart
```

## Adding a prometheus service file (Optional)

A service file can be used to allow for the automatic restart of the service, helping to make sure that your node is always monitored.

You can create a service file with:

```bash
nano /etc/systemd/system/prometheus_s.service

```

Add the following content to the file:

```json
[Unit]
Description=Prometheus
Wants=network-online.target
After=network-online.target
[Service]
User=$USER
Type=simple
ExecStart=/home/$USER/prometheus/prometheus \
--config.file /home/$USER/prometheus/prometheus.yml \
--storage.tsdb.path /home/$USER/prometheus/ \
--web.console.templates=/home/$USER/prometheus/consoles \
--web.console.libraries=/home/$USER/prometheus/console_libraries
Restart=always
RestartSec=3
LimitNOFILE=4096
[Install]
WantedBy=multi-user.target

```

You can then reload the **systemctl** daemon:

```bash
sudo systemctl daemon-reload
```

## Additional Node Monitoring Tooling s

- PANIC - https://github.com/SimplyStaking/panic
- cvms - https://github.com/cosmostation/cvms
- polkachu server monitoring - https://github.com/polkachu/server-monitoring
- tenderduty - https://github.com/cosmostation/tenderduty
