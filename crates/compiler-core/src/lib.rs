pub mod ast;
pub mod cgen;
pub mod types;

pub use ast::{Expr, FunctionDecl, Project, Stmt};
pub use cgen::compile_project_to_c;
pub use types::PrimitiveType;
