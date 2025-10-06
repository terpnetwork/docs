**Additions to the Documentation (with Explanations)**

### **Chain Coin Types & Key Derivation**

#### **Chain-Specific Coin Types and Public Keys**

| Chain      | Coin Type | HD Path Derivation       | Address Prefix | Example Address                                  | Public Key Format                              |
|------------|-----------|-------------------------|---------------|---------------------------------------------------|--------------------------------------------------|
| Bitsong    | 639       | `m/44'/638'/0'/0/0`     | `bitsong1`     | `bitsong1fts0sdw08e5kj02qev8hkmuwgr3wr2rxcu5pzh` | `secp256k1.PubKey` (e.g., `AhLtDAH/GIPq0P...`) |
| Terp Network | 114      | `m/44'/114'/0'/0/0`    | `terp1`       | `terp1fts0sdw08e5kj02qev8hkmuwgr3wr2rxnl092t`  | `secp256k1.PubKey` (e.g., `AstFP+gaDhAme2X...`) |

#### **Bech32 Conversion Between Chains**

| Original Address | Target Prefix | Converted Address                                  |
|------------------|--------------|------------------------------------------------------|
| `bitsong1...`    | `terp`       | `terp1fts0sdw08e5kj02qev8hkmuwgr3wr2rxnl092t`  |
| `terp1...`      | `cosmos`     | `cosmos1cmnqt4zfdy2eel9v4pau0qq4yvnjmzqszcna` |

#### **Manual Key Derivation for Import**

```sh
# For Bitsong (Coin Type 639)
terpd keys add <name> --hd-path "m/44'/638'/0'/0/0"

# For Terp Network (Coin Type 114)
terpd keys add <name> --hd-path "m/44'/114'/0'/0/0"
```

---

### **Explanation: How Chain Types Lead to Different Public Keys**

#### **Why Different Chains, Different Public Keys?**

1. **Coin Type (Chain ID)**: Each chain has a unique `Coin Type` (e.g., 639 for Bitsong, 114 for Terp Network). This ID is crucial for deriving keys to ensure compatibility and security within each chain's ecosystem.
   
2. **HD Path Derivation**:
   - **Hierarchical Deterministic (HD) Wallets** use a standardized path format (`m/44'/coin_type'/account'/change'/index`) to derive keys.
   - The `coin_type'` segment is where the chain's unique identifier is inserted, making the derivation path chain-specific. **This is the primary reason for different public keys across chains**; the same seed phrase used with different `coin_type` values will generate entirely different key pairs.
   - **Example**:
     - Same Seed Phrase used for:
       - Bitsong (`m/44'/638'/...`) → **Public Key A**
       - Terp Network (`m/44'/114'/...`) → **Public Key B (Different from A)**

3. **Address Prefix**:
   - Each chain has its unique Bech32 address prefix (e.g., `bitsong1`, `terp1`, `cosmos1`).
   - **Conversion** (as shown in examples) involves changing the prefix but **does not alter the underlying public key**. The public key remains the same; only the address format (for compatibility) changes.

#### **Resolving Key Differences in Context**

- **Scenario**: Managing Assets Across Both Chains (Bitsong & Terp Network)
  
- **Challenges**:
  1. **Different Public Keys**: Due to chain-specific HD paths.
  2. **Address Format**: Different Bech32 prefixes.

- **Solutions**:
  1. **Use Chain-Specific Wallets or Software**: Configure each for its respective HD path.
     - **Example**: For Bitsong, use `m/44'/638'/0'/0/0`; for Terp, `m/44'/114'/0'/0/0`.
  2. **Bech32 Conversion Tools**: For address compatibility, without altering the public key.
     - **Example**: Convert `bitsong1...` to `terp1...` for operational needs, but note the **public key remains unchanged**.
  <!-- 3. **Unified Wallet Solutions (if available)**: Some advanced wallets support multiple chains, managing the complexity internally. -->

#### **Key Takeaways**

- **Same Seed, Different Chains, Different Keys**: Due to chain-specific HD paths.
- **Address Conversion ≠ Key Change**: Only the address format changes for compatibility.
- **Always Verify Chain Compatibility**: When importing keys or converting addresses.