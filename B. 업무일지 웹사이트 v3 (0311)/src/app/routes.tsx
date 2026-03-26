import { createBrowserRouter } from 'react-router';
import { Layout } from './components/Layout';
import { EmployeePage } from './components/EmployeePage';
import { AdminPage } from './components/AdminPage';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: Layout,
    children: [
      { index: true, Component: EmployeePage },
      { path: 'admin', Component: AdminPage },
    ],
  },
]);
