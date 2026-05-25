use serde::{Deserialize, Serialize};

use crate::types::PrimitiveType;

pub const PROJECT_SCHEMA_VERSION: u32 = 2;

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(default)]
pub struct Project {
    pub schema_version: u32,
    pub name: String,
    pub globals: Vec<GlobalDecl>,
    pub functions: Vec<FunctionDecl>,
    pub entry: String,
}

impl Default for Project {
    fn default() -> Self {
        Self {
            schema_version: PROJECT_SCHEMA_VERSION,
            name: String::new(),
            globals: vec![],
            functions: vec![],
            entry: String::new(),
        }
    }
}

#[derive(Clone, Debug, Serialize, Deserialize, PartialEq, Eq)]
pub struct NodeUiMeta {
    pub x: i32,
    pub y: i32,
    #[serde(default)]
    pub collapsed: bool,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub comment: Option<String>,
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
    Int { id: String, #[serde(default, skip_serializing_if = "Option::is_none")] ui: Option<NodeUiMeta>, value: i64 },
    Float { id: String, #[serde(default, skip_serializing_if = "Option::is_none")] ui: Option<NodeUiMeta>, value: f64 },
    String { id: String, #[serde(default, skip_serializing_if = "Option::is_none")] ui: Option<NodeUiMeta>, value: String },
    Bool { id: String, #[serde(default, skip_serializing_if = "Option::is_none")] ui: Option<NodeUiMeta>, value: bool },
    Ident { id: String, #[serde(default, skip_serializing_if = "Option::is_none")] ui: Option<NodeUiMeta>, name: String },
    Call { id: String, #[serde(default, skip_serializing_if = "Option::is_none")] ui: Option<NodeUiMeta>, name: String, args: Vec<Expr> },
}

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(tag = "kind", rename_all = "snake_case")]
pub enum Stmt {
    Let { id: String, #[serde(default, skip_serializing_if = "Option::is_none")] ui: Option<NodeUiMeta>, name: String, ty: Option<PrimitiveType>, value: Expr },
    Assign { id: String, #[serde(default, skip_serializing_if = "Option::is_none")] ui: Option<NodeUiMeta>, name: String, value: Expr },
    Expr { id: String, #[serde(default, skip_serializing_if = "Option::is_none")] ui: Option<NodeUiMeta>, value: Expr },
    Return { id: String, #[serde(default, skip_serializing_if = "Option::is_none")] ui: Option<NodeUiMeta>, value: Option<Expr> },
    If { id: String, #[serde(default, skip_serializing_if = "Option::is_none")] ui: Option<NodeUiMeta>, test: Expr, then: Vec<Stmt>, otherwise: Option<Vec<Stmt>> },
    While { id: String, #[serde(default, skip_serializing_if = "Option::is_none")] ui: Option<NodeUiMeta>, test: Expr, body: Vec<Stmt> },
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn project_round_trip_preserves_ids_and_ui_metadata() {
        let json = r#"{
          "schema_version": 2,
          "name": "demo",
          "entry": "main",
          "globals": [{"name":"g","ty":"I32","value":{"kind":"int","id":"expr-1","ui":{"x":1,"y":2,"collapsed":true,"comment":"global"},"value":1}}],
          "functions": [{"name":"main","params":[],"return_type":"I32","body":[{"kind":"return","id":"stmt-1","ui":{"x":3,"y":4},"value":{"kind":"ident","id":"expr-2","name":"g"}}]}]
        }"#;

        let parsed: Project = serde_json::from_str(json).expect("parse project");
        let encoded = serde_json::to_string(&parsed).expect("serialize");
        let decoded: Project = serde_json::from_str(&encoded).expect("deserialize");

        assert_eq!(decoded.schema_version, PROJECT_SCHEMA_VERSION);
        match &decoded.functions[0].body[0] {
            Stmt::Return { id, ui, .. } => {
                assert_eq!(id, "stmt-1");
                assert!(ui.is_some());
            }
            _ => panic!("expected return"),
        }
    }
}
