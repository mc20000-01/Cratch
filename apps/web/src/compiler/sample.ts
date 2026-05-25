import type { Project } from './types';

export const sampleProject: Project = {
  name: 'demo',
  entry: 'main',
  globals: [
    { name: 'message', type: 'string', value: { kind: 'string', value: 'Hello from blocks' } },
  ],
  functions: [
    {
      name: 'main',
      params: [],
      returnType: 'i32',
      body: [
        { kind: 'let', name: 'x', type: 'i32', value: { kind: 'int', value: 42 } },
        { kind: 'return', value: { kind: 'ident', name: 'x' } }
      ],
    },
  ],
};
