---
title: a. faq - node & validator 
sidebar_position: 1
---

## General Concepts 

## What is a validator?

Validators play a crucial role in maintaining the integrity of the blockchain by performing two key tasks. First, they participate in consensus by broadcasting votes that contain cryptographic signatures signed with their private key, representing their agreed-upon opinion on which block should be added to the blockchain. This helps to ensure that the network reaches a collective agreement on the state of the blockchain. Second, validators commit new blocks to the blockchain by signing and publishing them, which ultimately enables the creation of an immutable and tamper-proof record of all transactions.


## What is staking? 
In Terp Network's Proof-of-Stake (PoS) architecture, validators are randomly chosen to create new blocks based on the amount of staking tokens ($TERP) they have committed to the network. The more tokens a validator has staked, the more likely their validator will be chosen to create new blocks. Staking tokens can be done by the validator themselves or by delegating their tokens to another validator. By staking, validators are incentivized to behave honestly and maintain the integrity of the network, as they have skin in the game. In turn, the network rewards validators with a share of the block rewards in proportion to their staking power.

## What is a full node? 

A full node is a server that fully validates transactions and blocks of a blockchain and keeps a full record of all historic activity. A full node is distinct from a pruned node that processes only block headers and a small subset of transactions. Running a full node requires more resources than a pruned node. Validators can decide to run either a full node or a pruned node, but they need to make sure they retain enough blocks to be able to validate new blocks.

Of course, it is possible and encouraged for users to run full nodes even if they do not plan to be validators.

## What is a delegator?
Delegators are `$TERP` holders who cannot, or do not want to, run a validator themselves. `$TERP` holders can delegate `$TERP` to a validator and obtain a part of their reward in exchange. For details on how reward is distributed, see What is the incentive to stake? and What are validators commission? in this document.

Because delegators share reward with their validators, they also share risks. If a validator misbehaves, each of their delegators are partially slashed in proportion to their delegated stake. This penalty is one of the reasons why delegators must perform due diligence on validators before delegating. Spreading their stake over multiple validators is another layer of protection.

Delegators play a critical role in the system, as they are responsible for choosing validators. Being a delegator is not a passive role. Delegators must actively monitor the actions of their validators and participate in governance. For details on being a delegator, read the Delegator FAQ (opens new window).

## What is self-delegation? How can I increase my self-delegation?
Self-delegation is a delegation of `$TERP` from a validator to themselves. The delegated amount can be increased by sending a delegate transaction from your validator's application application key.

## How do delegators choose their validators?
Delegators are free to choose validators according to their own subjective criteria. Selection criteria includes:

- **Amount of self-delegated `$TERP`:** Number of `$TERP` a validator self-delegated to themselves. A validator with a higher amount of self-delegated `$TERP` indicates that the validator is sharing the risk and experienced consequences for their actions.
- **Amount of delegated `$TERP`:** Total number of `$TERP` delegated to a validator. A high voting power shows that the community trusts this validator. Larger validators also decrease the decentralization of the network, so delegators are suggested to consider delegating to smaller validators.
- C**ommission rate:** Commission applied on reward by validators before the reward is distributed to their delegators.
- **Track record:** Delegators review the track record of the validators they plan to delegate to. This track record includes past votes on proposals and historical average uptime.
- **Community contributions:** Another (more subjective) criteria is the work that validators have contributed to the community, such as educational content, participation in the community channels, contributions to open source software, etc.
Apart from these criteria, validators send a create-validator transaction to signal a website address to complete their resume. Validators must build reputation one way or another to attract delegators. For example, a good practice for validators is to have a third party audit their setup. Note though, that the Tendermint team does not approve or conduct any audits themselves. For more information on due diligence, see the A Delegator’s Guide to Staking (opens new window)blog post.

## What are the different states a validator can be in?
After a validator is created with a create-validator transaction, the validator is in one of three states:

in validator set: Validator is in the active set and participates in consensus. The validator is earning rewards and can be slashed for misbehavior.

jailed: Validator misbehaved and is in jail, i.e. outside of the validator set.

If the jailing is due to being offline for too long (i.e. having missed more than 95% out of the last 10,000 blocks), the validator can send an unjail transaction in order to re-enter the validator set.
If the jailing is due to double signing, the validator cannot unjail.
unbonded: Validator is not in the active set, and therefore not signing blocks. The validator cannot be slashed and does not earn any reward. It is still possible to delegate `$TERP` to an unbonded validator. Undelegating from an unbonded validator is immediate, meaning that the tokens are not subject to the unbonding period.

## Can a validator run away with their delegators' `$TERP`?
By delegating to a validator, a user delegates voting power. The more voting power a validator have, the more weight they have in the consensus and governance processes. This does not mean that the validator has custody of their delegators' `$TERP`. A validator cannot run away with its delegator's funds.

Even though delegated funds cannot be stolen by their validators, delegators' tokens can still be slashed by a small percentage if their validator suffers a slashing event, which is why we encourage due diligence when selecting a validator.

# Responsibilities
## Do validators need to be publicly identified?
No, they do not. Each delegator can value validators based on their own criteria. Validators are able to register a website address when they nominate themselves so that they can advertise their operation as they see fit. Some delegators prefer a website that clearly displays the team operating the validator and their resume, while other validators might prefer to be anonymous validators with positive track records.

## What are the responsibilities of a validator?
Validators have two main responsibilities:

1. Be able to constantly run a correct version of the software: Validators must ensure that their servers are always online and their private keys are not compromised.

2. Actively participate in governance: Validators are required to vote on every proposal.

Additionally, validators are expected to be active members of the community. Validators must always be up-to-date with the current state of the ecosystem so that they can easily adapt to any change.

## What does 'participate in governance' entail?
Validators and delegators on the Cosmos Hub can vote on proposals to change operational parameters (such as the block gas limit), coordinate upgrades, or make a decision on any given matter.

Validators play a special role in the governance system. As pillars of the system, validators are required to vote on every proposal. It is especially important since delegators who do not vote inherit the vote of their validator.

## What does staking imply?
Staking `$TERP` can be thought of as a safety deposit on validation activities. When a validator or a delegator wants to retrieve part or all of their deposit, they send an unbonding transaction. Then, `$TERP` undergoes a 3-week unbonding period during which they are liable to being slashed for potential misbehaviors committed by the validator before the unbonding process started.

Validators, and by association delegators, receive block rewards, fees, and have the right to participate in governance. If a validator misbehaves, a certain portion of their total stake is slashed. This means that every delegator that bonded `$TERP` to this validator gets penalized in proportion to their bonded stake. Delegators are therefore incentivized to delegate to validators that they anticipate will function safely.

## How often is a validator chosen to propose the next block? Does frequency increase with the quantity of bonded `$TERP`?
The validator that is selected to propose the next block is called the proposer. Each proposer is selected deterministically. The frequency of being chosen is proportional to the voting power (i.e. amount of bonded `$TERP`) of the validator. For example, if the total bonded stake across all validators is 100 `$TERP` and a validator's total stake is 10 `$TERP`, then this validator is the proposer ~10% of the blocks.

## Are validators of the Terp Network required to validate other zones in the Cosmos ecosystem?
No. Validator of Terp Network may vote to include other networks in the validation, with use of the Shared Security Feature.

## How can a validator safely quit validating on Terp Network?
If a validator simply shuts down their node, this would result in the validator and their delegators getting slashed for being offline. The only way to safely exit a validator node running on the Cosmos Hub is by unbonding the validator's self-delegated stake so that it falls below its minimum self-delegation limit. As a result, the validator gets jailed and kicked out of the active set of validators, without getting slashed. They can then proceed to shut down their node without risking their tokens.

It's highly advised to inform your delegators when doing this, as they will still be bonded to your validator after it got jailed. They will need to manually unbond and they might not have been made aware of this via their preferred wallet application.

# Incentives
## What is the incentive to stake?
Each member of a validator's staking pool earns different types of reward:

1. Block rewards: Native tokens of applications (e.g. `$TERP` on the Cosmos Hub) run by validators are inflated to produce block provisions. These provisions exist to incentivize `$TERP` holders to bond their stake. Non-bonded `$TERP` are diluted over time.
Transaction fees: The Cosmos Hub maintains an allow list of tokens that are accepted as fee payment. The initial fee token is the atom.
This total reward is divided among validators' staking pools according to each validator's weight. Then, within each validator's staking pool the reward is divided among delegators in proportion to each delegator's stake. A commission on delegators' reward is applied by the validator before it is distributed.

## What is a validator commission?
reward received by a validator's pool is split between the validator and their delegators. The validator can apply a commission on the part of the reward that goes to their delegators. This commission is set as a percentage. Each validator is free to set their initial commission, maximum daily commission change rate, and maximum commission. The Cosmos Hub enforces the parameter that each validator sets. The maximum commission rate is fixed and cannot be changed. However, the commission rate itself can be changed after the validator is created as long as it does not exceed the maximum commission.

## What is the incentive to run a validator?
Validators earn proportionally more reward than their delegators because of the commission they take on the staking rewards from their delegators.

Validators also play a major role in governance. If a delegator does not vote, they inherit the vote from their validator. This voting inheritance gives validators a major responsibility in the ecosystem.

## How are block rewards distributed?
Block rewards are distributed proportionally to all validators relative to their voting power. This means that even though each validator gains `$TERP` with each reward, all validators maintain equal weight over time.

## How are fees distributed?
Fees are similarly distributed with the exception that the block proposer can get a bonus on the fees of the block they propose if the proposer includes more than the strict minimum of required precommits.

When a validator is selected to propose the next block, the validator must include at least 2/3 precommits of the previous block. However, an incentive to include more than 2/3 precommits is a bonus. The bonus is linear: it ranges from 1% if the proposer includes 2/3rd precommits (minimum for the block to be valid) to 5% if the proposer includes 100% precommits. Of course the proposer must not wait too long or other validators may timeout and move on to the next proposer. As such, validators have to find a balance between wait-time to get the most signatures and risk of losing out on proposing the next block. This mechanism aims to incentivize non-empty block proposals, better networking between validators, and mitigates censorship.

## What are the slashing conditions?
If a validator misbehaves, their delegated stake is partially slashed. Two faults can result in slashing of funds for a validator and their delegators:

1. Double signing: If someone reports on chain A that a validator signed two blocks at the same height on chain A and chain B, and if chain A and chain B share a common ancestor, then this validator gets slashed by 5% on chain A.
Downtime: If a validator misses more than 95% of the last 10,000 blocks (roughly ~19 hours), they are slashed by 0.01%.
## Are validators required to self-delegate `$TERP`?
Yes, they do need to self-delegate at least 1 atom. Even though there is no obligation for validators to self-delegate more than 1 atom, delegators want their validator to have more self-delegated `$TERP` in their staking pool. In other words, validators share the risk.

In order for delegators to have some guarantee about how much shared risk their validator has, the validator can signal a minimum amount of self-delegated `$TERP`. If a validator's self-delegation goes below the limit that it predefined, the validator gets jailed and kicked out of the active set of validators while its delegators remain bonded to it.

Note however that it's possible that some validators decide to self-delegate via a different address for security reasons.

## How to prevent concentration of stake in the hands of a few top validators?
The community is expected to behave in a smart and self-preserving way. When a mining pool in Bitcoin gets too much mining power the community usually stops contributing to that pool. The Cosmos Hub relies on the same effect. Additionally, when delegaters switch to another validator, they are not subject to the unbonding period, which removes any barrier to quickly redelegating tokens in service of improving decentralization.