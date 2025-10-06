# Wallet Saftey 


## Hot and cold keys
To touch on a point of vocabulary, all key management products described above can be considered hot, in that it can and must produce valid signatures at any time. This is a higher security risk compared to **cold** keys, which are kept out of a networked computer altogether, or at least require human approval before being accessed (like an HSM device stored in your desk drawer).

Your validator operator and potential delegator keys should be **cold**.


## What are validator keys?
A validator handles two, perhaps three, different keys. Each has a different purpose:

1. **The Tendermint consensus key** is used to sign blocks on an ongoing basis. It is of the key type ed25519, which the KMS can keep. When Bech-encoded, the address is prefixed with `terpvalcons` and the public key is prefixed with `terpvalconspub`.

2. **The validator operator application key** is used to create transactions that create or modify validator parameters. It is of type secp256k1, or whichever type the application supports. When Bech-encoded, the address is prefixed with `terpvaloper`.

3. **The delegator application key** is used to handle the stake that gives the validator more weight. When Bech-encoded, the address is prefixed with `terp` and the public key is prefixed with `terppub`.
 disc
Most likely keys 2 and 3 are the same when you are a node operator.


## Private key security considerations
More precisely than needing ongoing access to private keys, validators only need the capability to sign blocks on an ongoing basis. There is a security difference between access to the private key and access to a signing facility:

1. When your validator has access to the private key, if your validator node has been compromised then your private key is too, and you are at the risk of wrongfully signing malicious blocks *forever*.
2. On the other hand, when you only provide a signing service to your validator, if your validator node has been compromised then you are only at the risk of wrongfully signing malicious blocks for *as long as the signing service is up*.

In order to mitigate the danger of **point 1**, you can keep your private key in a hardware security module (a.k.a. HSM), from which it can be retrieved only once, during the HSM's offline setup. This HSM device then remains plugged into the computer that runs the validator or the signing service. See here for the current list of supported devices. To use an HSM you own, you need physical access to the computer into which you plug it.

To implement point 2, you can use a specialized key management system(KMS). This runs on a computer separate from your validator node but has access to the hardware key and contacts your validator node(s) over the private network (or is contacted by your validator node(s)) for the purpose of signing blocks. Such a KMS is specialized in the sense that it is, for instance, able to detect attempts to sign two different blocks at the same height.

You can combine these strategies. For instance, if you insist on using an HSM and having your validator node located in the cloud, you can run the KMS on the computer the HSM is physically plugged into, which dials into your remote validator node to provide the signing service.