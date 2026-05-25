# Compiler Pass Overview

1. **Deserialize + migrate**: load JSON, migrate schema, attach missing node IDs.
2. **Parse/validate**: enforce project structural and semantic constraints in Rust core.
3. **Lowering**: convert high-level block/project representation into compiler IR/emit-ready form.
4. **Code generation**: emit C output.
5. **Diagnostics**: report structured error code + message for editor display.
