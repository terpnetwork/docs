---
title: automate compressed snapshot creation
sidebar_position: 2
---


### Benefits of Creating Snapshots
- Ensures regular backups of the node's data, reducing the risk of data loss
- Automates the process, saving time and effort for node operators
- Helps maintain a consistent and up-to-date snapshot of the blockchain, making it easier to restore the node in case of issues


### Prerequisites:

The script assumes that the Akash service is installed and running on the system
The script requires jq, tar, and systemctl commands to be available on the system
The script uses a specific log file and snapshot directory, which can be modified as needed


### Usage:

Create the file `create_snapshot.sh` with:
```bash
#!/bin/bash
CHAIN_ID="morocco-1"
SNAP_PATH="$HOME/terp/snapshots"
LOG_PATH="$HOME/terp/terp_log.txt"
DATA_PATH="$HOME/.terp/data/"
SERVICE_NAME="terpd.service"
RPC_ADDRESS="http://localhost:26657"
SNAP_NAME=$(echo "${CHAIN_ID}_$(date '+%Y-%m-%d').tar")
OLD_SNAP=$(ls ${SNAP_PATH} 2>/dev/null | egrep -o "${CHAIN_ID}.*tar")

# Create snapshot folder if it doesn't exist
mkdir -p ${SNAP_PATH}

log_this() {
    YEL='\033[1;33m' # yellow
    NC='\033[0m'     # No Color
    local logging="$@"
    printf "|$(echo -n $(TZ=":Africa/Dar_es_Salaam" date '+%Y-%m-%d_%H:%M:%S'))| $logging\n" | tee -a ${LOG_PATH}
}

LAST_BLOCK_HEIGHT=$(curl -s ${RPC_ADDRESS}/status | jq -r .result.sync_info.latest_block_height)
log_this "LAST_BLOCK_HEIGHT ${LAST_BLOCK_HEIGHT}"

log_this "Stopping ${SERVICE_NAME}"
systemctl stop ${SERVICE_NAME}; echo $? >> ${LOG_PATH}

log_this "Creating new snapshot"
time tar cf ${HOME}/${SNAP_NAME} -C ${DATA_PATH} . &>>${LOG_PATH}

# log_this "Removing old snapshot(s):"
# cd ${SNAP_PATH}
# rm -fv ${OLD_SNAP} &>>${LOG_PATH}

log_this "Moving new snapshot to ${SNAP_PATH}"
mv ${HOME}/${CHAIN_ID}*tar ${SNAP_PATH} &>>${LOG_PATH}

# print snapshot size and info
du -hs ${SNAP_PATH} | tee -a ${LOG_PATH}

log_this "Starting ${SERVICE_NAME}"
systemctl start ${SERVICE_NAME}; echo $? >> ${LOG_PATH}

log_this "Done\n---------------------------\n"
```
Make the script executable by running `chmod +x create_snapshot.sh`, and then run the script by executing `./create_snapshot.sh`.

To setup a cron job service to run this once a day 

