use wasm_bindgen::prelude::*;

use compiler_core::{compile_project_to_c, Project};

#[wasm_bindgen]
pub fn compile_json_to_c(json: &str) -> Result<String, JsValue> {
    let project: Project = serde_json::from_str(json)
        .map_err(|e| JsValue::from_str(&e.to_string()))?;
    compile_project_to_c(&project).map_err(|e| JsValue::from_str(&e.to_string()))
}
