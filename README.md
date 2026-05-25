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

## Extension docs

See `docs/EXTENSIONS.md` for manifest schema, compatibility checks, and failure cases.

## Adding compiler fixtures

Use fixtures to grow the compiler test matrix safely.

1. Add a new case folder under `crates/compiler-core/tests/fixtures/valid/<case>` or `crates/compiler-core/tests/fixtures/invalid/<case>`.
2. Add `project.json` with the project AST payload.
3. For valid fixtures, add `expected.c` with the exact C output snapshot.
4. For invalid fixtures, add `expected.diagnostic` with the exact compiler error text.
5. Mirror the case in `apps/web/src/compiler/__fixtures__/compiler-fixtures.ts` to keep the wasm bridge integration tests in sync.
6. Run `cargo test -p compiler-core` and `pnpm --dir apps/web test` before opening a PR.

CI requires both `rust-tests` and `web-tests` jobs to pass for merges.
