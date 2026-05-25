use std::collections::HashMap;

use crate::{
    ast::{Expr, FunctionDecl, Project, Stmt},
    cgen::CompileError,
    types::PrimitiveType,
};

#[derive(Clone, Debug)]
struct FunctionSig {
    return_type: PrimitiveType,
    params: Vec<PrimitiveType>,
}

#[derive(Clone, Debug)]
struct Context<'a> {
    function: &'a FunctionDecl,
    globals: &'a HashMap<String, PrimitiveType>,
    functions: &'a HashMap<String, FunctionSig>,
    locals: HashMap<String, PrimitiveType>,
}

impl<'a> Context<'a> {
    fn source_hint(&self, stmt_index: usize) -> String {
        format!(
            "function '{}' statement #{}",
            self.function.name, stmt_index
        )
    }

    fn resolve_ident(&self, name: &str) -> Option<&PrimitiveType> {
        self.locals.get(name).or_else(|| self.globals.get(name))
    }
}

pub fn validate_project(project: &Project) -> Result<(), CompileError> {
    let mut globals = HashMap::new();
    for g in &project.globals {
        if globals.insert(g.name.clone(), g.ty.clone()).is_some() {
            return Err(CompileError::DuplicateDeclaration {
                symbol: g.name.clone(),
                source_hint: "global scope".to_string(),
            });
        }
    }

    let mut functions = HashMap::new();
    for f in &project.functions {
        let sig = FunctionSig {
            return_type: f.return_type.clone(),
            params: f.params.iter().map(|p| p.ty.clone()).collect(),
        };
        if functions.insert(f.name.clone(), sig).is_some() {
            return Err(CompileError::DuplicateDeclaration {
                symbol: f.name.clone(),
                source_hint: "global scope".to_string(),
            });
        }
    }

    for f in &project.functions {
        validate_function(f, &globals, &functions)?;
    }

    Ok(())
}

fn validate_function(
    function: &FunctionDecl,
    globals: &HashMap<String, PrimitiveType>,
    functions: &HashMap<String, FunctionSig>,
) -> Result<(), CompileError> {
    let mut locals = HashMap::new();
    for param in &function.params {
        if locals
            .insert(param.name.clone(), param.ty.clone())
            .is_some()
        {
            return Err(CompileError::DuplicateDeclaration {
                symbol: param.name.clone(),
                source_hint: format!("function '{}' parameters", function.name),
            });
        }
    }

    let mut ctx = Context {
        function,
        globals,
        functions,
        locals,
    };
    validate_stmts(&function.body, &mut ctx)
}

fn validate_stmts(stmts: &[Stmt], ctx: &mut Context<'_>) -> Result<(), CompileError> {
    for (idx, stmt) in stmts.iter().enumerate() {
        validate_stmt(stmt, idx, ctx)?;
    }
    Ok(())
}

fn validate_stmt(
    stmt: &Stmt,
    stmt_index: usize,
    ctx: &mut Context<'_>,
) -> Result<(), CompileError> {
    match stmt {
        Stmt::Let { name, ty, value, .. } => {
            let inferred = infer_expr_type(value, stmt_index, ctx)?;
            if let Some(explicit_ty) = ty {
                if explicit_ty != &inferred {
                    return Err(CompileError::TypeMismatchInCall {
                        function: format!("let {}", name),
                        detail: format!(
                            "declared as {:?} but initialized with {:?}",
                            explicit_ty, inferred
                        ),
                        source_hint: ctx.source_hint(stmt_index),
                    });
                }
            }
            let declared = ty.clone().unwrap_or(inferred);
            if ctx.locals.insert(name.clone(), declared).is_some() {
                return Err(CompileError::DuplicateDeclaration {
                    symbol: name.clone(),
                    source_hint: ctx.source_hint(stmt_index),
                });
            }
        }
        Stmt::Assign { name, value, .. } => {
            let existing_ty = ctx.resolve_ident(name).cloned().ok_or_else(|| {
                CompileError::UnknownIdentifier {
                    name: name.clone(),
                    source_hint: ctx.source_hint(stmt_index),
                }
            })?;
            let value_ty = infer_expr_type(value, stmt_index, ctx)?;
            if existing_ty != value_ty {
                return Err(CompileError::TypeMismatchInCall {
                    function: format!("assignment to {}", name),
                    detail: format!("cannot assign {:?} to {:?}", value_ty, existing_ty),
                    source_hint: ctx.source_hint(stmt_index),
                });
            }
        }
        Stmt::Expr { value, .. } => {
            let _ = infer_expr_type(value, stmt_index, ctx)?;
        }
        Stmt::Return { value, .. } => {
            let return_ty = match value {
                Some(v) => infer_expr_type(v, stmt_index, ctx)?,
                None => PrimitiveType::Void,
            };
            if return_ty != ctx.function.return_type {
                return Err(CompileError::InvalidReturnType {
                    function: ctx.function.name.clone(),
                    expected: ctx.function.return_type.clone(),
                    found: return_ty,
                    source_hint: ctx.source_hint(stmt_index),
                });
            }
        }
        Stmt::If {
            test,
            then,
            otherwise,
            ..
        } => {
            validate_condition(test, stmt_index, ctx)?;
            validate_stmts(then, ctx)?;
            if let Some(otherwise) = otherwise {
                validate_stmts(otherwise, ctx)?;
            }
        }
        Stmt::While { test, body, .. } => {
            validate_condition(test, stmt_index, ctx)?;
            validate_stmts(body, ctx)?;
        }
    }
    Ok(())
}

fn validate_condition(
    test: &Expr,
    stmt_index: usize,
    ctx: &mut Context<'_>,
) -> Result<(), CompileError> {
    let ty = infer_expr_type(test, stmt_index, ctx)?;
    if ty != PrimitiveType::Bool {
        return Err(CompileError::NonBooleanCondition {
            found: ty,
            source_hint: ctx.source_hint(stmt_index),
        });
    }
    Ok(())
}

fn infer_expr_type(
    expr: &Expr,
    stmt_index: usize,
    ctx: &Context<'_>,
) -> Result<PrimitiveType, CompileError> {
    Ok(match expr {
        Expr::Int { .. } => PrimitiveType::I64,
        Expr::Float { .. } => PrimitiveType::F64,
        Expr::String { .. } => PrimitiveType::String,
        Expr::Bool { .. } => PrimitiveType::Bool,
        Expr::Ident { name, .. } => {
            ctx.resolve_ident(name)
                .cloned()
                .ok_or_else(|| CompileError::UnknownIdentifier {
                    name: name.clone(),
                    source_hint: ctx.source_hint(stmt_index),
                })?
        }
        Expr::Call { name, args, .. } => {
            let sig = ctx
                .functions
                .get(name)
                .ok_or_else(|| CompileError::UnknownIdentifier {
                    name: name.clone(),
                    source_hint: ctx.source_hint(stmt_index),
                })?;
            if sig.params.len() != args.len() {
                return Err(CompileError::ArityMismatchInCall {
                    function: name.clone(),
                    expected: sig.params.len(),
                    found: args.len(),
                    source_hint: ctx.source_hint(stmt_index),
                });
            }
            for (i, (expected, arg)) in sig.params.iter().zip(args.iter()).enumerate() {
                let found = infer_expr_type(arg, stmt_index, ctx)?;
                if expected != &found {
                    return Err(CompileError::TypeMismatchInCall {
                        function: name.clone(),
                        detail: format!("arg #{} expected {:?}, found {:?}", i, expected, found),
                        source_hint: ctx.source_hint(stmt_index),
                    });
                }
            }
            sig.return_type.clone()
        }
    })
}
