import React from 'react';
import ReactDOM from 'react-dom/client';
import '@ikary-manifest/primitives/registry';
import './index.css';
import { App } from './App';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
