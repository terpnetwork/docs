---
title: production build
description: "- merkltree-server: - headstash tree initalization scripts - wasm-bindgen + html website support - local-terp (zk-cosmwasmvm flavored) + cw-headstash"
status: partial
desscription: learn how to build a web-app that uses a wasm file to manage headstash notes
---
## Prerequesites

- merkltree-server:
- headstash tree initalization scripts
- wasm-bindgen + html website support
- local-terp (zk-cosmwasmvm flavored) + cw-headstash

## Steps

1. Prepare Testing Data & Spin Up Testing Environemnt
2. Generate Wasm + Wasm Bindgen Logic
3. Integrate And Test Via Frontend

**Yes, you can build standard WebAssembly (WASM) binaries that run directly in any modern browser.** There is **no special "browser-only" binary format** — the `.wasm` file is the exact same portable binary format everywhere. The browser-specific part is how you **load and interact** with it using the built-in **WebAssembly JavaScript API** (available in all browsers since ~2017).

The "API design" for browser use is simple and universal:

- **Exports**: Functions, memory, tables, globals that JavaScript can call.
- **Imports**: JavaScript functions/objects that the WASM module can call (e.g. `console.log`, DOM APIs, etc.).
- **Linear memory**: A big resizable `ArrayBuffer` for passing strings, arrays, objects, etc.
- No file system, no threads (unless you use experimental APIs), no OS — that's why **no_std** is common in Rust.

This is the same model whether you're using raw low-level WASM or high-level tools.

### Best & Most Common Way (2026): Rust + wasm-pack + wasm-bindgen

This is the smoothest developer experience and what most people mean when they say "WASM in the browser".

#### 1. Setup (once)

```bash
rustup target add wasm32-unknown-unknown
cargo install wasm-pack
```

## 2. Create a library crate

```bash
cargo new my_wasm --lib
cd my_wasm
```

## 3. Cargo.toml

```toml
[lib]
crate-type = ["cdylib"]

[dependencies]
wasm-bindgen = "0.2"
```

## 4. src/lib.rs (example)

```rust
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub fn greet(name: &str) -> String {
    format!("Hello, {} from Rust + WASM!", name)
}

// You can also import JS functions
#[wasm_bindgen]
extern "C" {
    fn alert(s: &str);
}

#[wasm_bindgen]
pub fn show_alert() {
    alert("This is called from Rust!");
}
```

**About no_std**:

- You **can** (and often should) add `#![no_std]` + `extern crate alloc;` for tiny binaries.
- `wasm-bindgen` works perfectly with `no_std` + `alloc`.
- `std` technically works on `wasm32-unknown-unknown` but is heavier and unnecessary for browser use (no filesystem, etc.).

## 5. Build it

```bash
# For direct browser use (no bundler)
wasm-pack build --target web

# For webpack/vite/rollup/etc.
wasm-pack build --target bundler
```

This creates a `pkg/` folder with:

- `my_wasm_bg.wasm` ← the actual binary
- `my_wasm.js` + `.d.ts` ← nice glue code (handles strings, objects, etc.)

## 6. Use it in the browser (index.html)

```html
<!DOCTYPE html>
<script type="module">
  import init, { greet, show_alert } from './pkg/my_wasm.js';

  await init();           // loads the .wasm
  console.log(greet("World"));
  show_alert();
</script>
```

Or with a bundler (Vite/Webpack):

```js
import init, { greet } from 'my_wasm';
await init();
```

## Raw / Low-Level Way (no wasm-bindgen)

If you want zero dependencies:

```rust
#[no_mangle]
pub extern "C" fn add(a: i32, b: i32) -> i32 {
    a + b
}
```

Build with plain `cargo build --target wasm32-unknown-unknown --release`, then in JS:

```js
const { instance } = await WebAssembly.instantiateStreaming(
  fetch("./target/wasm32-unknown-unknown/release/my_wasm.wasm")
);
console.log(instance.exports.add(2, 3)); // 5
```

## Other Languages (quick mention)

- **C/C++**: Use Emscripten (`emcc -sWASM=1 file.c -o file.js`).
- **AssemblyScript**: TypeScript → WASM (very web-friendly).
- **Go**: `GOOS=js GOARCH=wasm go build`.

### Important Distinctions (Browser vs Elsewhere)

- **Do NOT use `wasm32-wasi`** for browsers — WASI is for servers/CLI (filesystem, sockets, etc.). Browsers don't implement it natively. Use `wasm32-unknown-unknown` + JS interop.
- The **WebAssembly JavaScript API** (`WebAssembly.instantiateStreaming`, `WebAssembly.Memory`, `instance.exports`, import objects) is the official browser interface. Everything else (wasm-bindgen, Emscripten glue, etc.) is just convenient wrappers around it.

### Optimization Tips

- `wasm-pack` already optimizes.
- For even smaller/faster: `wasm-opt -Oz` (from binaryen).
- Enable LTO and `panic = "abort"` in Cargo.toml for tiny binaries.

That's literally all there is to it. The ecosystem is mature — most people just run `wasm-pack build --target web` and get a drop-in npm package or direct browser module.

If you want a minimal ready-to-run repo example, tell me your preferred target (`web` vs `bundler`) or language and I'll give you the exact commands + files!
