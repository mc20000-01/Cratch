use wasm_bindgen::prelude::*;

use compiler_core::{compile_project_to_c, Project};
use serde::Serialize;

#[derive(Debug, Serialize)]
pub struct WasmCompileError {
    pub code: String,
    pub message: String,
}

fn parse_project(json: &str) -> Result<Project, WasmCompileError> {
    serde_json::from_str(json).map_err(|e| WasmCompileError {
        code: "invalid_project_json".to_string(),
        message: e.to_string(),
    })
}

fn to_js<T: Serialize>(value: &T) -> Result<JsValue, JsValue> {
    serde_wasm_bindgen::to_value(value).map_err(|e| JsValue::from_str(&e.to_string()))
}

fn err_to_js(error: WasmCompileError) -> JsValue {
    to_js(&error).unwrap_or_else(|fallback| fallback)
}

#[wasm_bindgen]
pub fn parse_and_validate_project_json(json: &str) -> Result<JsValue, JsValue> {
    let project = parse_project(json).map_err(err_to_js)?;
    to_js(&project)
}

#[wasm_bindgen]
pub fn compile_project_json_to_c(json: &str) -> Result<String, JsValue> {
    let project = parse_project(json).map_err(err_to_js)?;
    compile_project_to_c(&project).map_err(|e| {
        err_to_js(WasmCompileError {
            code: "compile_error".to_string(),
            message: e.to_string(),
        })
    })
}

#[wasm_bindgen]
pub fn compile_project_json_to_c_with_errors(json: &str) -> Result<JsValue, JsValue> {
    let result = match parse_project(json).and_then(|project| {
        compile_project_to_c(&project).map_err(|e| WasmCompileError {
            code: "compile_error".to_string(),
            message: e.to_string(),
        })
    }) {
        Ok(c) => serde_json::json!({ "ok": true, "c": c }),
        Err(error) => serde_json::json!({ "ok": false, "error": error }),
    };

    to_js(&result)
}
