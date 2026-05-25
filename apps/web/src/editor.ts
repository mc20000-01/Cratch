import { sampleProject } from './compiler/sample';
import type { Project, Stmt } from './compiler/types';

export type BlockKind = Stmt['kind'];

export type WorkspaceNode = {
  id: string;
  kind: BlockKind;
  label: string;
  functionName: string;
  order: number;
};

export type WorkspaceEdge = {
  id: string;
  from: string;
  to: string;
  type: 'flow';
};

export type EditorDiagnostic = {
  nodeId?: string;
  message: string;
};

export type WorkspaceGraph = {
  nodes: Record<string, WorkspaceNode>;
  edges: WorkspaceEdge[];
  roots: string[];
};

export type EditorSnapshot = {
  project: Project;
  graph: WorkspaceGraph;
  selectedId?: string;
  diagnostics: EditorDiagnostic[];
  debugCOutput: string;
  version: number;
};

type Listener = () => void;

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function stmtLabel(stmt: Stmt): string {
  switch (stmt.kind) {
    case 'let': return `let ${stmt.name}`;
    case 'assign': return `set ${stmt.name}`;
    case 'expr': return 'expression';
    case 'return': return 'return';
    case 'if': return 'if';
    case 'while': return 'while';
  }
}

function graphFromProject(project: Project): WorkspaceGraph {
  const nodes: Record<string, WorkspaceNode> = {};
  const edges: WorkspaceEdge[] = [];
  const roots: string[] = [];

  for (const fn of project.functions) {
    let prev: string | undefined;
    fn.body.forEach((stmt, idx) => {
      nodes[stmt.id] = {
        id: stmt.id,
        kind: stmt.kind,
        label: stmtLabel(stmt),
        functionName: fn.name,
        order: idx,
      };
      if (idx === 0) roots.push(stmt.id);
      if (prev) edges.push({ id: `${prev}->${stmt.id}`, from: prev, to: stmt.id, type: 'flow' });
      prev = stmt.id;
    });
  }

  return { nodes, edges, roots };
}

function reorderFunctionBody(project: Project, functionName: string, orderedIds: string[]): Project {
  const next = clone(project);
  const fn = next.functions.find((item) => item.name === functionName);
  if (!fn) return next;
  const byId = new Map(fn.body.map((stmt) => [stmt.id, stmt]));
  fn.body = orderedIds.map((id) => byId.get(id)).filter((v): v is Stmt => Boolean(v));
  return next;
}

function mkStmt(kind: BlockKind, id: string): Stmt {
  if (kind === 'let') return { id, kind: 'let', name: 'value', ty: 'i32', value: { id: `${id}_expr`, kind: 'int', value: 0 } };
  if (kind === 'assign') return { id, kind: 'assign', name: 'value', value: { id: `${id}_expr`, kind: 'int', value: 1 } };
  if (kind === 'expr') return { id, kind: 'expr', value: { id: `${id}_expr`, kind: 'int', value: 1 } };
  if (kind === 'if') return { id, kind: 'if', test: { id: `${id}_expr`, kind: 'bool', value: true }, then: [], otherwise: [] };
  if (kind === 'while') return { id, kind: 'while', test: { id: `${id}_expr`, kind: 'bool', value: true }, body: [] };
  return { id, kind: 'return', value: { id: `${id}_expr`, kind: 'int', value: 0 } };
}

function buildProjectFromGraph(baseProject: Project, graph: WorkspaceGraph): Project {
  const next = clone(baseProject);
  next.functions = next.functions.map((fn) => {
    const fnNodes = Object.values(graph.nodes)
      .filter((node) => node.functionName === fn.name)
      .sort((a, b) => a.order - b.order);
    const oldById = new Map(fn.body.map((stmt) => [stmt.id, stmt]));
    const body: Stmt[] = fnNodes.map((node) => oldById.get(node.id) ?? mkStmt(node.kind, node.id));
    return { ...fn, body };
  });
  return next;
}

function validateGraph(graph: WorkspaceGraph): EditorDiagnostic[] {
  const diagnostics: EditorDiagnostic[] = [];
  for (const edge of graph.edges) {
    if (!graph.nodes[edge.from] || !graph.nodes[edge.to]) diagnostics.push({ message: `Broken connection: ${edge.id}` });
  }
  return diagnostics;
}

export class EditorStore {
  private listeners = new Set<Listener>();
  private state: EditorSnapshot;
  private undoStack: EditorSnapshot[] = [];
  private redoStack: EditorSnapshot[] = [];

  constructor(initial: Project = sampleProject) {
    const graph = graphFromProject(initial);
    this.state = {
      project: clone(initial),
      graph,
      selectedId: graph.roots[0],
      diagnostics: [],
      debugCOutput: '',
      version: 0,
    };
  }

  subscribe = (listener: Listener): (() => void) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  getSnapshot = (): EditorSnapshot => this.state;

  private emit() { this.listeners.forEach((listener) => listener()); }

  private transact(mutator: (snapshot: EditorSnapshot) => EditorSnapshot) {
    this.undoStack.push(clone(this.state));
    const next = mutator(clone(this.state));
    this.redoStack = [];
    this.state = { ...next, diagnostics: validateGraph(next.graph), version: this.state.version + 1 };
    this.emit();
  }

  insertBlock = (kind: BlockKind, afterId?: string) => {
    this.transact((snapshot) => {
      const id = `stmt_${Math.random().toString(36).slice(2, 9)}`;
      const baseNodes = Object.values(snapshot.graph.nodes).sort((a, b) => a.order - b.order);
      const insertIndex = afterId ? Math.max(baseNodes.findIndex((node) => node.id === afterId) + 1, 0) : baseNodes.length;
      const newNode: WorkspaceNode = { id, kind, label: kind, functionName: 'main', order: insertIndex };
      const arranged = [...baseNodes.slice(0, insertIndex), newNode, ...baseNodes.slice(insertIndex)]
        .map((node, idx) => ({ ...node, order: idx }));
      snapshot.graph.nodes = Object.fromEntries(arranged.map((node) => [node.id, node]));
      snapshot.graph.edges = arranged.slice(1).map((node, idx) => ({ id: `${arranged[idx].id}->${node.id}`, from: arranged[idx].id, to: node.id, type: 'flow' }));
      snapshot.graph.roots = arranged[0] ? [arranged[0].id] : [];
      snapshot.selectedId = id;
      snapshot.project = buildProjectFromGraph(snapshot.project, snapshot.graph);
      return snapshot;
    });
  };

  moveBlock = (id: string, targetIndex: number) => {
    this.transact((snapshot) => {
      const arranged = Object.values(snapshot.graph.nodes).sort((a, b) => a.order - b.order);
      const from = arranged.findIndex((node) => node.id === id);
      if (from < 0 || targetIndex < 0 || targetIndex >= arranged.length) return snapshot;
      const [node] = arranged.splice(from, 1);
      arranged.splice(targetIndex, 0, node);
      const normalized = arranged.map((item, idx) => ({ ...item, order: idx }));
      snapshot.graph.nodes = Object.fromEntries(normalized.map((item) => [item.id, item]));
      snapshot.graph.edges = normalized.slice(1).map((item, idx) => ({ id: `${normalized[idx].id}->${item.id}`, from: normalized[idx].id, to: item.id, type: 'flow' }));
      snapshot.graph.roots = normalized[0] ? [normalized[0].id] : [];
      snapshot.project = buildProjectFromGraph(snapshot.project, snapshot.graph);
      return snapshot;
    });
  };

  deleteBlock = (id: string) => {
    this.transact((snapshot) => {
      const arranged = Object.values(snapshot.graph.nodes).sort((a, b) => a.order - b.order).filter((node) => node.id !== id);
      const normalized = arranged.map((item, idx) => ({ ...item, order: idx }));
      snapshot.graph.nodes = Object.fromEntries(normalized.map((item) => [item.id, item]));
      snapshot.graph.edges = normalized.slice(1).map((item, idx) => ({ id: `${normalized[idx].id}->${item.id}`, from: normalized[idx].id, to: item.id, type: 'flow' }));
      snapshot.graph.roots = normalized[0] ? [normalized[0].id] : [];
      snapshot.selectedId = snapshot.selectedId === id ? normalized[0]?.id : snapshot.selectedId;
      snapshot.project = buildProjectFromGraph(snapshot.project, snapshot.graph);
      return snapshot;
    });
  };

  connectBlocks = (from: string, to: string) => {
    this.transact((snapshot) => {
      if (from === to || !snapshot.graph.nodes[from] || !snapshot.graph.nodes[to]) return snapshot;
      snapshot.graph.edges = snapshot.graph.edges.filter((edge) => edge.from !== from);
      snapshot.graph.edges.push({ id: `${from}->${to}`, from, to, type: 'flow' });
      return snapshot;
    });
  };

  select = (id?: string) => { this.state = { ...this.state, selectedId: id }; this.emit(); };
  setCompilation = (debugCOutput: string, diagnostics: EditorDiagnostic[]) => {
    this.state = { ...this.state, debugCOutput, diagnostics: [...this.state.diagnostics, ...diagnostics] };
    this.emit();
  };

  undo = () => {
    const prev = this.undoStack.pop();
    if (!prev) return;
    this.redoStack.push(clone(this.state));
    this.state = prev;
    this.emit();
  };

  redo = () => {
    const next = this.redoStack.pop();
    if (!next) return;
    this.undoStack.push(clone(this.state));
    this.state = next;
    this.emit();
  };
}

export const editorStore = new EditorStore();
