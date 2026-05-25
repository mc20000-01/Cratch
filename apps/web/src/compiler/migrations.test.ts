import { describe, expect, it } from 'vitest';
import { deserializeProject, serializeProject, upgradeProjectSchema } from './migrations';

describe('project schema migrations', () => {
  it('upgrades v1 projects with deterministic ids', () => {
    const legacy = {
      name: 'demo',
      entry: 'main',
      globals: [{ name: 'g', ty: 'i32', value: { kind: 'int', value: 1 } }],
      functions: [{ name: 'main', params: [], return_type: 'i32', body: [{ kind: 'return', value: { kind: 'ident', name: 'g' } }] }],
    };
    const upgraded = upgradeProjectSchema(legacy as any);
    expect(upgraded.schema_version).toBe(2);
    expect(upgraded.functions[0].body[0].id).toBe('stmt_1');
  });

  it('round-trips full fidelity project json', () => {
    const project = deserializeProject('{"schema_version":2,"name":"x","entry":"main","globals":[],"functions":[{"name":"main","params":[],"return_type":"i32","body":[{"kind":"return","id":"stmt_a","ui":{"x":10,"y":20,"collapsed":true,"comment":"done"},"value":{"kind":"int","id":"expr_a","value":7}}]}]}');
    const decoded = deserializeProject(serializeProject(project));
    expect(decoded.functions[0].body[0]).toEqual(project.functions[0].body[0]);
  });
});
