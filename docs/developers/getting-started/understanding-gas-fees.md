---
title: 3. understanding gas & fees
sidebar_position: 3
---

# Gas and fees

The **fee** system in Terp Network plays a pivotal role not only in resource management and the incentivization of validators, developers, and delegators, but also in assuring security, protecting against spam, and preserving the healthy operations of the network. A crucial element in fee computation is **gas**, which is a unit that measures the amount of computational effort required to perform specific operations. Each transaction in Terp Network requires a certain amount of gas for execution, the cost of which is usually covered by the account initiating the transaction.

## Gas limit

Think of the **gas limit** as the amount of fuel needed to reach your destination, which in this case is the successful completion of a transaction. If the user sets the gas limit too low, the transaction might fail due to insufficient gas for completion. Conversely, setting the gas limit excessively high could lead to resource wastage, as any unused gas is not refunded.

Instead of manually setting the gas limit, a simulation of the transaction is usually executed to get an estimate of the gas limit required to execute a transaction. The gas estimation process may not always be perfect due to the complexity and variability of transactions, especially in smart contract operations. Therefore, a **gas adjustment** multiplier is applied as a buffer to increase the likelihood of successful transaction execution. For example, a gas adjustment value of **1.5** would increase the initially estimated gas by **50%**.

## Gas price

The **gas price** in Terp Network determines the cost of each unit of computational resource consumed by a transaction. It represents the amount of the network's native token that is required to execute one unit of gas. Gas prices can vary based on network conditions, such as congestion or market demand.

To prevent validators from accepting transactions with low fees that might lead to spamming the network and additional security issues, a Minimum Price of Gas system was put in place. Consequently, transactions will fail if the set gas price falls beneath this threshold. Therefore, it's not ideal to set the gas price manually but instead utilize the endpoint or CLI command that returns the minimum price of gas and then use this value as the gas price. This falls under the **estimate fees** feature of the **rewards** module.


## Fees 
Fees are an additional fee required for transactions to be passed. The minimum fee required can very, dependent on the RPC provider a transaction is being broadcasted to, along with the networks global miminum-fee parameter that is set. 


### Standard Gas & Fee Config 

```
terpd config gas auto 
terpd config gas-adjustments 1.8 
terpd config gas-prices 0.05uthiolx
```