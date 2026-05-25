use std::{fs, path::{Path, PathBuf}};

use compiler_core::{compile_project_to_c, Project};

fn fixtures_dir(kind: &str) -> PathBuf {
    Path::new(env!("CARGO_MANIFEST_DIR")).join("tests").join("fixtures").join(kind)
}

fn case_directories(kind: &str) -> Vec<PathBuf> {
    let mut dirs = fs::read_dir(fixtures_dir(kind))
        .expect("fixture directory exists")
        .filter_map(|entry| {
            let path = entry.ok()?.path();
            path.is_dir().then_some(path)
        })
        .collect::<Vec<_>>();
    dirs.sort();
    dirs
}

fn read_to_string(path: &Path) -> String {
    fs::read_to_string(path).unwrap_or_else(|e| panic!("failed reading {}: {e}", path.display()))
}

#[test]
fn valid_projects_match_c_output_snapshots() {
    for case_dir in case_directories("valid") {
        let name = case_dir.file_name().unwrap().to_string_lossy();
        let project: Project = serde_json::from_str(&read_to_string(&case_dir.join("project.json")))
            .unwrap_or_else(|e| panic!("{name}: invalid fixture JSON: {e}"));
        let actual = compile_project_to_c(&project)
            .unwrap_or_else(|e| panic!("{name}: expected success, got error: {e}"));
        let expected = read_to_string(&case_dir.join("expected.c"));
        assert_eq!(actual, expected, "snapshot mismatch for valid fixture '{name}'");
    }
}

#[test]
fn invalid_projects_match_diagnostics_snapshots() {
    for case_dir in case_directories("invalid") {
        let name = case_dir.file_name().unwrap().to_string_lossy();
        let project: Project = serde_json::from_str(&read_to_string(&case_dir.join("project.json")))
            .unwrap_or_else(|e| panic!("{name}: invalid fixture JSON: {e}"));
        let error = compile_project_to_c(&project)
            .expect_err(&format!("{name}: expected compile error"))
            .to_string();
        let expected = read_to_string(&case_dir.join("expected.diagnostic"));
        assert_eq!(error, expected.trim_end(), "diagnostic mismatch for invalid fixture '{name}'");
    }
}
