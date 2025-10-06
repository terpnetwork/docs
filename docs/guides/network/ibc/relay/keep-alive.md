---
title: keep-alive cron job
sidebar_position: 5
---

## Goal
Keepalive is a script built by the [DAO-DAO](https://github.com/da0-da0/polytone-keepalive) team which serves to automate ibc client updates, minimizing ibc channel downtimes. This guide will review:
- how to install your node to run the keepalive scripts
- how to setup a cronjob service on your computer locally

## Alternate Approach

### Go Relayer
By default, a running instance of [go-relayer](https://github.com/cosmos/relayer) is able to automatically update clients if the client has less than 1/3 of its trusting period left.

You can choose to update clients more frequently by using the `--time-threshold` flag when running `rly start`. 

### Rust Relayer (Hermes)

## Install Relayer & Keepalive
The scripts expect to be run in an environment where either hermes or ibc-rly relayer binaries are installed. It may also be useful to run a full node for both chains you expect to relay between locally.

## Setup CronJob Locally 

Cron is a time-based job scheduling system. `crontab` is a special file that holds the schedule of jobs cron will run. You can edit your crontab with the following command:
```sh
crontab -e 
```
If this is the first time you’re running the crontab command under this user profile, it will prompt you to select a default text editor to use when editing your crontab:

```sh
Output
no crontab for sammy - using an empty one

Select an editor.  To change later, run 'select-editor'.
  1. /bin/nano        <---- easiest
  2. /usr/bin/vim.basic
  3. /usr/bin/vim.tiny
  4. /bin/ed

Choose 1-4 [1]: 
```
When you run crontab -e in the future, it will bring up your crontab in this text editor automatically. Once in the editor, you can input your schedule with each job on a new line. Otherwise, you can save and close the crontab for now (CTRL + X, Y, then ENTER if you selected nano).

### Adding Keepalive 
add the following to your crontab file to run the keepalive script every three days.
```sh 
0 0 */3 * * cd /path/to/polytone-keepalive && npm run keepalive
```
make sure you then restart your systemd service:

```sh
systemctl daemon-reload 
```
### References 
- [Polytone](https://github.com/da0-da0/polytone-keepalive)
- [how-to-use-cron-to-automate-tasks-ubuntu-1804](https://www.digitalocean.com/community/tutorials/how-to-use-cron-to-automate-tasks-ubuntu-1804)