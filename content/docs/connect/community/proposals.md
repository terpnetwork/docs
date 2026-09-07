---
title: Submission Guidelines
description: "title: Submission Guidelines"
status: partial
---
- **Minimum Duration**: 48 hours
- **Forum Tag**: [IDEATION]
Phase 2 is where the idea is formalized into an TCP that includes all of the criteria specified in the TCP Template. It must be a clear and complete description of the proposed enhancement. All TCPs must have the following core components, with additional/varying sections for certain proposal types (refer to the templates page): 
**Title: ** - Short and sweet, with the correct tags prefixed.
- **Minimum Duration: ** 72 hours (3 days)
- **Forum Tag: ** `[PRE-PROPOSAL]`
**Forum Tag: ** `[PROPOSAL]`
**Forum Tag (Depending on Outcome): ** `[VOTING]`, `[PASSED]`, `[REJECTED]`, `[VETO]`
- **Withdrawn: ** Assigned when a member withdraws their proposal, or if the proposal is abandoned with no activity. **Forum Tag:** `[WITHDRAWN]`
- **Deferred: ** Assigned when a proposal has been deemed as not ready or not a priority but can be re-proposed at a later date. This status can be assigned during Phase 3 with a failed forum poll or signaling. **Forum Tag:** `[DEFER]`
Anyone may start a subDAO and gather momentum behind it by posting on Commonwealth. Until a formal proposal for a budget is made, this subDAO is considered “informal.” A workstream can be as broad or narrow as its initiators like, but workstream proposals must satisfy the following criteria: 
SubDAOs have five potential states. Each of the five states and the requirements for a subDAO in each state are outlined below: 
- **Informal: ** The workstream is not funded by the DAO, and has not made a formal proposal with its goals and a budgetary request.
- **Proposed: ** The workstream has made a formal proposal to the DAO for a working budget.
- **Active: ** The workstream is active and funded by the DAO.
- **Inactive: ** The workstream has been discontinued and is no longer being funded by the DAO.
Proposal Phases are denoted as: `[IDEATION]`, `[PRE-PROPOSAL]`, `[PROPOSAL]`, `[VOTING]` for the 4-phases, and `[PASSED]`, `[REJECTED]`, `[DEFERRED]` for proposals in the other stages. Refer to the [Proposal Lifecycle](/connect/community/proposals) page for more information on proposal lifecycle phases.
---
title: Submission Guidelines
---

## Proposal Submission for Voting

## Preparing the Proposal Payload
___
Many proposals allow for long form text to be included, usually under the key description. These provide the opportunity to include markdown if formatted correctly as well as line breaks with \n. If you're using markdown or line breaks it's recommended to put the proposal text into a json file and include that file as part of the CLI proposal, as opposed to individual fields in flags.

### Using terpd tx gov

Coming Soon

### Text Proposals
TextProposal are used by delegators to agree to a certain strategy, plan, commitment, future upgrade, or any other statement in the form of text. Aside from having a record of the proposal outcome on the Terp Network chain, a text proposal has no direct effect on Terp Network.

### Community Pool
For community pool spend proposals, there are five components:
1. **Title** - the distinguishing name of the proposal, typically the way the that explorers list proposals
2. **Description** - the body of the proposal that further describes what is being proposed and details surrounding the proposal
3. **Recipient** - the Terp Network (bech32-based) address that will receive funding from the Community Pool
4. **Amount** - the amount of funding that the recipient will receive in `uterp` or `uthiol`.
5. **Deposit** - the amount that will be contributed to the deposit (in `uterp`) from the account submitting the proposal

**Community Pool Spend SubDaos**1. **Title** - the distinguishing name of the proposal, typically the way the that explorers list proposals
2. **Description** - the body of the proposal that further describes what is being proposed and details surrounding the proposal
3. **Recipient** - the Terp (bech32-based) address that will receive funding from the Community Pool
4. **Amount** - the amount of funding that the recipient will receive in `uterp` or `uthiol`.
5. **Deposit** - the amount that will be contributed to the deposit (in `uterp`) from the account submitting the proposal

 When an observer selects the proposal, they'll see the description. Not all explorers will show the recipient and amount, so ensure that you verify that the description aligns with the what the governance proposal is programmed to enact. If the description says that a certain address will receive a certain number of TERP, it should also be programmed to do that, but it's possible that that's not the case (accidentally or otherwise).

### Parameter Change

>> Changes to the `gov` module are different from the other kinds of parameter changes because `gov` has subkeys, [as discussed here](https://github.com/cosmos/cosmos-sdk/issues/5800).

---
title:  Standardized Proposal Templates
---
## Standardized Proposal Templates

The Terp Network Governance Framework allows for various different types of proposals, both on-chain and off-chain. This section serves as a basic guide for the necessary components of proposals. Depending on the proposal type, certain components may be required. Use this table as a reference sheet for which of the following components are required for your type.

## A. Universal Components

All proposals must include the following **Proposal Components**.
___
**Title** - Short and sweet, with the [correct tags](/connect/community/proposals) prefixed.
**Author(s)** - List of authors and contributors involved in the writing of the proposal.
**Summary** - A brief, high-level summary of what changes are being suggested. Summary should be a single sentence, or a bulleted list.
**Abstract** - Abstract is a multi-sentence (short paragraph) technical summary. This should be a very terse and human-readable version of the motivation and specification sections. Someone should be able to read only the abstract to get the gist of what this specification does.
**Motivation** - The motivation section should describe the "why" of this proposal. What problem does it solve? What benefit does it provide to the Terp network?
___

## B. Project/Protocol Introduction

___

### Project / Initiative Specification

#### Project & Team Introduction

A quick introduction to the project or initiative: what it is, how it works, why the project is unique, and why your team can knock it out of the park.

#### Background & Context

Background information on the project, such as where the inspiration came from, why you're passionate about it, how long you have been working on it, previous funding rounds (if applicable).

#### Achievements & Obstacles

List all the achievements you have managed to accomplish so far, and the obstacles or blockers that you have hit.

#### Project Goals

## C.SubDAOs & Special Initiatives

Anyone may start a subdao and gather momentum behind it by posting on Commonwealth. For more information on Subdao proposals, refer to [this section](/connect/community/daos).

## D. Protocol (ParamChange) Proposals
