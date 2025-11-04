import { createBrowserRouter, Navigate } from 'react-router-dom';
import App from './App.jsx'; 
import HomePage from './pages/HomePage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx'; 
import SuperAdminDashboard from './pages/SuperAdminDashboard.jsx'; 
import ProtectedRoute from './components/ProtectedRoute.jsx';
import RoleProtectedRoute from './components/RoleProtectedRoute.jsx';
import SignUpPage from './pages/SignUpPage.jsx'; 
import ComplaintDetailPage from './pages/ComplaintDetailPage.jsx';
import MyComplaintsPage from './pages/MyComplaintsPage.jsx';
import LodgeComplaintPage from './pages/LodgeComplaintPage.jsx';
import AdminLayout from './layouts/AdminLayout.jsx';
import UserManagementPage from './pages/UserManagementPage.jsx';
import SuperAdminLayout from './layouts/SuperAdminLayout.jsx'; 
import SuperAdminDashboardPage from './pages/SuperAdminDashboard.jsx';
import UserComplaintListPage from './pages/UserComplaintListPage.jsx';
import CreateAdminPage from './pages/CreateAdminPage.jsx';
import AddLocationPage from './pages/AddLocationPage.jsx';
import MapPage from './pages/MapPage.jsx';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />, // App component is the layout shell
    children: [
      {
        index: true, // This makes HomePage the default child for "/"
        element: 
          
            <HomePage />

      },
      {
        path: 'lodge-complaint', // The path users navigate to
        element: (
          <ProtectedRoute> {/* Make sure this wrapper is present */}
            <LodgeComplaintPage /> 
          </ProtectedRoute>
        ),
      },
      {
        path: 'complaint/:id', 
        element: <ComplaintDetailPage />,
      },
      {
    path: '/admin', // Separate top-level route
    element: (
      <RoleProtectedRoute role="admin">
        <AdminLayout /> {/* AdminLayout contains Header + AdminSidebar + Outlet */}
      </RoleProtectedRoute>
    ),
    children: [
      { index: true, element: <AdminDashboard /> },
      { path: 'users', element: <UserManagementPage /> }, 
    ],
  },
      {
    path: '/superadmin', // Separate top-level route
    element: (
      <RoleProtectedRoute role="superadmin">
        <SuperAdminLayout /> {/* Use the SuperAdminLayout */}
      </RoleProtectedRoute>
    ),
    children: [
      { index: true, element: <SuperAdminDashboardPage /> }, 
      { path: 'users', element: <UserManagementPage /> }, 
      { path: 'users/:userId', element: <UserComplaintListPage /> },
      { path: 'create-admin', element: <CreateAdminPage/> }, 
      { path: 'add-location', element: <AddLocationPage/> }
    ],
  },
      {
        path: 'my-complaints', 
        element: (
          <ProtectedRoute>
            <MyComplaintsPage />
          </ProtectedRoute>
        ),
      },
      { path: 'map', element: <MapPage /> },
    ],
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/signup', // 👈 Add this new route object
    element: <SignUpPage />,
  },
  {
    // If a user goes to any other path, redirect them
    path: '*',
    element: <Navigate to="/" />,
  },
]);