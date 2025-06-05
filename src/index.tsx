// src/index.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/index.css'; // Main CSS (includes Tailwind)
import App from './App';
// Ensure global types are declared if you have them (e.g. for __app_id)
import './types'; // This will execute declare global if it's in types/index.ts

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
