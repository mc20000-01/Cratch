import { useEffect, useMemo, useState, useSyncExternalStore } from 'react';
import { loadBlocksFromManifests } from './compiler/extensions';
import { compileProjectJsonToCWithErrors } from './compiler/index';
import { editorStore, type BlockKind } from './editor';
import { exportProject, validateImportedProject } from './project-io';

const paletteKinds: BlockKind[] = ['let', 'assign', 'expr', 'if', 'while', 'return'];

export default function App() {
  const blocks = useMemo(() => loadBlocksFromManifests([]), []);
  const state = useSyncExternalStore(editorStore.subscribe, editorStore.getSnapshot);
  const orderedNodes = useMemo(
    () => Object.values(state.graph.nodes).sort((a, b) => a.order - b.order),
    [state.graph.nodes],
  );
  const [projectError, setProjectError] = useState<string>();

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

  const downloadProject = () => {
    const blob = new Blob([exportProject(state.project)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${state.project.name || 'project'}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importProject = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const parsed = JSON.parse(text) as unknown;
      const project = validateImportedProject(parsed);
      editorStore.replaceProject(project);
      setProjectError(undefined);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown project import error.';
      setProjectError(`Import failed: ${message}`);
    }
  };

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
      if (event.key === 'ArrowDown' && idx >= 0 && idx < orderedNodes.length - 1)
        editorStore.moveBlock(state.selectedId, idx + 1);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [orderedNodes, state.selectedId]);

  return (
    <div className="shell">
      <aside className="panel page-layout">
        <header className="section-header">
          <h1>ScratchLowLevel</h1>
          <p>Editor-first workflow (compiler output stays debug-only).</p>
        </header>

        <section className="card">
          <header className="card-header">
            <h2>Project</h2>
          </header>
          <div className="card-body">
            <div className="project-actions">
              <button className="button-primary" onClick={downloadProject}>
                Export project
              </button>
              <label className="button-ghost">
                Import project
                <input type="file" accept="application/json" onChange={importProject} />
              </label>
            </div>
          </div>
        </section>

        {projectError ? (
          <p className="error-banner" role="alert">
            {projectError}
          </p>
        ) : null}

        <section className="card">
          <header className="card-header">
            <h2>Palette</h2>
          </header>
          <div className="card-body palette">
            {paletteKinds.map((kind) => (
              <button
                className="button-primary"
                key={kind}
                draggable
                onDragStart={(event) => event.dataTransfer.setData('application/block-kind', kind)}
                onClick={() => editorStore.insertBlock(kind, state.selectedId)}
              >
                + {kind}
              </button>
            ))}
          </div>
        </section>

        <section className="card">
          <header className="card-header">
            <h2>Extensions</h2>
          </header>
          <div className="card-body">
            <ul>
              {blocks.map((block) => (
                <li key={block.id}>
                  <strong>{block.name}</strong>
                  <span>{block.kind}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </aside>

      <main className="workspace">
        <section className="panel card">
          <header className="card-header">
            <h2>Workspace Graph</h2>
          </header>
          <div className="card-body">
            <div
              className="canvas"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(event) => {
                event.preventDefault();
                const kind = event.dataTransfer.getData('application/block-kind') as BlockKind;
                if (kind) editorStore.insertBlock(kind, state.selectedId);
              }}
            >
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
                  <div>
                    <strong>{node.label}</strong> <small>{node.id}</small>
                  </div>
                  <div className="node-actions">
                    <button
                      className="button-ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        editorStore.deleteBlock(node.id);
                      }}
                    >
                      Delete
                    </button>
                    <button
                      className="button-primary"
                      draggable
                      onDragStart={(e) => {
                        e.stopPropagation();
                        e.dataTransfer.setData('application/connect-from', node.id);
                      }}
                    >
                      Connect →
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <p className="hint">Keyboard: ↑/↓ move, Del delete, Ctrl/Cmd+Z undo, Ctrl/Cmd+Shift+Z redo.</p>
          </div>
          <footer className="card-footer">Drag blocks from palette to build control flow.</footer>
        </section>

        <section className="panel diagnostics card">
          <header className="card-header">
            <h2>Diagnostics</h2>
          </header>
          <div className="card-body">
            {state.diagnostics.length === 0 ? (
              <p>No issues.</p>
            ) : (
              <ul>
                {state.diagnostics.map((d, i) => (
                  <li key={`${d.message}-${i}`}>
                    {d.nodeId ? `${d.nodeId}: ` : ''}
                    {d.message}
                  </li>
                ))}
              </ul>
            )}
            <h3>Generated C (debug)</h3>
            <pre>{state.debugCOutput || '// build failed or no output yet'}</pre>
          </div>
        </section>
      </main>
    </div>
  );
}
