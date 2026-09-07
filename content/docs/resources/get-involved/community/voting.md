---
title: Governance Voting
description: The voting period is currently a fixed 4-day period. During the voting period, participants may select a vote of either Yes, No, Abstain, or NoWithVeto.…
status: partial
---
## Voting Period
The voting period is currently a fixed 4-day period. During the voting period, participants may select a vote of either `Yes`, `No`, `Abstain`, or `NoWithVeto`. Voters may change their vote at any time before the voting period ends.
## Voting Options

1. `Abstain`: indicates that the voter is impartial to the outcome of the proposal.
2. `Yes`: indicates approval of the proposal in its current form.
3. `No`: indicates disapproval of the proposal in its current form.
4. `NoWithVeto`: indicates stronger opposition to the proposal than simply voting No. If the number of NoWithVeto votes is greater than a third of total votes excluding Abstain
   votes, the proposal is rejected and the deposits are burned.
   Voting NoWithVeto provides a mechanism for a minority group representing a third of the participating voting power to reject a proposal that would otherwise pass. This makes explicit an aspect of the consensus protocol: it works as long as only up to a third of nodes fail. In other words, greater than a third of validators are always in a position to cause a proposal to fail outside the formalized governance process and the network's norms, such as by censoring transactions. The purpose of internalizing this aspect of the consensus protocol into the governance process is to discourage validators from relying on collusion and censorship tactics to influence voting outcomes.

## What determines whether or not a governance proposal passes?
There are four criteria:

1. Minimum Deposit:
2. Minimum Quorum Met:
3. Simple Majority Votes:
4. Less than 33.4% of `NoWithVeto`
### How is voting tallied?
Voting power is determined by Terp stake wight and is proportional to the number of total TERP participating in the vote. Only bonded TERP count towards the voting power for a governance proposal. Liquid TERP qill not count toward a vote or quorum.

Inactive validators can cast a vote, but their voting power (including the backing of their delegators) will not count toward the vote if they are not in the active set when the voting period ends. That means that if I delegate to a validator that is either jailed, tombstoned, or ranked lower than 150 in stake-backing at the time that the voting period ends, my stake-weight will not count in the vote.

Though a simple majority `Yes` vote (ie. 50% of participating voting power) is required for a governance proposal vote to pass, a NoWi`thVeto vote of 33.4% of participating voting power or greater can override this outcome and cause the proposal to fail. This enables a minority group representing greater than 1/3 of voting power to fail a proposal that would otherwise pass.
## How is quorum determined?

Voting power, whether backing a vote of `Yes`, `Abstain`, `No`, or `NoWithVeto`, counts toward quorum. Quorum is required for the outcome of a governance proposal vote to be considered valid and for deposit contributors to recover their deposit amounts. If the proposal vote does not reach quorum (ie. less than 33.4% of the network's voting power is participating) within 5 days, any deposit amounts will be burned and the proposal outcome will not be considered to be valid.
