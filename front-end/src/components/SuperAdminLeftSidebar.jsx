import React from 'react';
import { Link, useLocation } from 'react-router-dom';

function SuperAdminLeftSidebar() {
  const location = useLocation();
  const currentPath = location.pathname;
  const isActive = (path) => currentPath.startsWith(path);

  return (
    <aside className="hidden md:block w-full md:w-56 flex-shrink-0">
      <div className="bg-zinc-900 p-4 rounded-lg border border-zinc-700 shadow-lg h-full">
        <nav className="space-y-2">
          {/* Dashboard Link */}
          <Link
            to="/superadmin"
            className={`flex items-center p-3 rounded-lg ${
              location.pathname === '/superadmin' ? 'bg-purple-600 font-semibold text-white' : 'text-zinc-300 hover:bg-zinc-700 hover:text-white'
            }`}
          >
            Dashboard
          </Link>
          
          {/* User Management Link */}
          <Link
            to="/superadmin/users"
            className={`flex items-center p-3 rounded-lg ${
              isActive('/superadmin/users') ? 'bg-purple-600 font-semibold text-white' : 'text-zinc-300 hover:bg-zinc-700 hover:text-white'
            }`}
          >
            User Management
          </Link>

          {/* Create Admin Link */}
          <Link
            to="/superadmin/create-staff"
            className={`flex items-center p-3 rounded-lg ${
              isActive('/superadmin/create-staff') ? 'bg-purple-600 font-semibold text-white' : 'text-zinc-300 hover:bg-zinc-700 hover:text-white'
            }`}
          >
            Create Staff
          </Link>

          {/* Add Location Link */}
          <Link
            to="/superadmin/add-location"
            className={`flex items-center p-3 rounded-lg ${
              isActive('/superadmin/add-location') ? 'bg-purple-600 font-semibold text-white' : 'text-zinc-300 hover:bg-zinc-700 hover:text-white'
            }`}
          >
            Add Location
          </Link>
        </nav>
      </div>
    </aside>
  );
}

export default SuperAdminLeftSidebar;