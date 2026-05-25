import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles.css';
import { assertCompatibleApiVersion, EXTENSION_API_VERSION } from './compiler/extensions';

assertCompatibleApiVersion(EXTENSION_API_VERSION);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
