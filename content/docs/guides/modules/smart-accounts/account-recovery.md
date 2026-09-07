---
title: Account Recovery
description: Pointers for recovering smart-account control — full operational guide lives under authentication
status: partial
---
Operational backup and recovery (mnemonics, keyring, secondary authenticators, composition) is documented here:

**[Backup and Recovery](/docs/guides/authentication/backup-and-recovery)**

## Smart-account-specific notes

- Authenticator IDs are required in `TxExtension.selected_authenticators`. Losing track of which IDs you rely on is an operational outage even if keys exist.
- Prefer **tested secondary keys** (`SignatureVerification` + `AnyOf`) over untested social schemes.
- Guardian / time-lock / social recovery **modules** are not documented as complete products on this page. Implement via CosmWasm authenticators if you need custom policy.

## Related

- [Authenticators](/docs/guides/authentication/authenticators)
- [Two-factor auth (stub)](/docs/guides/modules/smart-accounts/two-factor-auth)
- [Composite authenticators](/docs/guides/authentication/authenticators/composite)
