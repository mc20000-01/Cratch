pub mod ast;
pub mod cgen;
pub mod extensions;
pub mod semantics;
pub mod types;

pub use ast::{Expr, FunctionDecl, Project, Stmt};
pub use cgen::compile_project_to_c;
pub use types::PrimitiveType;

pub use extensions::{ensure_compatible_api_version, ExtensionMetadata, ExtensionRegistry, InMemoryExtensionRegistry, EXTENSION_API_VERSION};
