---
title: 1. Workspace setup
sidebar_position: 1
---

# Initial Development Workspace Environment setup

This tutorial will guide you through the process of setting up an Development Workspace Environment (DWE) for developing CosmWasm smart contracts. Since CosmWasm contracts are currently built using Rust, this tutorial will focus on setting up your DWE for Rust development.

# Prerequisites
Please refer to the Installation guide to [install](./installation.md) the Rust compiler (rustc) before proceeding.

# Install visual studio code

Visual Studio Code (VS Code) is a very popular, free, and open-source IDE. It has a rich source code editor, integrated git, and debugging with various extensions that add a lot of features and support for various languages including Rust, Go, C++, Java, Python, PHP, etc. The IDE is available for Windows, macOS, and Linux operating systems.

Please refer to the steps below for your respective operating system:

<Container>
<Tabs>
<TabItem value="macOs" label="macOS">

1. [Download Visual Studio Code](https://code.visualstudio.com/Download) for macOS.
2. Open the browser's download list and locate the downloaded app or archive.
3. If archive, extract the archive contents. Use double-click for some browsers or select the 'magnifying glass' icon with Safari.
4. Drag Visual Studio Code.app to the Applications folder, making it available in the macOS Launchpad.
5. Open VS Code from the Applications folder, by double-clicking the icon.
Add VS Code to your Dock by right-clicking on the icon, located in the Dock, to bring up the context menu and choosing Options, Keep in Dock.

</TabItem>

<TabItem value="windows" label="Windows">

1. Download the [Visual Studio Code installer](https://code.visualstudio.com/docs?dv=win) for Windows.
2. Once it is downloaded, run the installer.

</TabItem>

<TabItem value="linux" label="Linux">

See the [Download Visual Studio Code](https://code.visualstudio.com/download) page for a complete list of available installation options. For more detailed instructions on installing via the terminal for various distributions, see [Visual Studio Code on Linux](https://code.visualstudio.com/docs/setup/linux).

</TabItem>
</Tabs>
</Container>

# Configure VSCode
To enable Rust support in VS Code, you need to install a few extensions, namely **rust-analyzer** and **CodeLLDB**, that provide syntax highlighting, code completion, debugging capabilities and other essential functionalities.

#### Rust-analyzer 
The rust-analyzer extension is a language server for the Rust programming language, which provides features such as code completion, error checking, and documentation while writing Rust code in VS Code.

Follow these steps to install the extension:

1. Go to the **Extension** panel
2. In the Search field enter **rust-analyzer**
3. Click the **install** button to the bottom right of **rust-analyzer**

For additional information as to the benefits and features of rust-analyzer, see the rust-analyzer [User Manual](https://rust-analyzer.github.io/manual.html).

#### CodeLLDB
The **CodeLLDB** extension is a native debugger used for debugging Rust and other compiled languages.

Follow these steps to install the extension:
1. Go to the **Extension** panel
2. In the **Search** field enter **CodeLLDB**
3. Click the **install** button to the bottom right of **CodeLLDB**

For full details on how to use the CodeLLDB extension, please see the [Manual](https://github.com/vadimcn/codelldb/blob/v1.9.0/MANUAL.md).


# Cosmy wasmy
[Cosmy Wasmy](https://marketplace.visualstudio.com/items?itemName=spoorthi.cosmy-wasmy) is a VS Code plugin that simplifies the process of developing and interacting with CosmWasm smart contracts. It comes pre-configured with the most popular testnets for CosmWasm chains, making chain interactions during testing a breeze. With Cosmy Wasmy, you can perform all interactions within VS Code without having to use the CLI.
For more information about installation, configuration, and the commands and features available, check out [Cosmy Wasmy](https://marketplace.visualstudio.com/items?itemName=spoorthi.cosmy-wasmy).

# CosmWasm IDE

CosmWasm IDE is another tool that streamlines the development and deployment processes for CosmWasm smart contracts. It integrates with VSCode, Gitpod and Keplr to create a user-friendly yet powerful environment for building, deploying, and interacting with CosmWasm smart contracts. With Gitpod, CosmWasm developers can create smart contracts directly in their browsers. The tool is currently maintained by Oraichain and CosmWasm.

The CosmWasm IDE consists of three sub-repositories:

- [CosmWasm Gitpod](https://github.com/oraichain/cw-ide-gitpod) functions as a Gitpod builder that automatically creates a comprehensive development environment, including Rust installation, a browser-based VS Code, essential VS Code extensions, and full compatibility with the Keplr wallet. With this repository, CosmWasm developers can avoid spending hours on tool and library installations, while also feeling secure when deploying contracts using Keplr.

- The [CosmWasm IDE extension](https://github.com/oraichain/cw-ide-vscode) is a VS Code extension that incorporates all the essential functionalities for building and deploying CosmWasm smart contracts with just a few simple button clicks within VSCode.

- The [CosmWasm IDE extension webview](https://github.com/oraichain/cw-ide-webview) is a React application that sits atop the CosmWasm IDE Extension. It handles connections with the Keplr wallet and displays inputs for deploying and interacting with smart contracts. Additionally, it enables the addition of custom networks.

You can find additional CosmWasm IDE documentation on the official [Oraichain documentation](https://docs.orai.io/developers/cosmwasm-ide/tutorial-01) site.