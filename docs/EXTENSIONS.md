# Extension Authoring Guide

## 1) Create a manifest

Define `id`, `version`, `apiVersion`, `blocks`, and `loweringEntrypoints`.

## 2) Keep compatibility

`apiVersion` must match `EXTENSION_API_VERSION` in host apps.

## 3) Block kinds

Allowed kinds: `expression`, `statement`, `control`, `definition`.

## 4) Runtime snippets

Optional `runtimeSnippets` may include C helper code referenced by lowering.

## 5) Validation workflow

Run `pnpm test` and verify the manifest loads via `loadBlocksFromManifests`.
