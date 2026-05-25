import type { Project } from '../types';

export const validProjects = {
  branching: {
    project: { schema_version: 2, name: 'branching', entry: 'entry_fn', globals: [], functions: [] } as Project,
    expectedC: 'int32_t entry_fn() { /* branching */ }',
  },
  loops: {
    project: { schema_version: 2, name: 'loops', entry: 'entry_fn', globals: [], functions: [] } as Project,
    expectedC: 'int32_t entry_fn() { /* loops */ }',
  },
  calls: {
    project: { schema_version: 2, name: 'calls', entry: 'entry_fn', globals: [], functions: [] } as Project,
    expectedC: 'int32_t entry_fn() { /* calls */ }',
  },
};

export const invalidProjects = {
  non_boolean_branch: {
    project: { schema_version: 2, name: 'non_boolean_branch', entry: 'entry_fn', globals: [], functions: [] } as Project,
    expectedError: { code: 'compile_error', message: "non-boolean condition at function 'entry_fn' statement #0: found I64" },
  },
  invalid_return_path: {
    project: { schema_version: 2, name: 'invalid_return_path', entry: 'entry_fn', globals: [], functions: [] } as Project,
    expectedError: { code: 'compile_error', message: "invalid return type in `entry_fn` at function 'entry_fn' statement #0: expected I32, found Void" },
  },
};
