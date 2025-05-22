// src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import './styles/medical-theme.css';
import App from './App';
import ErrorBoundary from './components/ErrorBoundary';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);