import { useEffect, useMemo, useSyncExternalStore } from 'react';
import { loadBlocksFromManifests } from './compiler/extensions';
import { compileProjectJsonToCWithErrors } from './compiler/index';
import { editorStore, type BlockKind } from './editor';

const paletteKinds: BlockKind[] = ['let', 'assign', 'expr', 'if', 'while', 'return'];

export default function App() {
  const blocks = useMemo(() => loadBlocksFromManifests([]), []);
  const state = useSyncExternalStore(editorStore.subscribe, editorStore.getSnapshot);
  const orderedNodes = useMemo(() => Object.values(state.graph.nodes).sort((a, b) => a.order - b.order), [state.graph.nodes]);

  useEffect(() => {
    const handle = setTimeout(() => {
      const result = compileProjectJsonToCWithErrors(state.project);
      if (result.ok) {
        editorStore.setCompilation(result.c, []);
      } else {
        editorStore.setCompilation('', [{ message: `[${result.error.code}] ${result.error.message}` }]);
      }
    }, 100);
    return () => clearTimeout(handle);
  }, [state.version, state.project]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'z') {
        event.preventDefault();
        if (event.shiftKey) editorStore.redo();
        else editorStore.undo();
        return;
      }
      if (!state.selectedId) return;
      const idx = orderedNodes.findIndex((n) => n.id === state.selectedId);
      if (event.key === 'Delete' || event.key === 'Backspace') editorStore.deleteBlock(state.selectedId);
      if (event.key === 'ArrowUp' && idx > 0) editorStore.moveBlock(state.selectedId, idx - 1);
      if (event.key === 'ArrowDown' && idx >= 0 && idx < orderedNodes.length - 1) editorStore.moveBlock(state.selectedId, idx + 1);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [orderedNodes, state.selectedId]);

  return (
    <div className="shell">
      <aside className="panel">
        <h1>ScratchLowLevel</h1>
        <p>Editor-first workflow (compiler output stays debug-only).</p>
        <h2>Palette</h2>
        <div className="palette">
          {paletteKinds.map((kind) => (
            <button key={kind} draggable onDragStart={(event) => event.dataTransfer.setData('application/block-kind', kind)} onClick={() => editorStore.insertBlock(kind, state.selectedId)}>
              + {kind}
            </button>
          ))}
        </div>
        <h2>Extensions</h2>
        <ul>{blocks.map((block) => <li key={block.id}><strong>{block.name}</strong><span>{block.kind}</span></li>)}</ul>
      </aside>

      <main className="workspace">
        <section className="panel">
          <h2>Workspace Graph</h2>
          <div className="canvas" onDragOver={(e) => e.preventDefault()} onDrop={(event) => {
            event.preventDefault();
            const kind = event.dataTransfer.getData('application/block-kind') as BlockKind;
            if (kind) editorStore.insertBlock(kind, state.selectedId);
          }}>
            {orderedNodes.map((node, idx) => (
              <div
                key={node.id}
                className={`node ${state.selectedId === node.id ? 'selected' : ''}`}
                onClick={() => editorStore.select(node.id)}
                draggable
                onDragStart={(event) => event.dataTransfer.setData('application/move-id', node.id)}
                onDrop={(event) => {
                  const moveId = event.dataTransfer.getData('application/move-id');
                  if (moveId) editorStore.moveBlock(moveId, idx);
                  const connectFrom = event.dataTransfer.getData('application/connect-from');
                  if (connectFrom) editorStore.connectBlocks(connectFrom, node.id);
                }}
                onDragOver={(event) => event.preventDefault()}
              >
                <div><strong>{node.label}</strong> <small>{node.id}</small></div>
                <div className="node-actions">
                  <button onClick={(e) => { e.stopPropagation(); editorStore.deleteBlock(node.id); }}>Delete</button>
                  <button draggable onDragStart={(e) => { e.stopPropagation(); e.dataTransfer.setData('application/connect-from', node.id); }}>Connect →</button>
                </div>
              </div>
            ))}
          </div>
          <p className="hint">Keyboard: ↑/↓ move, Del delete, Ctrl/Cmd+Z undo, Ctrl/Cmd+Shift+Z redo.</p>
        </section>

        <section className="panel diagnostics">
          <h2>Diagnostics</h2>
          {state.diagnostics.length === 0 ? <p>No issues.</p> : <ul>{state.diagnostics.map((d, i) => <li key={`${d.message}-${i}`}>{d.nodeId ? `${d.nodeId}: ` : ''}{d.message}</li>)}</ul>}
          <h3>Generated C (debug)</h3>
          <pre>{state.debugCOutput || '// build failed or no output yet'}</pre>
        </section>
      </main>
    </div>
  );
}
