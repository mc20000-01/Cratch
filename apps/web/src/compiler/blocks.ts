export type BlockSpec = {
  id: string;
  name: string;
  kind: 'expression' | 'statement' | 'control' | 'definition';
  category: string;
};

export const defaultBlocks: BlockSpec[] = [
  { id: 'const.newline', name: 'newline', kind: 'expression', category: 'constants' },
  { id: 'const.pi', name: 'pi', kind: 'expression', category: 'constants' },
  { id: 'const.true', name: 'true', kind: 'expression', category: 'constants' },
  { id: 'const.false', name: 'false', kind: 'expression', category: 'constants' },
  { id: 'math.add', name: 'add', kind: 'expression', category: 'math' },
  { id: 'math.mul', name: 'multiply', kind: 'expression', category: 'math' },
  { id: 'flow.if', name: 'if', kind: 'control', category: 'flow' },
  { id: 'flow.while', name: 'while', kind: 'control', category: 'flow' },
  { id: 'fn.define', name: 'define function', kind: 'definition', category: 'functions' },
  { id: 'mem.load', name: 'load memory', kind: 'expression', category: 'memory' },
];
