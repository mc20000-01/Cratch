# Architecture

## Frontend
React/Vite block editor.

## Core
Rust compiler pipeline:
Project JSON -> AST -> C emitter -> clang/gcc -> ASM.

## Project Schema (v2)
Project files are versioned via `schema_version` (currently `2`) so apps can migrate old files safely.

### Guarantees
- Every `Stmt` and `Expr` node carries a stable `id`.
- Optional UI metadata (`ui`) can be attached to any statement/expression:
  - `x`, `y`: editor position
  - `collapsed`: collapse state
  - `comment`: author note
- Compiler behavior is unchanged by `ui` metadata (it is ignored for semantic and codegen passes).

### Minimal project file
```json
{
  "schema_version": 2,
  "name": "demo",
  "entry": "main",
  "globals": [],
  "functions": [
    {
      "name": "main",
      "params": [],
      "return_type": "i32",
      "body": [
        { "kind": "return", "id": "stmt_1", "value": { "kind": "int", "id": "expr_1", "value": 0 } }
      ]
    }
  ]
}
```

### Full-fidelity project file
```json
{
  "schema_version": 2,
  "name": "editor-stateful",
  "entry": "main",
  "globals": [{ "name": "g", "ty": "i32", "value": { "kind": "int", "id": "expr_1", "ui": { "x": 16, "y": 12, "comment": "global const" }, "value": 10 } }],
  "functions": [
    {
      "name": "main",
      "params": [],
      "return_type": "i32",
      "body": [
        { "kind": "let", "id": "stmt_1", "ui": { "x": 48, "y": 96, "collapsed": false }, "name": "x", "ty": "i32", "value": { "kind": "ident", "id": "expr_2", "name": "g" } },
        { "kind": "return", "id": "stmt_2", "ui": { "x": 64, "y": 128, "comment": "exit" }, "value": { "kind": "ident", "id": "expr_3", "name": "x" } }
      ]
    }
  ]
}
```

## Extensions
Extensions provide:
- block metadata
- type metadata
- lowering hooks
- runtime support code
