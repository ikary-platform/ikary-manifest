import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import '@ikary-manifest/primitives/registry';
import './index.css';
import { App } from './App';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter basename="/ikary-manifest/playground">
      <App />
    </BrowserRouter>
  </React.StrictMode>,
);
