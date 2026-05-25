import type { Project } from './types';

export type StructuredCompileError = {
  code: string;
  message: string;
};

export type CompileResult =
  | { ok: true; c: string }
  | { ok: false; error: StructuredCompileError };

type CompilerWasmBindings = {
  parse_and_validate_project_json: (json: string) => unknown;
  compile_project_json_to_c: (json: string) => string;
  compile_project_json_to_c_with_errors: (json: string) => CompileResult;
};

function getWasmCompiler(): CompilerWasmBindings {
  const compiler = (globalThis as { __SCRATCHLOWLEVEL_COMPILER_WASM__?: CompilerWasmBindings }).__SCRATCHLOWLEVEL_COMPILER_WASM__;
  if (!compiler) throw new Error('compiler-wasm bindings are not initialized on globalThis.__SCRATCHLOWLEVEL_COMPILER_WASM__.');
  return compiler;
}

export function parseAndValidateProject(project: Project): Project {
  return getWasmCompiler().parse_and_validate_project_json(JSON.stringify(project)) as Project;
}

export function compileProjectJsonToC(project: Project): string {
  return getWasmCompiler().compile_project_json_to_c(JSON.stringify(project));
}

export function compileProjectJsonToCWithErrors(project: Project): CompileResult {
  return getWasmCompiler().compile_project_json_to_c_with_errors(JSON.stringify(project));
}
