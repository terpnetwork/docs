---
title: Backup and Recovery
description: Back up terpd key material, restore accounts, and use smart-account authenticators for secondary-key recovery — without inventing unregistered passkey types
status: complete
---
Losing the only key that controls an account means losing control of funds and on-chain identity. This guide covers **what is shipped today** in Terp tooling: CLI key backup/restore, and **smart-account authenticator** patterns for secondary keys and rotation.

## What is in scope (honest boundary)

| Supported now | Not documented as a chain-native product here |
|---------------|-----------------------------------------------|
| Mnemonic / keyring export & restore via `terpd keys` | A dedicated **PassKey / WebAuthn** authenticator type registered in app keepers |
| Hardware wallet custody (Ledger guide) | Social recovery module with guardians (stub pages remain stubs) |
| Secondary `SignatureVerification` authenticators + `AnyOf` / `AllOf` composition | Single-use “hash of phrase then reveal” recovery **unless** you implement it yourself as CosmWasm |

Registered authenticator types on Terp (from `app/keepers` `InitializeAuthenticators` + CosmWasm register):

- `SignatureVerification`
- `MessageFilter`
- `AllOf` / `AnyOf` / partitioned variants
- CosmWasm authenticator

If you need passkey-like UX, implement verification **inside a CosmWasm authenticator contract** (or a future core type once it is registered and covered by tests). Do not assume a type string from unit tests is live on mainnet.

## Key backup

### Mnemonic phrases

When you create a key:

```bash
terpd keys add my-wallet
## Write the 12/24-word mnemonic offline. The CLI will not show it again.
```

Rules:

- Store offline (paper, steel, or encrypted offline volume).
- Never paste mainnet mnemonics into chat, tickets, or web forms.
- Separate **testnet** keys from **mainnet** keys.

## Private keys and armor

```bash
## Export private key (dangerous — prefer only for migration between air-gapped machines)
terpd keys export my-wallet

## Show address / pubkey without exporting secrets
terpd keys show my-wallet -a
terpd keys show my-wallet --pubkey
```

Prefer hardware devices for value: [Ledger](/docs/guides/authentication/wallets/ledger).

## Keyring backends

| Backend | Typical use |
|---------|-------------|
| `os` / `file` | Developer laptop (OS keychain or encrypted file) |
| `test` | Localnet / CI only — **unencrypted** |
| `pass` / hardware | Stronger operational setups |

```bash
terpd keys list --keyring-backend test
terpd keys list --keyring-backend os
```

Key files live under your node/CLI home (often `~/.terpd/keyring-*`). Back up that directory only if you understand encryption at rest for the chosen backend.

## Restore

### From mnemonic

```bash
terpd keys add my-wallet --recover
## Paste mnemonic when prompted
terpd keys show my-wallet -a
## Address must match the original account
```

## From armored private key

```bash
terpd keys import my-wallet ./my-wallet.asc
```

## Hardware

Re-link the device in the wallet app; the seed never leaves the device. See [Ledger](/docs/guides/authentication/wallets/ledger) and [Wallet safety](/docs/guides/authentication/wallets/safety).

## Smart-account recovery patterns

Smart accounts do **not** replace mnemonic backup for the root Cosmos key unless you deliberately move authority into authenticators and practice those paths.

### Secondary key (rotation / hot wallet)

1. Generate a new key: `terpd keys add recovery-hot`
2. Register its pubkey as `SignatureVerification` — [guide](/docs/guides/authentication/authenticators/signature-verification)
3. Submit txs with `TxExtension.selected_authenticators` pointing at that authenticator id
4. After confidence, remove or stop using the old authenticator

### Dual control (AnyOf / AllOf)

- **AnyOf** — either key A or key B can authorize (good for “laptop or phone” *if* both are secure)
- **AllOf** — both required (closer to 2-of-2; losing one key **locks** you out)

See [Composite authenticators](/docs/guides/authentication/authenticators/composite).

### Custom recovery via CosmWasm

For guardian sets, time delays, or passkey assertions, implement policy in a CosmWasm authenticator contract and register `CosmwasmAuthenticatorV1` (see [Safe-word contract](/docs/guides/authentication/authenticators/safeword-contract) as a pattern sample — not a recovery product).

Design checklist:

1. How is recovery **initiated** (msg type, delay, public signal)?
2. Who can **approve** (keys, guardians, ZK credential)?
3. What is the **failure mode** if a guardian disappears?
4. Test the full path on [localnet](/docs/guides/network/deploy/local) before mainnet.

## Best practices

| Practice | Why |
|----------|-----|
| Multiple offline mnemonic copies | Single point of physical failure |
| Geographic separation | Fire / theft / travel |
| Test restore on a throwaway machine | Detect bad backups before disaster |
| Never use `test` keyring for mainnet | Unencrypted material |
| Practice authenticator rotation on testnet | Muscle memory for real incidents |
| Document authenticator IDs you rely on | IDs are required in `selected_authenticators` |

## Verify

| Check | Action |
|-------|--------|
| Mnemonic restores same address | `keys add --recover` then compare `keys show -a` |
| Secondary authenticator works | Tx with selected authenticator succeeds; without it fails |
| Removal is intentional | After `MsgRemoveAuthenticator`, old path must fail |

## Related concepts

- [Authenticators overview](/docs/guides/authentication/authenticators)
- [Wallets](/docs/guides/authentication/wallets)
- [SignatureVerification](/docs/guides/authentication/authenticators/signature-verification)
- [Composite authenticators](/docs/guides/authentication/authenticators/composite)
- [Trustlessness](/docs/overview/concepts/trustless)

## Further reading

- Module source: `x/smart-account/` (README + authenticator package)
- Keeper registration: `app/keepers/keepers.go` (`InitializeAuthenticators`)
- Stub future topics (not complete): [Account recovery (smart accounts)](/docs/guides/modules/smart-accounts/account-recovery), [Two-factor auth](/docs/guides/modules/smart-accounts/two-factor-auth)
