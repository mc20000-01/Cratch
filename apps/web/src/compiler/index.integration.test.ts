import { describe, expect, it, beforeEach } from 'vitest';

import { compileProjectJsonToC, compileProjectJsonToCWithErrors } from './index';
import type { Project } from './types';
import { validProjects, invalidProjects } from './__fixtures__/compiler-fixtures';

describe('wasm compiler bridge integration', () => {
  beforeEach(() => {
    (globalThis as any).__SCRATCHLOWLEVEL_COMPILER_WASM__ = {
      parse_and_validate_project_json: (json: string) => JSON.parse(json),
      compile_project_json_to_c: (json: string) => {
        const project = JSON.parse(json) as Project;
        const out = validProjects[project.name as keyof typeof validProjects];
        if (!out) throw new Error(`unknown valid fixture: ${project.name}`);
        return out.expectedC;
      },
      compile_project_json_to_c_with_errors: (json: string) => {
        const project = JSON.parse(json) as Project;
        const valid = validProjects[project.name as keyof typeof validProjects];
        if (valid) return { ok: true, c: valid.expectedC };
        const invalid = invalidProjects[project.name as keyof typeof invalidProjects];
        if (!invalid) throw new Error(`unknown fixture: ${project.name}`);
        return { ok: false, error: invalid.expectedError };
      },
    };
  });

  it('compiles valid fixture projects through wasm bridge', () => {
    for (const fixture of Object.values(validProjects)) {
      expect(compileProjectJsonToC(fixture.project)).toBe(fixture.expectedC);
      expect(compileProjectJsonToCWithErrors(fixture.project)).toEqual({ ok: true, c: fixture.expectedC });
    }
  });

  it('returns structured diagnostics for invalid fixture projects through wasm bridge', () => {
    for (const fixture of Object.values(invalidProjects)) {
      expect(compileProjectJsonToCWithErrors(fixture.project)).toEqual({ ok: false, error: fixture.expectedError });
    }
  });
});
