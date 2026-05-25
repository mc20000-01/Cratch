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

## UI/UX pull request requirements

- Include before/after screenshots or recordings for UI changes.
- Document impacted user flows in the PR description.
- Add accessibility notes covering keyboard/focus/screen-reader/contrast impacts.
- Ensure at least one reviewer verifies visual behavior in the affected flow before approval.
- Tag UI-heavy PRs with the `ui-change` label to trigger visual QA attention.
- Log recurring UI issues in `docs/design-debt-backlog.md` for batched improvements.

## Commit and release

- Use focused commits with clear scope.
- Web release tags: `web-vX.Y.Z`
- Desktop release tags: `desktop-vX.Y.Z`
- CI generates changelog and release notes from tags.
- Release QA must include `docs/accessibility-checklist.md` sign-off.
