import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { FarcasterProvider } from './context/FarcasterContext.tsx';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <FarcasterProvider>
      <App />
    </FarcasterProvider>
  </React.StrictMode>,
);
