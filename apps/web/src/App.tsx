import { useMemo, useState } from 'react';
import { defaultBlocks } from './compiler/blocks';
import { sampleProject } from './compiler/sample';
import { compileProjectJsonToCWithErrors } from './compiler/index';

export default function App() {
  const [project] = useState(sampleProject);
  const compileResult = useMemo(() => compileProjectJsonToCWithErrors(project), [project]);

  return (
    <div className="shell">
      <aside className="panel">
        <h1>ScratchLowLevel</h1>
        <p>Block-based compiler front end.</p>
        <h2>Blocks</h2>
        <ul>
          {defaultBlocks.map((block) => (
            <li key={block.id}>
              <strong>{block.name}</strong>
              <span>{block.kind}</span>
            </li>
          ))}
        </ul>
      </aside>

      <main className="workspace">
        <section className="panel">
          <h2>Workspace</h2>
          <div className="canvas">
            <p>Drop blocks here later.</p>
          </div>
        </section>

        <section className="panel">
          <h2>C Output</h2>
          {compileResult.ok ? (
            <pre>{compileResult.c}</pre>
          ) : (
            <pre>{`[${compileResult.error.code}] ${compileResult.error.message}`}</pre>
          )}
        </section>
      </main>
    </div>
  );
}
