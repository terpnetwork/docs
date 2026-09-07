---
title: Key safety
description: Hot vs cold keys, validator key types, and hardware / KMS considerations on Terp Network
status: complete
---
## Hot and cold keys

| | Hot | Cold |
|---|-----|------|
| Access | Can sign at any time on a networked device | Offline or human-gated (HSM, air-gapped) |
| Typical use | Daily spend, dApp UX | Validator operator funds, large treasuries |
| Risk | Higher if device compromised | Lower online attack surface |

Browser wallets (e.g. Keplr) are **hot**. Ledger is **colder** for account keys. Validator **consensus** signing needs continuous availability — use KMS/HSM patterns, not a browser wallet.

## Validator-related keys

A validator may handle several key roles:

1. **Consensus key** (`ed25519`) — signs blocks continuously. Bech32 often `terpvalcons` / `terpvalconspub`. Prefer TMKMS / HSM; never leave raw key on a public host.
2. **Operator key** (`secp256k1`) — create/edit validator params. Bech32 `terpvaloper`. Prefer cold or hardware.
3. **Delegator / account key** — stake and transfers. Bech32 `terp` / `terppub`.

Operator and delegator are often the same account for small operators; separate them as stake grows.

## Private key vs signing facility

| Model | If the validator host is compromised |
|-------|--------------------------------------|
| Host holds raw private key | Key may be stolen → ongoing double-sign risk until key is rotated/tombstoned |
| Host only gets signatures from KMS/HSM | Risk limited to the window the signing service remains reachable |

**Mitigations**

- HSM: key material rarely (or never) leaves the device after setup
- KMS: separate machine provides signatures over a private network; can rate-limit and detect double-sign attempts
- Combine: HSM plugged into KMS host, KMS dials remote validator

See [TMKMS](/docs/guides/network/nodes/tmkms) and [Sentry array](/docs/guides/network/validators/sentry).

## Everyday wallet hygiene

- Never type a seed into a website form
- Prefer hardware for large balances
- Verify chain ID (`morocco-1` / `90u-4`) and fee denom before signing
- Keep a tested recovery path ([backup](/docs/guides/authentication/backup-and-recovery))

## Related

- [Wallets hub](/docs/guides/authentication/wallets)
- [Validators](/docs/guides/network/validators)
- [Backup & recovery](/docs/guides/authentication/backup-and-recovery)
