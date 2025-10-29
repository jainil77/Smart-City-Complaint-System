import React from 'react';
import { Link, useLocation } from 'react-router-dom';

function AdminLeftSidebar() {
  const location = useLocation();
  const currentPath = location.pathname;
  const isActive = (path) => currentPath.startsWith(path); // Use startsWith for nested routes

  return (
    <aside className="w-full md:block  flex-shrink-0">
      <div className="bg-zinc-900 p-4 rounded-lg border border-zinc-700 shadow-lg h-full">
        <nav className="space-y-2">
          <Link
            to="/admin" // Link to the main admin dashboard
            className={`flex items-center p-3 rounded-lg ${isActive('/admin') ? 'bg-purple-600 font-semibold text-white' : 'text-zinc-300 hover:bg-zinc-700 hover:text-white'}`}
          >
            Complaints Dashboard
          </Link>
          {/* Add links for other admin functions later */}
          {/* <Link to="/admin/users" className="...">User Management</Link> */}
        </nav>
      </div>
    </aside>
  );
}

export default AdminLeftSidebar;