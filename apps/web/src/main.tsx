import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles.css';
import { assertCompatibleApiVersion, EXTENSION_API_VERSION } from './compiler/extensions';
import { ErrorBoundary } from './ErrorBoundary';

const root = document.getElementById('root');
if (!root) throw new Error('Missing root element.');
const rootElement: HTMLElement = root;

function renderFatal(title: string, message: string): void {
  ReactDOM.createRoot(rootElement).render(
    <div className="fatal-state" role="alert">
      <h1>{title}</h1>
      <p>{message}</p>
    </div>,
  );
}

window.addEventListener('error', (event) => {
  renderFatal('Runtime error', event.message || 'An unexpected runtime error occurred.');
});

window.addEventListener('unhandledrejection', (event) => {
  const reason =
    event.reason instanceof Error ? event.reason.message : String(event.reason ?? 'Unknown rejection');
  renderFatal('Unhandled promise rejection', reason);
});

try {
  assertCompatibleApiVersion(EXTENSION_API_VERSION);
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </React.StrictMode>,
  );
} catch (error) {
  const message = error instanceof Error ? error.message : 'Build initialization failed.';
  renderFatal('Startup failure', message);
}
