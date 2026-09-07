---
title: First Challenge
description: "- Reward: ! TERP & PERSY - Challenge: Create a Text-Based Governance Prop: Propose to be added to the TestNET subDAO - Winners: First 100 submissions -..."
status: partial
---
## Terp OG Founder Level 1, Your First Challenge (! TERP & PERSY)
- **Reward:** ! TERP & PERSY
- **Challenge:** Create a Text-Based Governance Prop: Propose to be added to the TestNET subDAO
- **Winners:** First 100 submissions - measured by the timestamp of the git commit - that pass the qualification criteria.
- **Instructions:** Follow the steps in this guide.

## OG Challenge 1 - Proposals

## Instructions
## Create Proposal From Template
**Ensure you have the terp-core cli installed to your local environment & your are connected to the current testnet (90u-1), set up link [here](https://3000-terpnetwork-docs-6w1hz3big1j.ws-us86.gitpod.io/overview/getting-started).**
### Step 1: Query Governance Transaction Sub-Commands
```bash
terpd tx gov
```
```bash
Governance transactions subcommands

Usage:
  terpd tx gov [flags]
  terpd tx gov [command]

Available Commands:
  deposit         Deposit tokens for an active proposal
  submit-proposal Submit a proposal along with an initial deposit
  vote            Vote for an active proposal, options: yes/no/no_with_veto/abstain
  weighted-vote   Vote for an active proposal, options: yes/no/no_with_veto/abstain

Flags:
  -h, --help   help for gov

Global Flags:
      --chain-id string     The network chain ID
      --home string         directory for config and data (default "/root/.terp")
      --log_format string   The logging format (json|plain) (default "plain")
      --log_level string    The logging level (trace|debug|info|warn|error|fatal|panic) (default "info")
      --trace               print out full stack trace on errors

Use "terpd tx gov [command] --help" for more information about a command.
```

## Create New Forum Post in Discord
As we expect discussion to be able to occur naturally prior to a proposal, we want to create this governance requirements by having each participant create a new [blog post here](https://discord.gg/2NsAXhmG). The following is a template you can use:
```text
Title - **TerpNET OG Challenge-1:** Add <your-moniker>
Description - <your-wallet-address> is requesting to be added to the terpNET og DAO
```

## Broadcast proposal
Once discussion has been held, broadcast the proposal. It will need to be funded within 3 days of broadcasting to begin the voting period.

We can then generate it:
```bash
terpd tx gov submit-proposal --title "OG Challenge-1: Add <your-discord-alias> to TestNET subDAO --type text --description \
"This is a request to add myself <name>, <terp-address> ,<terpval-address(optional)>, \
<Jurisdiction/Country>, to participate in the TerpNET OG Challenge 1. The thing(s)  \
I am most excited for about Terp Network is(are) \
<insert-the-thing(s)-you-are-most-excited-about-Terp-Network?>." \
--gas 2000000 --fees 2000000uthiolx --chain-id 90u-1 --from <your-wallet>

```
Alternatively, you can use this UI to broadcast your text based proposal [here](https://proposals.subtract.fi/draft?type=TextProposal&chain=terpnettestnet) ;)
```md
### Summary
This is a request to add myself <name>, <terp-address> ,<terpval-address(optional)>,<Jurisdiction/Country> to participate in the TerpNET OG challenge 1. The thing(s) I am most excited for about Terp Network is(are) <insert-the-thing(s)-you-are-most-excited-about-Terp-Network?>."

By voting “Yes” you believe that...

My address will be included in the initial members of the TerpNET OG Founders DAO

By voting “No” you believe that...

My address will not be included in the initial members of the TerpNET OG Founders DAO
```

## Qualification Criteria
Although we do not limit anyone from participating, to claim TERP rewards:
- You must not be a resident of any of the [OFAC sanctioned](https://home.treasury.gov/policy-issues/office-of-foreign-assets-control-sanctions-programs-and-information) countries.

## Join the conversation
Subscribe to our newsletter and join our community channels on Matrix and Discord to stay up to date and get your questions answered! And make sure to watch out for future badge announcements
