use std::fmt::Write;

use crate::ast::{Expr, Project, Stmt};
use crate::semantics::validate_project;
use crate::types::PrimitiveType;

#[derive(thiserror::Error, Debug)]
pub enum CompileError {
    #[error("entry function not found: {0}")]
    MissingEntry(String),
    #[error("unknown identifier `{name}` at {source_hint}")]
    UnknownIdentifier { name: String, source_hint: String },
    #[error("duplicate declaration of `{symbol}` at {source_hint}")]
    DuplicateDeclaration { symbol: String, source_hint: String },
    #[error("arity mismatch in call to `{function}` at {source_hint}: expected {expected}, found {found}")]
    ArityMismatchInCall {
        function: String,
        expected: usize,
        found: usize,
        source_hint: String,
    },
    #[error("type mismatch in call to `{function}` at {source_hint}: {detail}")]
    TypeMismatchInCall {
        function: String,
        detail: String,
        source_hint: String,
    },
    #[error("invalid return type in `{function}` at {source_hint}: expected {expected:?}, found {found:?}")]
    InvalidReturnType {
        function: String,
        expected: PrimitiveType,
        found: PrimitiveType,
        source_hint: String,
    },
    #[error("non-boolean condition at {source_hint}: found {found:?}")]
    NonBooleanCondition {
        found: PrimitiveType,
        source_hint: String,
    },
}

fn emit_type(ty: &PrimitiveType) -> &'static str {
    ty.as_c_type()
}

fn emit_expr(expr: &Expr) -> String {
    match expr {
        Expr::Int { value, .. } => value.to_string(),
        Expr::Float { value, .. } => value.to_string(),
        Expr::String { value, .. } => format!("{:?}", value),
        Expr::Bool { value, .. } => value.to_string(),
        Expr::Ident { name, .. } => name.clone(),
        Expr::Call { name, args, .. } => format!(
            "{}({})",
            name,
            args.iter().map(emit_expr).collect::<Vec<_>>().join(", ")
        ),
    }
}

fn emit_stmt(stmt: &Stmt, indent: usize, out: &mut String) {
    let pad = " ".repeat(indent);
    match stmt {
        Stmt::Let { name, ty, value, .. } => {
            let ty = ty.as_ref().unwrap_or(&PrimitiveType::I32);
            let _ = writeln!(
                out,
                "{}{} {} = {};",
                pad,
                emit_type(ty),
                name,
                emit_expr(value)
            );
        }
        Stmt::Assign { name, value, .. } => {
            let _ = writeln!(out, "{}{} = {};", pad, name, emit_expr(value));
        }
        Stmt::Expr { value, .. } => {
            let _ = writeln!(out, "{}{};", pad, emit_expr(value));
        }
        Stmt::Return { value, .. } => match value {
            Some(v) => {
                let _ = writeln!(out, "{}return {};", pad, emit_expr(v));
            }
            None => {
                let _ = writeln!(out, "{}return;", pad);
            }
        },
        Stmt::If {
            test,
            then,
            otherwise,
            ..
        } => {
            let _ = writeln!(out, "{}if ({}) {{", pad, emit_expr(test));
            for s in then {
                emit_stmt(s, indent + 2, out);
            }
            if let Some(otherwise) = otherwise {
                let _ = writeln!(out, "{}}} else {{", pad);
                for s in otherwise {
                    emit_stmt(s, indent + 2, out);
                }
            }
            let _ = writeln!(out, "{}}}", pad);
        }
        Stmt::While { test, body, .. } => {
            let _ = writeln!(out, "{}while ({}) {{", pad, emit_expr(test));
            for s in body {
                emit_stmt(s, indent + 2, out);
            }
            let _ = writeln!(out, "{}}}", pad);
        }
    }
}

pub fn compile_project_to_c(project: &Project) -> Result<String, CompileError> {
    validate_project(project)?;

    if !project.functions.iter().any(|f| f.name == project.entry) {
        return Err(CompileError::MissingEntry(project.entry.clone()));
    }

    let mut out = String::new();
    out.push_str("#include <stdint.h>\n");
    out.push_str("#include <stdbool.h>\n");
    out.push_str("#include <stdio.h>\n\n");

    for g in &project.globals {
        match &g.value {
            Some(v) => {
                let _ = writeln!(out, "{} {} = {};", emit_type(&g.ty), g.name, emit_expr(v));
            }
            None => {
                let _ = writeln!(out, "{} {};", emit_type(&g.ty), g.name);
            }
        }
    }
    out.push('\n');

    for f in &project.functions {
        let params = f
            .params
            .iter()
            .map(|p| format!("{} {}", emit_type(&p.ty), p.name))
            .collect::<Vec<_>>()
            .join(", ");
        let _ = writeln!(
            out,
            "{} {}({}) {{",
            emit_type(&f.return_type),
            f.name,
            params
        );
        for stmt in &f.body {
            emit_stmt(stmt, 2, &mut out);
        }
        if matches!(f.return_type, PrimitiveType::Void) {
            out.push_str("  return;\n");
        }
        out.push_str("}\n\n");
    }

    let _ = writeln!(out, "int main(void) {{ return {}(); }}", project.entry);
    Ok(out)
}
