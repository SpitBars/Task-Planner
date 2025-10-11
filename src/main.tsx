import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { TaskProvider } from './state/TaskContext';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './styles/global.css';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <TaskProvider>
      <App />
    </TaskProvider>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
