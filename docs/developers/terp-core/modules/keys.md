# Keys

The keys module allows you to manage your local tendermint keystore ("wallets") for the terp network.

## Available Commands

| Name | Description |
| :--- | :--- |
| [add](keys.md#terpd-keys-add) | Add an encrypted private key \(either newly generated or recovered\), encrypt it, and save to disk |
| [delete](keys.md#keys-delete) | Delete the given key |
| [export](keys.md#keys-export) | Export private keys |
| [import](keys.md#keys-import) | Import private keys into the local keystore |
| [list](keys.md#keys-list) | List all keys |
| [mnemonic](keys.md#keys-mnemonic) | Compute the bip39 mnemonic for some input entropy |
| [parse](keys.md#keys-parse) | Parse address from hex to bech32 and vice versa |
| [show](keys.md#keys-show) | Retrieve key information by name or address |

### terpd keys add

Derive a new private key and encrypt to disk.

```text
terpd keys add <key-name> [flags]
```

**Flags:**

| Name, shorthand | Default | Description | Required |
| :--- | :--- | :--- | :--- |
| --multisig |  | Construct and store a multisig public key |  |
| --multisig-threshold | 1 | K out of N required signatures |  |
| --nosort | false | Keys passed to --multisig are taken in the order they're supplied |  |
| --pubkey |  | Parse a public key in bech32 format and save it to disk |  |
| --interactive | false | Interactively prompt user for BIP39 passphrase and mnemonic |  |
| --ledger | false | Store a local reference to a private key on a Ledger device |  |
| --recover | false | Provide seed phrase to recover existing key instead of creating |  |
| --no-backup | false | Don't print out seed phrase \(if others are watching the terminal\) |  |
| --dry-run | false | Perform action, but don't add key to local keystore |  |
| --hd-path |  | Manual HD Path derivation \(overrides BIP44 config\) |  |
| --coin-type | 118 | coin type number for HD derivation |  |
| --account | 0 | Account number for HD derivation |  |
| --index | 0 | Address index number for HD derivation |  |
| --algo | secp256k | Key signing algorithm to generate keys for |  |

#### Create a new key

The following example will create a key in the local keystore named `MyKey` :

```text
terpd keys add MyKey
```

Enter and repeat the password, at least 8 characters, then you will get a new key.

{% hint style="danger" %}
**WARNING**

write the seed phrase in a safe place! It is the only way to recover your account if you ever forget your password, and/or something happens to your local keystore.
{% endhint %}

#### Recover an existing key from seed phrase

If you forget your password or lose your key, or you would like to use your key in another place, you can recover your key by using the `--recover` flag. 

The following example will recover a key with the seed phrase and store it in the local keystore with the name `MyKey`:

```text
terpd keys add MyKey --recover
```

You'll be asked to enter and repeat the new password for your key, and enter the seed phrase. Then you get your key back.

```text
Enter a passphrase for your key:
Repeat the passphrase:
Enter your recovery seed phrase:
```

#### Create a multisig key 

The following example creates a multisig key with 3 sub-keys, and specify the minimum number of signatures as 2. The transaction could be broadcast only when the number of signatures is greater than or equal to 2.

```text
terpd keys add <multisig-keyname> --multisig-threshold=2 --multisig=<signer-keyname-1>,<signer-keyname-2>,<signer-keyname-3>
```

{% hint style="info" %}
**TIP**

`<signer-keyname>` can be the type of "local/offline/ledger", but not "multi" type.

If you don't have all the permission of sub-keys, you can ask for the `pubkey`'s to create the offline keys first, then you will be able to create the multisig key.

Offline key can be created by `terpd keys add --pubkey`.
{% endhint %}

How to use multisig key to sign and broadcast a transaction, please refer to multisign.

### terpd keys delete >

Delete a local key by the given name.

```text
terpd keys delete <key-name> [flags]
```

**Flags:**

| Name, shorthand | Default | Description | Required |
| :--- | :--- | :--- | :--- |
| --force, -f | false | Remove the key unconditionally without asking for the passphrase |  |
| --yes, -y | false | Skip confirmation prompt when deleting offline or ledger key references |  |

#### Delete a local key 

The following example will delete the key named `MyKey` from the local keystore:

```text
terpd keys delete MyKey
```

### terpd keys export 

Export the keystore of a key to stdout:

```text
terpd keys export <key-name> [flags]
```

#### Export keystore 

The following example will export the key named `MyKey` to stdout:

```text
terpd keys export Mykey
```

### terpd keys import

Import a ASCII armored private key into the local keybase.

```text
terpd keys import <name> <keyfile> [flags]
```

#### Import a ASCII armored private key 

The following example will import the private keys from `key-to-import.json` and store it in the local keystore with the name `MyKey`

```text
terpd keys import MyKey key-to-import.json [flags]
```

### terpd keys list 

List all the keys from the local keystore that have been stored by this key manager, along with their associated name, type, address and pubkey.

**Flags:**

| Name, shorthand | Default | Description | Required |
| :--- | :--- | :--- | :--- |
| --list-name |  | List names only |  |

#### List all keys 

The following example will list all keys in the local keystore managed by the terpd key manager:

```text
terpd keys list
```

### terpd keys mnemonic 

Create a `bip39` mnemonic, sometimes called a seed phrase, by reading from the system entropy. To pass your own entropy, use `unsafe-entropy` mode.

```text
terpd keys mnemonic [flags]
```

**Flags:**

| Name, shorthand | Default | Description | Required |
| :--- | :--- | :--- | :--- |
| --unsafe-entropy |  | Prompt the user to supply their own entropy, instead of relying on the system |  |

#### Create a bip39 mnemonic 

The following example will create a new `bip39` seed phrase:

```text
terpd keys mnemonic
```

You'll get a `bip39` mnemonic with 24 words, e.g.:

```text
saddle lunch prefer aspect domain woman relief swarm exist behind cliff shadow meadow joke tower inherit upon tragic glow air march envelope joke estate
```

### terpd keys parse 

Convert and print to stdout key addresses and fingerprints from hexadecimal into `bech32` terp prefixed format and vice versa.

```text
terpd keys parse <hex-or-bech32-address> [flags]
```

#### Convert and print to stdout key addresses from hex fingerprint

The following example will convert a given hex fingerprint to a range of bep32 human readable address formats:

```text
terpd keys parse 313EDF382E938D41E787B3C6366719009640C6F1
```

Returns:

```text
formats:
- terp1xyld7wpwjwx5reu8k0rrveceqztyp3h3z25gdr
- terppub1xyld7wpwjwx5reu8k0rrveceqztyp3h3v345x5
- terpvaloper1xyld7wpwjwx5reu8k0rrveceqztyp3h3ahz8k6
- terpvaloperpub1xyld7wpwjwx5reu8k0rrveceqztyp3h3jcymy9
- terpvalcons1xyld7wpwjwx5reu8k0rrveceqztyp3h3fy3m6m
- terpvalconspub1xyld7wpwjwx5reu8k0rrveceqztyp3h3rulnw5
```

Convert and print to stdout hex fingerprint from bep32 address:

```text
terpd keys parse terp1xyld7wpwjwx5reu8k0rrveceqztyp3h3z25gdr
```

Returns:

```text
human: terp
bytes: 313EDF382E938D41E787B3C6366719009640C6F1
```

### terpd keys show 

Get details of a local key.

```text
terpd keys show <key-name> [flags]
```

**Flags:**

| Name, shorthand | Default | Description | Required |
| :--- | :--- | :--- | :--- |
| --address | false | Output the address only \(overrides --output\) |  |
| --bech | acc | The Bech32 prefix encoding for a key \(acc/val/cons\) |  |
| --device | false | Output the address in a ledger device |  |
| --multisig-threshold | 1 | K out of N required signatures |  |
| --pubkey | false | Output the public key only \(overrides --output\) |  |

#### Get details of a local key

The following example will return the details for the key named `MyKey` :

```text
terpd keys show MyKey
```

The following infos will be shown:

```text
- name: MyKey
  type: local
  address: terp1njgpy0g450wh02z8m7yce7r08fmflflkgv367j
  pubkey: terppub1addwnpepqvcfcuf84pu08cpqthv8qe2qkyrwu8p9za0c9d8fp5pl4sllwhejx66rxyu
  mnemonic: ""
  threshold: 0
  pubkeys: []
```

#### [\#](https://www.irisnet.org/docs/cli-client/keys.html#get-validator-operator-address)Get validator operator address 
If an address has been bonded to be a validator operator \(which the address you used to create a validator\), then you can use `--bech val` to get the operator's address prefixed by `terp` and the pubkey prefixed by `terp`:

```text
terpd keys show MyKey --bech val
```

Example Output:

```text
- name: Mykey
  type: local
  address: terp1tulwx2hwz4dv8te6cflhda64dn0984hakwgk4f
  pubkey: terp1addwnpepq24rufap6u0sysqcpgsfzqhw3x8nfkhqhtmpgqt0369rlyqcg0vkgd8e6zy
  mnemonic: ""
  threshold: 0
  pubkeys: []
```