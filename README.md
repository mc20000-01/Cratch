# ScratchLowLevel

A block-based, low-level programming project with:

- a browser app (GitHub Pages deploy)
- desktop apps (Linux, Windows, macOS via Tauri releases)

## Stack

- **Frontend**: React + TypeScript + Vite
- **Desktop shell**: Tauri
- **Compiler core**: Rust
- **Shared model**: JSON AST/Project format
- **Future path**: wasm build for browser-side compilation

## Run locally

```bash
pnpm install
pnpm dev:web
```

Desktop dev:

```bash
pnpm dev:desktop
```

## Build locally

Web build:

```bash
pnpm build:web
```

Desktop bundle for your current OS:

```bash
pnpm build:desktop
```

## GitHub Pages setup (real website)

1. Push this repo to GitHub as **Cratch** under your account/org.
2. In **Settings → Pages**, set **Source** to **GitHub Actions**.
3. Push to `main` (or run the `web-release` workflow manually).
4. The site is deployed from `apps/web/dist` to:
   - `https://<owner>.github.io/Cratch/`

Notes:

- Vite production base path is set to `/Cratch/`.
- If you rename the repo, update `apps/web/vite.config.ts` base path.

## Desktop builds for Linux, Windows, macOS

Create a git tag to trigger release builds on all three platforms:

```bash
git tag desktop-v0.1.0
git push origin desktop-v0.1.0
```

The `desktop-release` workflow builds and publishes Tauri bundles for:

- Ubuntu (Linux)
- Windows
- macOS

## Repo layout

```text
apps/
  web/        React/Vite editor
  desktop/    Tauri shell
crates/
  compiler-core/  Rust compiler + C emitter
  compiler-wasm/  browser bridge (stub)
```

## Extension docs

See `docs/EXTENSIONS.md` for manifest schema, compatibility checks, and failure cases.

## Adding compiler fixtures

1. Add a new case folder under `crates/compiler-core/tests/fixtures/valid/<case>` or `crates/compiler-core/tests/fixtures/invalid/<case>`.
2. Add `project.json` with the project AST payload.
3. For valid fixtures, add `expected.c` with the exact C output snapshot.
4. For invalid fixtures, add `expected.diagnostic` with the exact compiler error text.
5. Mirror the case in `apps/web/src/compiler/__fixtures__/compiler-fixtures.ts` to keep wasm bridge integration tests in sync.
6. Run `cargo test -p compiler-core` and `pnpm --dir apps/web test` before opening a PR.
