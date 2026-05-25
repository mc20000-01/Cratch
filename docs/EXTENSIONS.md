# Extension Manifest and Compatibility

ScratchLowLevel extensions are declared by a JSON manifest and are required to target the host `apiVersion`.

## Manifest schema (minimal)

```json
{
  "id": "example.consts",
  "version": "0.1.0",
  "apiVersion": 1,
  "blocks": [
    {
      "id": "example.const.answer",
      "name": "answer",
      "kind": "expression",
      "category": "example"
    }
  ],
  "loweringEntrypoints": {
    "example.const.answer": "lower_answer"
  },
  "runtimeSnippets": [
    {
      "language": "c",
      "code": "static inline int sl_answer(void) { return 42; }"
    }
  ]
}
```

## Enforced fields

- `id` (non-empty string)
- `version` (non-empty string)
- `apiVersion` (integer, must equal host API)
- `blocks` (array of `{ id, name, kind, category }`)
- `loweringEntrypoints` (`blockId -> lowering function name`)
- `runtimeSnippets` optional, each snippet currently must use `language: "c"`.

## Failure cases

1. **Incompatible API version**

```json
{ "id": "broken", "version": "1.0.0", "apiVersion": 99, "blocks": [], "loweringEntrypoints": {} }
```

Fails with: `Incompatible extension apiVersion 99. Expected 1.`

2. **Invalid block kind**

```json
{
  "id": "broken.kind",
  "version": "1.0.0",
  "apiVersion": 1,
  "blocks": [{ "id": "x", "name": "x", "kind": "widget", "category": "bad" }],
  "loweringEntrypoints": {}
}
```

Fails because `kind` must be one of `expression | statement | control | definition`.

3. **Missing lowering entrypoint function name**

```json
{
  "id": "broken.lowering",
  "version": "1.0.0",
  "apiVersion": 1,
  "blocks": [],
  "loweringEntrypoints": { "example.block": "" }
}
```

Fails because lowering entrypoint values must be non-empty strings.

## Where checks happen

- **Web app entry**: startup compatibility assertion in `apps/web/src/main.tsx`.
- **Web loader**: manifest shape validation before extension blocks are merged.
- **Desktop app entry**: startup compatibility assertion in `apps/desktop/src-tauri/src/main.rs`.
- **Rust core**: registry registration enforces `apiVersion` and provides lowering-hook lookup.
