use serde::{Deserialize, Serialize};

use crate::types::PrimitiveType;

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct Project {
    pub name: String,
    pub globals: Vec<GlobalDecl>,
    pub functions: Vec<FunctionDecl>,
    pub entry: String,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct GlobalDecl {
    pub name: String,
    pub ty: PrimitiveType,
    pub value: Option<Expr>,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct FunctionDecl {
    pub name: String,
    pub params: Vec<Param>,
    pub return_type: PrimitiveType,
    pub body: Vec<Stmt>,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct Param {
    pub name: String,
    pub ty: PrimitiveType,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(tag = "kind", rename_all = "snake_case")]
pub enum Expr {
    Int { value: i64 },
    Float { value: f64 },
    String { value: String },
    Bool { value: bool },
    Ident { name: String },
    Call { name: String, args: Vec<Expr> },
}

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(tag = "kind", rename_all = "snake_case")]
pub enum Stmt {
    Let { name: String, ty: Option<PrimitiveType>, value: Expr },
    Assign { name: String, value: Expr },
    Expr { value: Expr },
    Return { value: Option<Expr> },
    If { test: Expr, then: Vec<Stmt>, otherwise: Option<Vec<Stmt>> },
    While { test: Expr, body: Vec<Stmt> },
}
