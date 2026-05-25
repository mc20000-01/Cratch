import { deserializeProject, serializeProject } from './compiler/migrations';
import { PROJECT_SCHEMA_VERSION, type Project } from './compiler/types';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

export function validateImportedProject(input: unknown): Project {
  if (!isRecord(input)) throw new Error('Project file must be a JSON object.');
  if (typeof input.name !== 'string' || input.name.length === 0)
    throw new Error('Project must include a non-empty "name" field.');
  if (typeof input.entry !== 'string' || input.entry.length === 0)
    throw new Error('Project must include a non-empty "entry" field.');
  if (!Array.isArray(input.globals)) throw new Error('Project "globals" must be an array.');
  if (!Array.isArray(input.functions)) throw new Error('Project "functions" must be an array.');
  if (typeof input.schema_version === 'number' && input.schema_version > PROJECT_SCHEMA_VERSION) {
    throw new Error(
      `Project schema_version ${input.schema_version} is newer than this app (${PROJECT_SCHEMA_VERSION}).`,
    );
  }

  return deserializeProject(JSON.stringify(input));
}

export function exportProject(project: Project): string {
  return serializeProject(project);
}
