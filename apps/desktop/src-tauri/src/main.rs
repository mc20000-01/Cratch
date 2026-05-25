use compiler_core::{compile_project_to_c, Project};
use tauri::Manager;

#[tauri::command]
fn compile_json_to_c(json: String) -> Result<String, String> {
    let project: Project = serde_json::from_str(&json).map_err(|e| e.to_string())?;
    compile_project_to_c(&project).map_err(|e| e.to_string())
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![compile_json_to_c])
        .run(tauri::generate_context!())
        .expect("failed to run tauri app");
}
