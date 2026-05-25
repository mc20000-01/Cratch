# Architecture

## Frontend
React/Vite block editor.

## Core
Rust compiler pipeline:
Project JSON -> AST -> C emitter -> clang/gcc -> ASM.

## Extensions
Extensions provide:
- block metadata
- type metadata
- lowering hooks
- runtime support code
