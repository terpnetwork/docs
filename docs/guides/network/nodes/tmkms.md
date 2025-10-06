---
title:  c. tmkms - setup key management
sidebar_position: 3
---

[Tmkms](https://github.com/iqlusioninc/tmkms) is a solution to avoiding the risk that surfaces when handling validator private key signatures. 


## Prerequisites
- Rust (stable; 1.72+): https://rustup.rs/
- C compiler: e.g. gcc, clang
- pkg-config
- libusb (1.0+). Install instructions for common platforms:
    - Debian/Ubuntu: apt install libusb-1.0-0-dev
    - RedHat/CentOS: yum install libusb1-devel
    - macOS (Homebrew): brew install libusb

## Installation 
```
cargo install tmkms --features=yubihsm --version=0.4.0
```

## Configuration: `tmkms init`
The `tmkms init` command can be used to generate a directory containing the configuration files needed to run the KMS. Run the following:

```
$ tmkms init /path/to/kms/home
```

This will output a `tmkms.toml` file, a `kms-identity.key` (used to authenticate
the KMS to the validator), and create `secrets` and `state` subdirectories.

Please look through `tmkms.toml` after it's generated, as various sections
will require some customization.

## Running: `tmkms start`

## Further Resources