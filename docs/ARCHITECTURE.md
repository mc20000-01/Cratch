# Architecture Decisions (ADR Summary)

## ADR-001: Monorepo for web + desktop

We keep `apps/web`, `apps/desktop`, and `crates/*` in a single repository to align compiler and editor changes in one PR.

## ADR-002: Compiler source of truth in Rust

Compilation and semantic validation live in Rust crates and are exposed to web via wasm bindings.

## ADR-003: Versioned project schema

Project files include `schema_version` to support migration and compatibility checks during import.

## ADR-004: Defensive UX around failures

The web entrypoint uses startup/runtime fatal states and React Error Boundaries so users see actionable failures instead of blank screens.
