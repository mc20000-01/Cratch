import type { Project } from './types';

export const sampleProject: Project = {
  schema_version: 2,
  name: 'demo',
  entry: 'main',
  globals: [
    { name: 'message', ty: 'string', value: { kind: 'string', id: 'expr_1', value: 'Hello from blocks' } },
  ],
  functions: [
    {
      name: 'main',
      params: [],
      return_type: 'i32',
      body: [
        { kind: 'let', id: 'stmt_1', name: 'x', ty: 'i32', value: { kind: 'int', id: 'expr_2', value: 42 } },
        { kind: 'return', id: 'stmt_2', value: { kind: 'ident', id: 'expr_3', name: 'x' } },
      ],
    },
  ],
};
