# ScratchLowLevel Scaffold

A block-based, low-level programming scaffold for **web + desktop**.

## Stack
- **Frontend**: React + TypeScript + Vite
- **Desktop shell**: Tauri
- **Compiler core**: Rust
- **Shared model**: JSON AST/Project format
- **Future path**: wasm build for browser-side compilation

## What this scaffold includes
- block registry
- extension manifest schema
- typed project model
- Rust compiler core that emits C
- Tauri desktop command stubs
- React workspace/palette/editor shell
- project export/import wiring

## Repo layout
```text
apps/
  web/        React/Vite editor
  desktop/    Tauri shell
crates/
  compiler-core/  Rust compiler + C emitter
  compiler-wasm/  browser bridge (stub)
```

## Next steps
1. Run `cargo test -p compiler-core`
2. Hook the React editor to the shared project model
3. Add wasm build for browser compilation
4. Add optimization passes and ASM backend

## Notes
This is a scaffold, not a finished product.
Pin dependency versions before shipping.
