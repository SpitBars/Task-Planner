import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import RootLayout from './routes/RootLayout.jsx';
import DashboardPage from './routes/DashboardPage.jsx';
import './index.css';

const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      {
        index: true,
        element: <DashboardPage />
      },
      {
        path: 'calendar',
        element: <DashboardPage />
      },
      {
        path: 'analytics',
        element: <DashboardPage />
      },
      {
        path: 'settings',
        element: <DashboardPage />
      }
    ]
  }
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
