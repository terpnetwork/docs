---
title: First Challenge
description: "- Reward: ! TERP & PERSY - Challenge: Adding a Validator & Persistent Peer Endpoint to the Repository - Winners: First 100 submissions - measured by the..."
status: partial
---
## Scavenger Hunt Level 1, Your First Challenge (! TERP & PERSY)

- **Reward:** ! TERP & PERSY
- **Challenge:** Adding a Validator & Persistent Peer Endpoint to the Repository
- **Winners:** First 100 submissions - measured by the timestamp of the git commit - that pass the qualification criteria.

## Instructions

REPO: [Link](https://github.com/terpnetwork/scavenger-hunt/tree/main/challenge-1)

## Spin up your validator (optionally sentry node)

Checkout [getting-started](https://docs.terp.network/overview/getting-started), and the [build docs](https://docs.terp.network/terp-core/build) on basics for this.

## Collect your nodes P2P info

The following format is reccomended particpants follow when including their own P2P & participation info:

```json
{
"name": "<your-[personal/team/company]-name-here>",
"terpval-address": "terpval1...",
"personal-terp-address": "terp1...",
"tendermint-peer-id": "<your-peer-id-here>",
"cloud-providers"<cloud-provider-A>,<cloud-provider-B>"
"Jurisdiction/Country of Validator Company": "<your-[personal/team/company]-location-here>
"Members-of-validator-[team/company/coop]":[
    {
        "discord/telegram": "<discord-or-telegram>",,
        "github": "https://github.com/dopeteamyo420",
        "primary jurisdiction": "<dopeteamyo420-juristriction>"
    }...
    ],
    "website (optional): "<your-website-here>",
}
```

## Fork test-net repo

TestNET repo: [Link] (learn about forking repositories here: [Link](https://docs.github.com/en/get-started/quickstart/fork-a-repo)).

## Add your P2P details in your forked repo

Add your new file containing all of your individual P2P info, named `&lt;your-terpval-address>.json` in the `/challenges/1/P2P/` folder, & commit your changes to the forked repository

## Open new PR to add your P2P details

Once your forked changes are pushed to github, follow these steps to opening a new PR in the source repository [here](https://github.com/terpnetwork/scavenger-hunt)
