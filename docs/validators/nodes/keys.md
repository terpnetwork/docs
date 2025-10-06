---
title: 4. managing key's
sidebar_position: 4
---

# Add a private key and account

You will need to create at least one private key to hold your account that will be used to execute transactions from the node.

When you run the command below, you might be prompted to enter a password for your keyring.
```bash 
terpd keys add <account-name>
```

The account comes with a human-readable 24-word mnemonic phrase (also called seed or simply mnemonic), which you can use to recover the account.

# Restore existing account via mnemonics
To recover an existing account, add the **`--recover`** flag:

```bash
terpd keys add <key_name> --recover 
```
You will be prompted to enter your bip39 mnemonic in order to add the key.

# List your keys

```bash
terpd keys list 
```

you can also retrieve information about a specific key:

```
terpd keys show <key_name>
```

# Delete a key

```bash
terpd keys delete <key_name>  
```
:::warning
Make sure you are fully aware of the implications and have backed up the key mnemonic before removing any of your keys. There is no way to recover your key without the mnemonic.
:::

# Export private keys

You can export and backup your key by launching:

```bash
terpd keys export <key_name>  
```

## Keyring-backend flag

The Keyring is where the keys are stored, and there are a few options.

```sh
terpd keys [subcommands] --keyring-backend [backend type]
```

### Os backend

The default **os** backend stores the keys in the operating system's credential sub-system.

### File backend
By choosing the **file** backend, a password entry is required every time you need to access it. This implies that you may be prompted for your password multiple times in one single command.

### Test backend
The **test** backend is a password-less variation of the file backend. It stores unencrypted keys inside the app's configuration directory. It should only be used in testing environments and never be used in production.

## Operator Address vs Validator Consensus Address
We have been talking about your node address, which is your account address and it's used for holding funds and signing transactions. This is also referred to as **Operator Address**, and you can obtain it by launching `terpd keys add <your-key-name>`. This address starts with `"terp1.."`.

It is important to notice that there is also another type of address, derived from your validator's consensus public key. This is called **Validator Consensus Address**, and it is used in the staking and consensus process to identify your validator.This address starts with `"terpvaloper.."`", and you can obtain it by launching terpdtendermint show-address.

# TKMS (Optional)

Tendermint Key Management System (TKMS), is a specialized service that manages validator keys for nodes operating on the Cosmos network, ensuring the secure storage, access, and usage of cryptographic keys. Using TKMS for Cosmos validators has the following advantages:

**- Improved security:** TKMS establishes robust security practices for the handling and storage of cryptographic keys, minimizing the risk of unauthorized access, manipulation, or theft of keys.

**- Unified API and support for various HSMs:** TKMS offers a unified API that allows for integration with various Hardware Security Modules (HSMs). HSMs are specialized devices that securely generate, store, and manage cryptographic keys. By supporting different HSMs, TKMS provides validators with the flexibility to choose the most appropriate and secure hardware solutions for their specific needs.

**- Double signing protection:** TKMS implements both software and hardware-based double signing protection measures, ensuring that validators do not inadvertently double sign blocks.
In order to safely manage your validator keys, you can look further on how to integrate TKMS with hardware devices:

- **[Tendermint KMS support for Ledger.](https://hub.cosmos.network/main/validators/kms/kms.html)**
- **[TKMS support for YubiHSM.](https://github.com/iqlusioninc/tmkms/blob/main/README.yubihsm.md)**

### TKMS Guide - [click here for guide](../../guides/nodes/tkms)
## Next steps

Now you are ready to [join a network](/validators/join-a-network/overview).
Optionally, you can take your time to [configure your node](./configure.md), so that the node can be customized according to your needs and preferences. Also, note that you can use [Cosmovisor](./cosmovisor.md) in order to perform automatic upgrades.
