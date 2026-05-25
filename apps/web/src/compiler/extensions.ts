import { defaultBlocks, type BlockSpec } from './blocks';

export const EXTENSION_API_VERSION = 1;

export type ExtensionRuntimeSnippet = {
  language: 'c';
  code: string;
};

export type ExtensionManifest = {
  id: string;
  version: string;
  apiVersion: number;
  blocks: BlockSpec[];
  loweringEntrypoints: Record<string, string>;
  runtimeSnippets?: ExtensionRuntimeSnippet[];
};

export function assertCompatibleApiVersion(apiVersion: number): void {
  if (apiVersion !== EXTENSION_API_VERSION) {
    throw new Error(
      `Incompatible extension apiVersion ${apiVersion}. Expected ${EXTENSION_API_VERSION}.`,
    );
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function assertString(value: unknown, field: string): asserts value is string {
  if (typeof value !== 'string' || value.trim() === '') {
    throw new Error(`Extension manifest field \"${field}\" must be a non-empty string.`);
  }
}

function parseBlock(raw: unknown, index: number): BlockSpec {
  if (!isRecord(raw)) throw new Error(`blocks[${index}] must be an object.`);
  const { id, name, kind, category } = raw;
  assertString(id, `blocks[${index}].id`);
  assertString(name, `blocks[${index}].name`);
  assertString(category, `blocks[${index}].category`);
  if (kind !== 'expression' && kind !== 'statement' && kind !== 'control' && kind !== 'definition') {
    throw new Error(`blocks[${index}].kind must be expression|statement|control|definition.`);
  }
  return { id, name, category, kind };
}

export function validateExtensionManifestShape(input: unknown): ExtensionManifest {
  if (!isRecord(input)) throw new Error('Extension manifest must be an object.');
  const { id, version, apiVersion, blocks, loweringEntrypoints, runtimeSnippets } = input;
  assertString(id, 'id');
  assertString(version, 'version');
  if (typeof apiVersion !== 'number' || !Number.isInteger(apiVersion)) {
    throw new Error('Extension manifest field "apiVersion" must be an integer.');
  }
  assertCompatibleApiVersion(apiVersion);

  if (!Array.isArray(blocks)) throw new Error('Extension manifest field "blocks" must be an array.');
  const parsedBlocks = blocks.map(parseBlock);

  if (!isRecord(loweringEntrypoints)) {
    throw new Error('Extension manifest field "loweringEntrypoints" must be an object.');
  }
  const parsedEntrypoints = Object.entries(loweringEntrypoints).reduce<Record<string, string>>((acc, [blockId, fnName]) => {
    assertString(blockId, 'loweringEntrypoints key');
    assertString(fnName, `loweringEntrypoints.${blockId}`);
    acc[blockId] = fnName;
    return acc;
  }, {});

  const parsedRuntimeSnippets = runtimeSnippets?.map((snippet, index) => {
    if (!isRecord(snippet)) throw new Error(`runtimeSnippets[${index}] must be an object.`);
    const { language, code } = snippet;
    if (language !== 'c') throw new Error(`runtimeSnippets[${index}].language must be \"c\".`);
    assertString(code, `runtimeSnippets[${index}].code`);
    return { language, code };
  });

  return {
    id,
    version,
    apiVersion,
    blocks: parsedBlocks,
    loweringEntrypoints: parsedEntrypoints,
    runtimeSnippets: parsedRuntimeSnippets,
  };
}

export function loadBlocksFromManifests(rawManifests: unknown[]): BlockSpec[] {
  const extensionBlocks = rawManifests.map(validateExtensionManifestShape).flatMap((manifest) => manifest.blocks);
  return [...defaultBlocks, ...extensionBlocks];
}
