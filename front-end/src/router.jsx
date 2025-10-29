import { createBrowserRouter, Navigate } from 'react-router-dom';
import App from './App.jsx'; // We'll use App as our main layout
import HomePage from './pages/HomePage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx'; // We will create this
import SuperAdminDashboard from './pages/SuperAdminDashboard.jsx'; // We will create this
import ProtectedRoute from './components/ProtectedRoute.jsx';
import RoleProtectedRoute from './components/RoleProtectedRoute.jsx';
import SignUpPage from './pages/SignUpPage.jsx'; // Import the SignUpPage component
import ComplaintDetailPage from './pages/ComplaintDetailPage.jsx';
import MyComplaintsPage from './pages/MyComplaintsPage.jsx';
import LodgeComplaintPage from './pages/LodgeComplaintPage.jsx';
import AdminLayout from './layouts/AdminLayout.jsx';

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
      { index: true, element: <AdminDashboard /> }, // Default admin page
      // Add other admin sub-routes like /admin/users here later
    ],
  },
      {
        path: 'superadmin',
        element: (
          <RoleProtectedRoute role="super admin">
            <SuperAdminDashboard />
          </RoleProtectedRoute>
        ),
      },
      {
        path: 'my-complaints', 
        element: (
          <ProtectedRoute>
            <MyComplaintsPage />
          </ProtectedRoute>
        ),
      },
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