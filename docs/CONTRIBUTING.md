# Contributing Guide

## Coding conventions

- TypeScript: strict typing, no `any` unless unavoidable.
- React: keep UI errors user-friendly; do not leave blank failure states.
- Rust: add fixture coverage for compiler behavior changes.

## Required checks

- `pnpm lint`
- `pnpm format:check`
- `pnpm typecheck`
- `pnpm test`
- `cargo test -p compiler-core`

## Commit and release

- Use focused commits with clear scope.
- Web release tags: `web-vX.Y.Z`
- Desktop release tags: `desktop-vX.Y.Z`
- CI generates changelog and release notes from tags.
