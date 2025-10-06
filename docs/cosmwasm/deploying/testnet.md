---
title: Testnet 
sidebar_position: 2
---

## Deploying a contract
Terp Network testnet is permissionless and does not require a governance proposal to deploy new contracts. You may use an interface or the CLI to deploy new contracts.

### Deploying a contract through CLI 

#### 1. Create a terp address

```
terpd keys add testnet-key 
```

#### 2. Request funds through the `faucet`

```
https://faucet.terp.network/90u-4/<address>
```

#### 3. Configure RPC endpoint & Chain ID

```
terpd config node https:://testnet-rpc.terp.network:443
terpd config chain-id 90u-4
```

#### 4. Check your account has balance 

```
terpd q bank balances [address]
```

#### 5. Deploy a contract

```
terpd tx wasm store contract.wasm --from testnet-key --gas auto --gas-adjustment 1.5 --fees 5000000uthiol
```

#### 6. Collect the new Code ID
After executing the transaction you will have a code id that you can use to instantiate the contract

```
terpd q tx [hash] | jq 

# or use sed to return just the code_id

terpd q tx [hash] | sed -n 's/.*"key":"code_id","value":"\([^"]*\)".*/\1/p'
```


